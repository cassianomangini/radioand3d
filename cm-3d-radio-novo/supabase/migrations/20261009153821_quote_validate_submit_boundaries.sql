-- Owner-bound read, storage verification and atomic idempotent quote submit.
-- All RPCs SECURITY INVOKER; only service_role can execute. No public policies.
create function public.quote_owned_attachment(
  p_request_id uuid,p_owner_session_hash text,p_attachment_id uuid
) returns table(
  attachment_id uuid,storage_path text,original_name text,extension text,
  reported_size_bytes bigint,validation_status text,validated_size_bytes bigint
) language sql stable security invoker set search_path = ''
as $$
  select a.id,a.storage_path,a.original_name,a.extension,a.size_bytes,
         a.validation_status,a.validated_size_bytes
  from public.quote_requests q
  join public.quote_attachments a on a.quote_request_id=q.id
  where q.id=p_request_id and q.owner_session_hash=p_owner_session_hash
    and q.lifecycle_status='draft' and q.expires_at>transaction_timestamp()
    and a.id=p_attachment_id and a.quota_released_at is null
$$;
revoke all on function public.quote_owned_attachment(uuid,text,uuid)
  from public,anon,authenticated;
grant execute on function public.quote_owned_attachment(uuid,text,uuid)
  to service_role;

create function public.quote_validate_attachment(
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
revoke all on function public.quote_validate_attachment(uuid,text,uuid,bigint,text)
  from public,anon,authenticated;
grant execute on function public.quote_validate_attachment(uuid,text,uuid,bigint,text)
  to service_role;

create function public.quote_submit(
  p_request_id uuid,p_owner_session_hash text,p_submission_key uuid,
  p_project_type text,p_no_file boolean,p_starting_points text[],
  p_source_origin text,p_source_reference text,p_production jsonb,p_project jsonb,
  p_contact_method text,p_contact_name text,p_contact_value text,
  p_triage_status text,p_attachment_ids uuid[]
) returns table(request_id uuid,submission_time timestamptz)
language plpgsql security invoker set search_path = ''
as $$
declare
  v_q public.quote_requests%rowtype;
  v_count integer;
  v_valid_count integer;
  v_total bigint;
  v_distinct_count integer;
  v_match_count integer;
begin
  if p_request_id is null or p_submission_key is null or
     p_owner_session_hash is null or p_owner_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quote_submit' using errcode='22023';
  end if;
  select q.* into v_q from public.quote_requests q
    where q.id=p_request_id and q.owner_session_hash=p_owner_session_hash
    for update;
  if not found then
    raise exception 'quote_draft_unavailable' using errcode='P0001';
  end if;
  if v_q.lifecycle_status in ('submitted','reviewing','closed') then
    if v_q.submission_key=p_submission_key then
      return query select v_q.id,v_q.submitted_at;
      return;
    end if;
    raise exception 'quote_already_submitted' using errcode='23505';
  end if;
  if v_q.lifecycle_status<>'draft' or v_q.expires_at<=transaction_timestamp() or
     v_q.project_type is distinct from p_project_type or
     p_no_file is null or
     p_contact_method is null or p_contact_method not in ('email','whatsapp') or
     p_triage_status is null or p_triage_status not in ('ready-for-review','needs-information') or
     char_length(btrim(coalesce(p_contact_name,''))) not between 1 and 160 or
     char_length(btrim(coalesce(p_contact_value,''))) not between 1 and 320 or
     p_attachment_ids is null or cardinality(p_attachment_ids)>5 or
     array_position(p_attachment_ids,null) is not null or
     p_production is null or jsonb_typeof(p_production)<>'object' or
     p_project is null or jsonb_typeof(p_project)<>'object' or
     p_starting_points is null or cardinality(p_starting_points)>12 or
     array_position(p_starting_points,null) is not null or
     p_project_type<>'impressao' and cardinality(p_starting_points)=0 then
    raise exception 'invalid_quote_submit_payload' using errcode='22023';
  end if;

  select count(*),
         count(*) filter (where validation_status='validated'
           and validated_size_bytes is not null),
         coalesce(sum(coalesce(validated_size_bytes,0)),0)
    into v_count,v_valid_count,v_total
    from public.quote_attachments
    where quote_request_id=p_request_id and quota_released_at is null;

  select count(distinct x),count(*) filter (
      where exists (
        select 1 from public.quote_attachments a
        where a.id=u.x and a.quote_request_id=p_request_id
          and a.quota_released_at is null))
    into v_distinct_count,v_match_count
    from unnest(p_attachment_ids) as u(x);

  if v_count<>cardinality(p_attachment_ids) or
     v_valid_count<>v_count or v_distinct_count<>v_count or
     v_match_count<>v_count or
     v_total>100000000 or
     (p_no_file and v_count<>0) or
     (not p_no_file and v_count=0) or
     (p_project_type='impressao' and (v_count=0 or p_no_file)) then
    raise exception 'quote_attachments_not_validated' using errcode='23514';
  end if;

  update public.quote_requests set
    lifecycle_status='submitted',submission_key=p_submission_key,
    submitted_at=transaction_timestamp(),triage_status=p_triage_status,
    no_file=p_no_file,starting_points=p_starting_points,
    source_origin=p_source_origin,source_reference=p_source_reference,
    production=p_production,project=p_project,
    contact_method=p_contact_method,contact_name=btrim(p_contact_name),
    contact_value=btrim(p_contact_value),
    expires_at=transaction_timestamp()+interval '180 days',
    last_activity_at=transaction_timestamp(),updated_at=transaction_timestamp()
  where id=p_request_id;

  update public.quote_attachments
    set expires_at=transaction_timestamp()+interval '90 days',
        updated_at=transaction_timestamp()
    where quote_request_id=p_request_id and quota_released_at is null;

  insert into public.quote_events(quote_request_id,event_type,event_status)
    values(p_request_id,'submit','accepted');
  return query select p_request_id,transaction_timestamp();
end $$;
revoke all on function public.quote_submit(
  uuid,text,uuid,text,boolean,text[],text,text,jsonb,jsonb,text,text,text,text,uuid[]
) from public,anon,authenticated;
grant execute on function public.quote_submit(
  uuid,text,uuid,text,boolean,text[],text,text,jsonb,jsonb,text,text,text,text,uuid[]
) to service_role;
