-- CM 3D & Radio ONLY. Apply to the separate CM Supabase project after review.
-- No changes to Artesopolis. This migration is NOT applied by this PR.
--
-- Capacity is already reserved pessimistically by the existing trigger:
-- 50 MB per outstanding signed TUS authorization, 600 MB globally.
-- This extra trigger serializes against the same quota row and caps unverified
-- grants to two per anonymous cookie owner across ALL active drafts.
create or replace function public.quote_owner_pending_guard()
returns trigger language plpgsql security invoker set search_path = ''
as $$
declare
  v_owner text;
  v_pending integer;
  v_limit bigint;
begin
  -- quote_attachment_capacity_guard locks this same singleton row first;
  -- lock here as well so all owner-pending counts are serialized.
  select max_bytes into v_limit from public.quote_upload_limits
    where bucket_id = 'quote-intake' for update;
  if v_limit is null then
    raise exception 'quote_upload_limit_missing' using errcode='23514';
  end if;

  if new.quota_released_at is not null or
     new.validation_status not in ('pending-upload','uploaded') then
    return new;
  end if;

  select q.owner_session_hash into v_owner from public.quote_requests q
    where q.id = new.quote_request_id;
  if v_owner is null then
    raise exception 'quote_owner_missing' using errcode='23514';
  end if;

  select count(*) into v_pending
  from public.quote_attachments a
  join public.quote_requests q on q.id = a.quote_request_id
  where q.owner_session_hash = v_owner
    and a.quota_released_at is null
    and a.validation_status in ('pending-upload','uploaded')
    and a.id is distinct from new.id;

  if v_pending >= 2 then
    raise exception 'quote_owner_pending_upload_limit' using errcode='23514';
  end if;
  return new;
end $$;
revoke all on function public.quote_owner_pending_guard() from public, anon, authenticated;

create trigger quote_owner_pending_guard
  before insert or update of validation_status, quote_request_id, quota_released_at
  on public.quote_attachments
  for each row execute function public.quote_owner_pending_guard();

-- A structurally valid ZIP, STL, PDF or image is NOT malware-cleared.
-- Every attachment begins in private quarantine; even historic attachments
-- are backfilled as PENDING, never implicitly marked safe.
create table public.quote_attachment_scans (
  attachment_id uuid primary key references public.quote_attachments(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending','scanning','clean','infected','error')),
  attempt_count integer not null default 0 check (attempt_count between 0 and 100),
  lease_token uuid,
  lease_until timestamptz,
  next_attempt_at timestamptz not null default now(),
  sha256 text check (sha256 is null or sha256 ~ '^[a-f0-9]{64}$'),
  scanner text check (scanner is null or char_length(scanner) between 1 and 80),
  scanned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_scan_lease_consistent check (
    (status = 'scanning' and lease_token is not null and lease_until is not null)
    or (status <> 'scanning' and lease_token is null and lease_until is null)
  )
);
create index quote_scans_pending_idx on public.quote_attachment_scans(status, next_attempt_at);

alter table public.quote_attachment_scans enable row level security;
revoke all on public.quote_attachment_scans from public, anon, authenticated;
grant select, insert, update on public.quote_attachment_scans to service_role;

create function public.quote_enqueue_attachment_scan()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  insert into public.quote_attachment_scans(attachment_id) values (new.id);
  return new;
end $$;
revoke all on function public.quote_enqueue_attachment_scan() from public, anon, authenticated;
create trigger quote_enqueue_attachment_scan
  after insert on public.quote_attachments
  for each row execute function public.quote_enqueue_attachment_scan();

insert into public.quote_attachment_scans(attachment_id)
select id from public.quote_attachments
on conflict (attachment_id) do nothing;

-- A dedicated isolated ClamAV worker claims only structurally verified objects.
-- Unverified/rejected objects are never handed out. SKIP LOCKED prevents
-- concurrent claims; a scoped lease token is required to record the verdict.
create function public.quote_claim_attachment_scan()
returns table (
  attachment_id uuid,
  object_path text,
  expected_size bigint,
  lease_token uuid
)
language plpgsql security invoker set search_path = ''
as $$
declare
  v_attachment_id uuid;
  v_token uuid := gen_random_uuid();
begin
  select s.attachment_id into v_attachment_id
    from public.quote_attachment_scans s
    join public.quote_attachments a on a.id = s.attachment_id
    where a.storage_bucket = 'quote-intake'
      and a.validation_status = 'validated'
      and a.quota_released_at is null
      and a.validated_size_bytes between 1 and 50000000
      and s.attempt_count < 3
      and (
        (s.status in ('pending','error') and s.next_attempt_at <= transaction_timestamp())
        or (s.status='scanning' and s.lease_until <= transaction_timestamp())
      )
    order by s.next_attempt_at, s.created_at
    for update of s skip locked
    limit 1;
  if not found then return; end if;

  update public.quote_attachment_scans s
    set status='scanning', lease_token=v_token,
        lease_until=transaction_timestamp() + interval '15 minutes',
        attempt_count=s.attempt_count+1, updated_at=transaction_timestamp()
    where s.attachment_id=v_attachment_id;

  return query
    select a.id,a.storage_path,a.validated_size_bytes,v_token
    from public.quote_attachments a where a.id=v_attachment_id;
end $$;
revoke all on function public.quote_claim_attachment_scan() from public, anon, authenticated;
grant execute on function public.quote_claim_attachment_scan() to service_role;

create function public.quote_finish_attachment_scan(
  p_attachment_id uuid,
  p_lease_token uuid,
  p_verdict text,
  p_sha256 text
)
returns boolean
language plpgsql security invoker set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_attachment_id is null or p_lease_token is null or
     p_verdict not in ('clean','infected','error') or
     (p_verdict <> 'error' and (p_sha256 is null or p_sha256 !~ '^[a-f0-9]{64}$')) or
     (p_sha256 is not null and p_sha256 !~ '^[a-f0-9]{64}$') then
    raise exception 'invalid_scan_verdict' using errcode='22023';
  end if;

  update public.quote_attachment_scans s set
    status=p_verdict,
    lease_token=null, lease_until=null,
    sha256=case when p_verdict='error' then null else p_sha256 end,
    scanner=case when p_verdict='error' then null else 'clamav' end,
    scanned_at=case when p_verdict='error' then null else transaction_timestamp() end,
    next_attempt_at=case when p_verdict='error'
      then transaction_timestamp() + interval '1 hour'
      else s.next_attempt_at end,
    updated_at=transaction_timestamp()
  where s.attachment_id=p_attachment_id and s.status='scanning'
    and s.lease_token=p_lease_token and s.lease_until>transaction_timestamp()
    and exists (
      select 1 from public.quote_attachments a
      where a.id=p_attachment_id and a.validation_status='validated'
        and a.quota_released_at is null
    );
  get diagnostics v_count = row_count;
  if v_count <> 1 then return false; end if;

  if p_verdict='infected' then
    update public.quote_attachments
      set validation_status='rejected', validation_code='malware_detected',
          updated_at=transaction_timestamp()
    where id=p_attachment_id and validation_status='validated';
  end if;
  return true;
end $$;
revoke all on function public.quote_finish_attachment_scan(uuid,uuid,text,text)
  from public, anon, authenticated;
grant execute on function public.quote_finish_attachment_scan(uuid,uuid,text,text)
  to service_role;

-- The ONLY safe allowlist for any future administrative download.
-- Callers must ALSO authenticate/authorize the operator for each request.
create view public.quote_clean_attachments
with (security_invoker=true)
as
select a.id,a.quote_request_id,a.storage_path,a.validated_size_bytes,
       s.sha256,s.scanned_at
from public.quote_attachments a
join public.quote_attachment_scans s on s.attachment_id=a.id
where a.validation_status='validated' and a.quota_released_at is null
  and s.status='clean' and s.sha256 is not null;
revoke all on public.quote_clean_attachments from public, anon, authenticated;
grant select on public.quote_clean_attachments to service_role;

-- No bucket made public, no Storage SELECT grant for client roles.
-- IMPORTANT: the worker is not started automatically; until it runs, files
-- remain PENDING and must not be opened, converted, previewed or downloaded.
