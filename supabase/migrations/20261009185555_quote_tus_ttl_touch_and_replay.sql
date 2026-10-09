-- Preserve quota against 2h signed token + 24h TUS URL + 1h safety margin.
-- Renew draft and attachment retention after authenticated storage actions.
-- Allow replay receipt lookup before charging another submit attempt.
alter table public.quote_attachments alter column grant_expires_at
  set default (now() + interval '27 hours');

create function public.quote_touch_draft(p_request_id uuid)
returns void language plpgsql security invoker set search_path = ''
as $$
declare v_new_expiry timestamptz := transaction_timestamp() + interval '24 hours';
begin
  update public.quote_requests
    set last_activity_at=transaction_timestamp(),
        updated_at=transaction_timestamp(), expires_at=v_new_expiry
  where id=p_request_id and lifecycle_status='draft'
    and expires_at>transaction_timestamp();
  if not found then raise exception 'quote_draft_unavailable' using errcode='P0001'; end if;

  update public.quote_attachments
    set expires_at=v_new_expiry,updated_at=transaction_timestamp()
  where quote_request_id=p_request_id and quota_released_at is null
    and expires_at < v_new_expiry;
end
$$;
revoke all on function public.quote_touch_draft(uuid) from public,anon,authenticated;
grant execute on function public.quote_touch_draft(uuid) to service_role;

create or replace function public.quote_reserve_attachment(
  p_request_id uuid,
  p_owner_session_hash text,
  p_upload_key uuid,
  p_original_name text,
  p_extension text,
  p_reported_mime text,
  p_size_bytes bigint
)
returns table (attachment_id uuid, object_path text, reservation_expires_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request_id uuid;
  v_existing public.quote_attachments%rowtype;
  v_new_id uuid;
begin
  if p_request_id is null or p_upload_key is null or
     p_owner_session_hash is null or p_owner_session_hash !~ '^[a-f0-9]{64}$' or
     p_original_name is null or
     char_length(p_original_name) not between 1 and 255 or
     p_extension not in (
       '.stl','.3mf','.obj','.step','.stp','.pdf',
       '.png','.jpg','.jpeg','.webp'
     ) or
     right(lower(p_original_name), char_length(p_extension)) <> p_extension or
     p_size_bytes is null or p_size_bytes not between 1 and 50000000 or
     (p_reported_mime is not null and char_length(p_reported_mime) > 120)
  then
    raise exception 'invalid_quote_upload_request' using errcode = '22023';
  end if;

  select q.id into v_request_id
    from public.quote_requests q
    where q.id = p_request_id
      and q.owner_session_hash = p_owner_session_hash
      and q.lifecycle_status = 'draft'
      and q.expires_at > transaction_timestamp()
    for update;
  if not found then
    raise exception 'quote_draft_unavailable' using errcode = 'P0001';
  end if;

  perform public.quote_touch_draft(p_request_id);

  select a.* into v_existing
    from public.quote_attachments a
    where a.quote_request_id = p_request_id
      and a.upload_key = p_upload_key
    for update;
  if found then
    if v_existing.quota_released_at is not null or
       v_existing.grant_expires_at <= transaction_timestamp() or
       v_existing.validation_status not in ('pending-upload','uploaded') or
       v_existing.original_name <> p_original_name or
       v_existing.extension <> p_extension or
       v_existing.size_bytes <> p_size_bytes or
       v_existing.reported_mime is distinct from p_reported_mime then
      raise exception 'upload_key_conflict' using errcode = '23505';
    end if;
    return query
      select v_existing.id, v_existing.storage_path, v_existing.grant_expires_at;
    return;
  end if;

  v_new_id := gen_random_uuid();
  insert into public.quote_attachments (
    id, quote_request_id, upload_key, storage_path, original_name,
    extension, reported_mime, size_bytes, accounted_bytes, grant_expires_at
  )
  values (
    v_new_id, p_request_id, p_upload_key,
    p_request_id::text || '/' || v_new_id::text || p_extension,
    p_original_name, p_extension, p_reported_mime,
    p_size_bytes, 50000000, transaction_timestamp() + interval '27 hours'
  )
  returning * into v_existing;

  return query
    select v_existing.id, v_existing.storage_path, v_existing.grant_expires_at;
end
$$;

create or replace function public.quote_validate_attachment(
  p_request_id uuid,p_owner_session_hash text,p_attachment_id uuid,
  p_actual_size_bytes bigint,p_detected_type text
) returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  v_request_id uuid;
  v_attachment public.quote_attachments%rowtype;
  v_storage_size bigint;
begin
  if p_actual_size_bytes is null or
     p_actual_size_bytes not between 1 and 50000000 or
     p_detected_type is null or
     p_detected_type not in ('stl-binary','stl-ascii','3mf-zip','obj-text',
       'step-text','pdf','png','jpeg','webp') then
    raise exception 'invalid_quote_file_validation' using errcode='22023';
  end if;
  select q.id into v_request_id from public.quote_requests q
    where q.id=p_request_id and q.owner_session_hash=p_owner_session_hash
      and q.lifecycle_status='draft' and q.expires_at>transaction_timestamp()
    for update;
  if not found then
    raise exception 'quote_draft_unavailable' using errcode='P0001';
  end if;

  perform public.quote_touch_draft(p_request_id);
  select a.* into v_attachment from public.quote_attachments a
    where a.id=p_attachment_id and a.quote_request_id=p_request_id
      and a.quota_released_at is null for update;
  if not found then
    raise exception 'quote_attachment_unavailable' using errcode='P0001';
  end if;
  if v_attachment.validation_status='validated' then
    if v_attachment.validated_size_bytes=p_actual_size_bytes and
       v_attachment.detected_type=p_detected_type then return true; end if;
    raise exception 'quote_file_validation_conflict' using errcode='23505';
  end if;
  if v_attachment.validation_status not in ('pending-upload','uploaded') or
     v_attachment.size_bytes<>p_actual_size_bytes then
    raise exception 'quote_file_size_or_state_mismatch' using errcode='23514';
  end if;
  select case when o.metadata->>'size' ~ '^[0-9]+$'
         then (o.metadata->>'size')::bigint else null end
    into v_storage_size from storage.objects o
    where o.bucket_id='quote-intake' and o.name=v_attachment.storage_path
    limit 1;
  if v_storage_size is distinct from p_actual_size_bytes then
    raise exception 'quote_storage_size_mismatch' using errcode='23514';
  end if;
  update public.quote_attachments set
    validation_status='validated',validated_size_bytes=p_actual_size_bytes,
    accounted_bytes=p_actual_size_bytes,detected_type=p_detected_type,
    uploaded_at=transaction_timestamp(),validated_at=transaction_timestamp(),
    updated_at=transaction_timestamp()
  where id=p_attachment_id;
  return true;
end $$;

create function public.quote_submission_receipt(
  p_request_id uuid,p_owner_session_hash text,p_submission_key uuid
) returns table(request_id uuid,submission_time timestamptz)
language sql stable security invoker set search_path = ''
as $$
  select q.id,q.submitted_at from public.quote_requests q
  where q.id=p_request_id and q.owner_session_hash=p_owner_session_hash
    and q.submission_key=p_submission_key and q.submitted_at is not null
    and q.lifecycle_status in ('submitted','reviewing','closed')
$$;
revoke all on function public.quote_submission_receipt(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.quote_submission_receipt(uuid,text,uuid) to service_role;
