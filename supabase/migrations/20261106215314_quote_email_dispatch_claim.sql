-- Serialize notification attempts for one submitted quote. The claim is a
-- short lease, so an interrupted function can be retried without creating a
-- second request or leaving a permanent sending state.
create table public.quote_email_dispatch (
  quote_request_id uuid primary key references public.quote_requests(id) on delete cascade,
  claim_token uuid,
  claim_expires_at timestamptz,
  sent_at timestamptz,
  constraint quote_email_claim_pair check ((claim_token is null) = (claim_expires_at is null)),
  constraint quote_email_sent_unclaimed check (sent_at is null or claim_token is null)
);
alter table public.quote_email_dispatch enable row level security;
revoke all on public.quote_email_dispatch from public, anon, authenticated;
grant select, insert, update on public.quote_email_dispatch to service_role;

create function public.quote_email_claim(
  p_request_id uuid, p_owner_session_hash text, p_claim_token uuid
) returns text
language plpgsql security invoker set search_path = ''
as $$
declare
  v_dispatch public.quote_email_dispatch%rowtype;
begin
  if p_request_id is null or p_claim_token is null or
     p_owner_session_hash is null or p_owner_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quote_email_claim' using errcode = '22023';
  end if;
  perform 1 from public.quote_requests q
    where q.id = p_request_id and q.owner_session_hash = p_owner_session_hash
      and q.lifecycle_status in ('submitted', 'reviewing', 'closed')
    for update;
  if not found then
    raise exception 'quote_not_found' using errcode = 'P0001';
  end if;

  -- Old submissions already recorded a sent event before this migration.
  if exists (select 1 from public.quote_events e
      where e.quote_request_id = p_request_id and e.event_type = 'email'
        and e.event_status = 'sent') then
    return 'sent';
  end if;
  select d.* into v_dispatch from public.quote_email_dispatch d
    where d.quote_request_id = p_request_id for update;
  if found then
    if v_dispatch.sent_at is not null then return 'sent'; end if;
    if v_dispatch.claim_expires_at > transaction_timestamp() then return 'busy'; end if;
  end if;
  insert into public.quote_email_dispatch
    (quote_request_id, claim_token, claim_expires_at)
  values (p_request_id, p_claim_token, transaction_timestamp() + interval '2 minutes')
  on conflict (quote_request_id) do update
    set claim_token = excluded.claim_token,
        claim_expires_at = excluded.claim_expires_at;
  return 'claimed';
end $$;
revoke all on function public.quote_email_claim(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.quote_email_claim(uuid,text,uuid) to service_role;

create function public.quote_email_finish(
  p_request_id uuid, p_owner_session_hash text, p_claim_token uuid
) returns boolean
language plpgsql security invoker set search_path = ''
as $$
begin
  if p_request_id is null or p_claim_token is null or
     p_owner_session_hash is null or p_owner_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quote_email_claim' using errcode = '22023';
  end if;
  perform 1 from public.quote_requests q
    where q.id = p_request_id and q.owner_session_hash = p_owner_session_hash
      and q.lifecycle_status in ('submitted', 'reviewing', 'closed')
    for update;
  if not found then
    raise exception 'quote_not_found' using errcode = 'P0001';
  end if;
  update public.quote_email_dispatch d
    set sent_at = transaction_timestamp(), claim_token = null, claim_expires_at = null
    where d.quote_request_id = p_request_id and d.claim_token = p_claim_token
      and d.sent_at is null;
  if not found then
    raise exception 'quote_email_claim_lost' using errcode = '23505';
  end if;
  insert into public.quote_events(quote_request_id, event_type, event_status)
    values (p_request_id, 'email', 'sent');
  return true;
end $$;
revoke all on function public.quote_email_finish(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.quote_email_finish(uuid,text,uuid) to service_role;
