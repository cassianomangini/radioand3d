-- CM 3D & Radio ONLY. DO NOT apply before measuring this project's
-- actual Supabase Storage usage, available capacity and retention health.
-- Safe fail-closed gate: until storage_reviewed_at and max_daily_bytes are
-- explicitly configured after owner approval, ALL new signed uploads are blocked.
-- Links-only requests do not use upload capacity and remain available.
-- Supabase project connected to Artesopolis is NOT the target.
--
-- Preserves the global pessimistic reservation (50 MB per signed TUS token)
-- and owner-pending guard. Changes the per-request logical limit to the
-- SUM OF DECLARED bytes (50 MB). Actual uploaded bytes must match declared
-- size at verification, or submission cannot succeed. Rejected/orphaned
-- objects remain globally reserved until the retention worker deletes them.
--
-- No automatic approval of the historic 600 MB global cap.
alter table public.quote_upload_limits
  add column if not exists max_daily_bytes bigint
    check (max_daily_bytes is null or max_daily_bytes > 0),
  add column if not exists storage_reviewed_at timestamptz;

create table if not exists public.quote_upload_daily_usage (
  day_utc date primary key,
  reserved_bytes bigint not null default 0 check (reserved_bytes >= 0),
  updated_at timestamptz not null default now()
);
alter table public.quote_upload_daily_usage enable row level security;
revoke all on public.quote_upload_daily_usage from public, anon, authenticated;
grant select, insert, update on public.quote_upload_daily_usage to service_role;

-- Request limit: five attachments and 50 MB declared total.
-- Global limit still reserves up to 50 MB per signed upload grant.
create or replace function public.quote_attachment_capacity_guard()
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

  select count(*), coalesce(sum(a.size_bytes), 0)
    into v_request_count, v_request_used
    from public.quote_attachments a
    where a.quote_request_id = new.quote_request_id
      and a.quota_released_at is null
      and a.id is distinct from new.id;

  if v_request_count +
       (case when new.quota_released_at is null then 1 else 0 end) > 5
    or v_request_used +
       (case when new.quota_released_at is null then new.size_bytes else 0 end) > 50000000 then
    raise exception 'quote_request_attachment_budget_exceeded' using errcode = '23514';
  end if;

  return new;
end
$$;

-- Restrict the actual RPC used to reserve TUS grants; keep retries
-- idempotent and never charge the daily counter twice for one upload key.
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
  v_daily_limit bigint;
  v_daily_used bigint;
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
     p_size_bytes is null or p_size_bytes < 1 or
     (p_extension in ('.stl','.3mf') and p_size_bytes > 30000000) or
     (p_extension not in ('.stl','.3mf') and p_size_bytes > 5000000) or
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

  -- Configure quotas based on the REAL CM 3D & Radio project capacity
  -- before enabling uploads. A missing approval fails closed.
  select max_daily_bytes into v_daily_limit
  from public.quote_upload_limits
  where bucket_id = 'quote-intake' and storage_reviewed_at is not null
  for update;
  if v_daily_limit is null then
    raise exception 'quote_upload_budget_not_approved' using errcode = '23514';
  end if;

  -- Signed TUS tokens do not bind upload-length. Charge the pessimistic
  -- 50 MB bucket maximum for each NEW grant (not for idempotent retries).
  insert into public.quote_upload_daily_usage(day_utc, reserved_bytes)
  values ((transaction_timestamp() at time zone 'UTC')::date, 50000000)
  on conflict (day_utc) do update
  set reserved_bytes = public.quote_upload_daily_usage.reserved_bytes + excluded.reserved_bytes
  returning reserved_bytes into v_daily_used;
  if v_daily_used > v_daily_limit then
    raise exception 'quote_upload_daily_capacity_exceeded' using errcode = '23514';
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
revoke all on function public.quote_reserve_attachment(
  uuid, text, uuid, text, text, text, bigint
) from public, anon, authenticated;
grant execute on function public.quote_reserve_attachment(
  uuid, text, uuid, text, text, text, bigint
) to service_role;

-- Enforce the same validated-total ceiling at finalization.
create or replace function public.quote_submit(
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
     v_total>50000000 or
     (p_no_file and v_count<>0) or
     (not p_no_file and v_count=0) or
     (p_project_type='impressao' and (
       p_project->>'kind' is distinct from 'impressao' or
       (p_no_file and (
         p_project->>'modelLink' is null or
         char_length(p_project->>'modelLink') > 2000 or
         not (p_project->>'modelLink' ~* '^https://((www\.)?makerworld\.com/([a-z]{2}(-[a-z]{2})?/)?models/[0-9]+(-[^/?#]+)?/?|share\.bambulab\.com/[a-z0-9_-]+/?)([?#].*)?$')
       )) or
       (not p_no_file and p_project->>'modelLink' is not null)
     )) then
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

-- Activation runbook, to be executed ONLY in the correct project after
-- measuring capacity and obtaining approval:
-- 1) Check sum(accounted_bytes) active and physical storage.objects size.
-- 2) Confirm retention cron succeeded recently (not merely configured).
-- 3) Choose a conservative max_bytes and max_daily_bytes. Existing
--    quote_upload_limits.max_bytes may be 600000000; DO NOT assume it fits.
-- 4) Under owner approval, update quote_upload_limits SET max_bytes = ...,
--    max_daily_bytes = ..., storage_reviewed_at = now()
--    WHERE bucket_id='quote-intake'.
-- 5) Verify insufficient-capacity and concurrent reservations fail closed.
-- 6) Only then enable CM_QUOTE_MULTIMODEL_ENABLED=true in Vercel.
