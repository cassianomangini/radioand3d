
-- E2/P4: private intake bucket with conservative, transaction-safe capacity control.
-- Only CM 3D & Radio. No grants for anon/authenticated, no personal data.

insert into storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
values
  ('quote-intake', 'quote-intake', false, 50000000, null);

create table public.quote_upload_limits (
  bucket_id text primary key check (bucket_id = 'quote-intake'),
  max_bytes bigint not null check (max_bytes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.quote_upload_limits(bucket_id, max_bytes)
values ('quote-intake', 600000000);

alter table public.quote_upload_limits enable row level security;
revoke all on table public.quote_upload_limits from public, anon, authenticated;
grant select, update on table public.quote_upload_limits to service_role;

alter table public.quote_attachments
  add column upload_key uuid not null,
  add column accounted_bytes bigint not null default 50000000
    check (accounted_bytes between 1 and 50000000),
  add column quota_released_at timestamptz,
  add column grant_expires_at timestamptz not null
    default (now() + interval '3 hours'),
  add constraint quote_attachment_upload_unique unique (quote_request_id, upload_key),
  add constraint quote_attachment_free_limit check (
    size_bytes <= 50000000
    and (validated_size_bytes is null or validated_size_bytes <= 50000000)
  );

create index quote_attachments_held_budget_idx
  on public.quote_attachments (quote_request_id, accounted_bytes)
  where quota_released_at is null;

-- Server-only accounting. Every INSERT / UPDATE (including direct service-role
-- writes) locks the same singleton budget row, preventing overbooking races.
-- Until the real object is verified, reserve 50MB *per upload token*:
-- the browser controls upload-length, so declared size is NOT a safe reservation.
create function public.quote_attachment_capacity_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_max bigint;
  v_other_used numeric;
  v_request_used numeric;
  v_request_count bigint;
  v_storage_size bigint;
begin
  select max_bytes into v_max
    from public.quote_upload_limits
    where bucket_id = 'quote-intake'
    for update;
  if v_max is null then
    raise exception 'quota_not_configured' using errcode = 'P0001';
  end if;

  if tg_op = 'UPDATE' and old.quota_released_at is not null then
    if new.quota_released_at is distinct from old.quota_released_at
       or new.accounted_bytes is distinct from old.accounted_bytes then
      raise exception 'released_reservation_is_immutable' using errcode = '23514';
    end if;
  end if;

  if new.validated_size_bytes is not null then
    if new.accounted_bytes <> new.validated_size_bytes then
      raise exception 'validated_size_accounting_mismatch' using errcode = '23514';
    end if;
    if tg_op = 'INSERT' or
       (tg_op = 'UPDATE' and old.validated_size_bytes is distinct from new.validated_size_bytes) then
      select case
        when o.metadata->>'size' ~ '^[0-9]+$'
          then (o.metadata->>'size')::bigint
        else null
        end
      into v_storage_size
      from storage.objects o
      where o.bucket_id = 'quote-intake'
        and o.name = new.storage_path
      limit 1;
      if v_storage_size is distinct from new.validated_size_bytes then
        raise exception 'storage_size_not_verified' using errcode = '23514';
      end if;
    end if;
  elsif new.accounted_bytes <> 50000000 then
    raise exception 'unverified_upload_must_reserve_full_file_size' using errcode = '23514';
  end if;

  if new.validation_status = 'validated' and new.validated_size_bytes is null then
    raise exception 'validated_upload_requires_verified_bytes' using errcode = '23514';
  end if;

  if new.quota_released_at is not null and
     (tg_op = 'INSERT' or (tg_op = 'UPDATE' and old.quota_released_at is null)) then
    if new.validation_status not in ('expired', 'rejected') or
       new.grant_expires_at > transaction_timestamp() or
       new.quota_released_at > transaction_timestamp() or
       exists (
         select 1 from storage.objects o
         where o.bucket_id = 'quote-intake' and o.name = new.storage_path
       ) then
      raise exception 'cannot_release_live_or_present_upload' using errcode = '23514';
    end if;
  end if;

  select coalesce(sum(a.accounted_bytes), 0)
    into v_other_used
    from public.quote_attachments a
    where a.quota_released_at is null
      and a.id is distinct from new.id;

  if v_other_used +
    (case when new.quota_released_at is null then new.accounted_bytes else 0 end) > v_max then
    raise exception 'quote_storage_capacity_exceeded' using errcode = '23514';
  end if;

  select count(*), coalesce(sum(a.accounted_bytes), 0)
    into v_request_count, v_request_used
    from public.quote_attachments a
    where a.quote_request_id = new.quote_request_id
      and a.quota_released_at is null
      and a.id is distinct from new.id;

  if v_request_count +
       (case when new.quota_released_at is null then 1 else 0 end) > 5
    or v_request_used +
       (case when new.quota_released_at is null then new.accounted_bytes else 0 end) > 100000000 then
    raise exception 'quote_request_attachment_budget_exceeded' using errcode = '23514';
  end if;

  return new;
end
$$;

revoke all on function public.quote_attachment_capacity_guard()
  from public, anon, authenticated;
create trigger quote_attachment_capacity_guard
  before insert or update on public.quote_attachments
  for each row execute function public.quote_attachment_capacity_guard();

-- Only the server's service-role client can call this RPC. It checks
-- BOTH draft ID and the HMAC-bound owner digest and serializes via row locks.
create function public.quote_reserve_attachment(
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
    p_size_bytes, 50000000, transaction_timestamp() + interval '3 hours'
  )
  returning * into v_existing;

  return query
    select v_existing.id, v_existing.storage_path, v_existing.grant_expires_at;
end
$$;

revoke all on function public.quote_reserve_attachment(
  uuid, text, uuid, text, text, text, bigint
) from public, anon, authenticated;
grant execute on function public.quote_reserve_attachment(
  uuid, text, uuid, text, text, text, bigint
) to service_role;

-- Intentional: no bucket public policy and no anon/authenticated quote grants.
-- The later server integration must check Origin/session, request ownership and
-- an upload-key retry policy before issuing a signed TUS token for object_path.
