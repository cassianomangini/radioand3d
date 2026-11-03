-- E2 retention: service-role only, crash-recoverable global lease and bounded work.
-- Never DELETE storage.objects directly: binary deletion is performed via Storage API.
create table public.quote_retention_control (
  name text primary key check (name = 'quote-intake'),
  run_token uuid,
  lease_until timestamptz,
  last_started_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_result jsonb not null default '{}'::jsonb
    check (jsonb_typeof(last_result)='object' and octet_length(last_result::text)<=512)
);
insert into public.quote_retention_control(name) values ('quote-intake');

alter table public.quote_retention_control enable row level security;
revoke all on public.quote_retention_control from public, anon, authenticated;
grant select, insert, update on public.quote_retention_control to service_role;

create function public.quote_retention_acquire(p_token uuid)
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare v_acquired boolean := false;
begin
  if p_token is null then raise exception 'invalid_lease_token' using errcode='22023'; end if;
  update public.quote_retention_control
     set run_token=p_token,lease_until=transaction_timestamp()+interval '10 minutes',
         last_started_at=transaction_timestamp()
   where name='quote-intake'
     and (lease_until is null or lease_until < transaction_timestamp())
   returning true into v_acquired;
  return coalesce(v_acquired,false);
end $$;
revoke all on function public.quote_retention_acquire(uuid) from public,anon,authenticated;
grant execute on function public.quote_retention_acquire(uuid) to service_role;

create function public.quote_retention_active(p_token uuid)
returns boolean language sql stable security invoker set search_path = ''
as $$
  select exists (select 1 from public.quote_retention_control
   where name='quote-intake' and run_token=p_token
    and lease_until>transaction_timestamp())
$$;
revoke all on function public.quote_retention_active(uuid) from public,anon,authenticated;
grant execute on function public.quote_retention_active(uuid) to service_role;

create function public.quote_retention_candidates(p_token uuid,p_limit integer default 20)
returns table(attachment_id uuid,request_id uuid,object_path text)
language plpgsql stable security invoker set search_path = ''
as $$
begin
  if not public.quote_retention_active(p_token) then
    raise exception 'retention_lease_not_held' using errcode='42501';
  end if;
  if p_limit is null or p_limit not between 1 and 50 then
    raise exception 'invalid_retention_limit' using errcode='22023';
  end if;
  return query
    select a.id,q.id,a.storage_path
    from public.quote_attachments a
    join public.quote_requests q on q.id=a.quote_request_id
    where a.grant_expires_at<=transaction_timestamp()
      and (
        (q.lifecycle_status in ('draft','expired') and q.expires_at<=transaction_timestamp())
        or
        (q.lifecycle_status in ('submitted','reviewing','closed')
          and a.expires_at<=transaction_timestamp())
      )
    order by a.expires_at,a.id limit p_limit;
end $$;
revoke all on function public.quote_retention_candidates(uuid,integer) from public,anon,authenticated;
grant execute on function public.quote_retention_candidates(uuid,integer) to service_role;

-- Called only AFTER a successful Storage remove+404 confirmation.
-- If metadata still exists or an upload grant has not expired, fail closed.
create function public.quote_retention_finalize_attachment(p_token uuid,p_attachment_id uuid)
returns bigint language plpgsql security invoker set search_path = ''
as $$
declare
  v_a public.quote_attachments%rowtype;
  v_q public.quote_requests%rowtype;
  v_released bigint;
begin
  if not public.quote_retention_active(p_token) or p_attachment_id is null then
    raise exception 'retention_lease_not_held' using errcode='42501';
  end if;
  select q.* into v_q
    from public.quote_requests q
    join public.quote_attachments a on a.quote_request_id=q.id
    where a.id=p_attachment_id
    for update of q;
  if not found then return 0; end if;

  select a.* into v_a from public.quote_attachments a
    where a.id=p_attachment_id for update;
  if not found then return 0; end if;

  if v_a.grant_expires_at>transaction_timestamp() or not (
    (v_q.lifecycle_status in ('draft','expired') and
     v_q.expires_at<=transaction_timestamp()) or
    (v_q.lifecycle_status in ('submitted','reviewing','closed') and
     v_a.expires_at<=transaction_timestamp())
  ) then
    raise exception 'retention_not_yet_due' using errcode='23514';
  end if;
  if exists(select 1 from storage.objects o
     where o.bucket_id='quote-intake' and o.name=v_a.storage_path) then
    raise exception 'storage_object_still_present' using errcode='23514';
  end if;

  v_released := case when v_a.quota_released_at is null
    then v_a.accounted_bytes else 0 end;
  if v_a.quota_released_at is null then
    update public.quote_attachments set
      validation_status='expired',
      quota_released_at=transaction_timestamp(),
      updated_at=transaction_timestamp()
    where id=p_attachment_id;
  end if;
  delete from public.quote_attachments where id=p_attachment_id;
  return v_released;
end $$;
revoke all on function public.quote_retention_finalize_attachment(uuid,uuid) from public,anon,authenticated;
grant execute on function public.quote_retention_finalize_attachment(uuid,uuid) to service_role;

create function public.quote_retention_sweep(p_token uuid,p_limit integer default 100)
returns table(drafts_deleted integer,submitted_deleted integer,rate_windows_deleted integer,events_deleted integer)
language plpgsql security invoker set search_path = ''
as $$
declare v_drafts integer:=0;v_submitted integer:=0;v_rates integer:=0;v_events integer:=0;
begin
  if not public.quote_retention_active(p_token) then
    raise exception 'retention_lease_not_held' using errcode='42501';
  end if;
  if p_limit is null or p_limit not between 1 and 250 then
    raise exception 'invalid_retention_limit' using errcode='22023';
  end if;
  with candidates as (
    select q.id from public.quote_requests q
    where q.lifecycle_status in ('draft','expired')
      and q.expires_at<=transaction_timestamp()
      and not exists(select 1 from public.quote_attachments a where a.quote_request_id=q.id)
    order by q.expires_at,q.id limit p_limit
    for update skip locked
  ), deleted as (
    delete from public.quote_requests q where q.id in (select id from candidates)
    returning q.id
  ) select count(*)::integer into v_drafts from deleted;

  -- Submissions past 180 days: keep only technical events, without metadata.
  with candidates as (
    select q.id from public.quote_requests q
    where q.lifecycle_status in ('submitted','reviewing','closed')
      and q.expires_at<=transaction_timestamp()
      and not exists(select 1 from public.quote_attachments a where a.quote_request_id=q.id)
    order by q.expires_at,q.id limit p_limit
    for update skip locked
  ), clean_events as (
    update public.quote_events e set metadata='{}'::jsonb
      where e.quote_request_id in (select id from candidates)
    returning e.id
  ), deleted as (
    delete from public.quote_requests q where q.id in (select id from candidates)
    returning q.id
  ) select count(*)::integer into v_submitted from deleted;

  with candidates as (
    select w.action,w.key_hash,w.window_start from public.quote_rate_limit_windows w
     where w.expires_at<=transaction_timestamp()
     order by w.expires_at limit p_limit for update skip locked
  ), deleted as (
    delete from public.quote_rate_limit_windows w
     where (w.action,w.key_hash,w.window_start) in
       (select action,key_hash,window_start from candidates)
     returning w.action
  ) select count(*)::integer into v_rates from deleted;

  with candidates as (
    select e.id from public.quote_events e
    where e.created_at<=transaction_timestamp()-interval '365 days'
    order by e.created_at,e.id limit p_limit for update skip locked
  ), deleted as (
    delete from public.quote_events e where e.id in (select id from candidates)
    returning e.id
  ) select count(*)::integer into v_events from deleted;

  return query select v_drafts,v_submitted,v_rates,v_events;
end $$;
revoke all on function public.quote_retention_sweep(uuid,integer) from public,anon,authenticated;
grant execute on function public.quote_retention_sweep(uuid,integer) to service_role;

create function public.quote_retention_finish(p_token uuid,p_ok boolean,p_result jsonb default '{}'::jsonb)
returns boolean language plpgsql security invoker set search_path = ''
as $$
declare v_updated boolean:=false;
begin
  if p_token is null or p_ok is null or p_result is null or
     jsonb_typeof(p_result)<>'object' or octet_length(p_result::text)>512 then
    raise exception 'invalid_retention_finish' using errcode='22023';
  end if;
  update public.quote_retention_control
    set run_token=null,lease_until=null,
        last_success_at=case when p_ok then transaction_timestamp() else last_success_at end,
        last_failure_at=case when not p_ok then transaction_timestamp() else last_failure_at end,
        last_result=p_result
    where name='quote-intake' and run_token=p_token
      and lease_until>transaction_timestamp()
    returning true into v_updated;
  return coalesce(v_updated,false);
end $$;
revoke all on function public.quote_retention_finish(uuid,boolean,jsonb) from public,anon,authenticated;
grant execute on function public.quote_retention_finish(uuid,boolean,jsonb) to service_role;
