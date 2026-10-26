-- Reconcile event scrubbing and quote deletion as ordered statements.
create or replace function public.quote_retention_sweep(p_token uuid,p_limit integer default 100)
returns table(drafts_deleted integer,submitted_deleted integer,rate_windows_deleted integer,events_deleted integer)
language plpgsql security invoker set search_path = ''
as $$
declare v_drafts integer:=0;v_submitted integer:=0;v_rates integer:=0;v_events integer:=0;v_submitted_ids uuid[];
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

  -- Keep event metadata scrub and ON DELETE SET NULL in distinct statements.
  -- PostgreSQL data-modifying CTEs in one statement have unspecified order:
  -- mixing their UPDATE and FK-triggered UPDATE would be unsafe.
  select array_agg(id) into v_submitted_ids from (
    select q.id from public.quote_requests q
    where q.lifecycle_status in ('submitted','reviewing','closed')
      and q.expires_at<=transaction_timestamp()
      and not exists(select 1 from public.quote_attachments a where a.quote_request_id=q.id)
    order by q.expires_at,q.id limit p_limit
    for update skip locked
  ) due;
  if cardinality(v_submitted_ids)>0 then
    update public.quote_events e
      set metadata='{}'::jsonb
      where e.quote_request_id=any(v_submitted_ids);
    delete from public.quote_requests q where q.id=any(v_submitted_ids);
    get diagnostics v_submitted = row_count;
  end if;

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
