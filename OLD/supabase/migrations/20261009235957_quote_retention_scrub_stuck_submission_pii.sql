-- A failing Storage deletion must not retain customer contact/content past 180d.
-- Keep request/attachment rows for retry, but remove their PII independently.
alter table public.quote_requests
  add column personal_data_erased_at timestamptz;
create index quote_requests_retention_privacy_idx
  on public.quote_requests(expires_at,id)
  where personal_data_erased_at is null
    and lifecycle_status in ('submitted','reviewing','closed');

create function public.quote_retention_scrub_submitted(
  p_token uuid,p_limit integer default 200
) returns integer
language plpgsql security invoker set search_path=''
as $$
declare v_ids uuid[];
declare v_count integer;
begin
  if not public.quote_retention_active(p_token) then
    raise exception 'retention_lease_not_held' using errcode='42501';
  end if;
  if p_limit is null or p_limit not between 1 and 250 then
    raise exception 'invalid_retention_limit' using errcode='22023';
  end if;
  select array_agg(id) into v_ids from (
    select q.id from public.quote_requests q
    where q.lifecycle_status in ('submitted','reviewing','closed')
      and q.expires_at<=transaction_timestamp()
      and q.personal_data_erased_at is null
    order by q.expires_at,q.id limit p_limit for update skip locked
  ) due;
  if cardinality(v_ids) is null then return 0; end if;

  -- Events are retained for 365d but their metadata cannot keep PII.
  update public.quote_events e set metadata='{}'::jsonb
    where e.quote_request_id=any(v_ids);

  -- A stored attachment name can itself contain a person's name/address.
  -- Retention must continue working with only random storage paths.
  update public.quote_attachments a set
    original_name='expired-upload',
    reported_mime=null,validation_code=null,updated_at=transaction_timestamp()
    where a.quote_request_id=any(v_ids);

  update public.quote_requests q set
    owner_session_hash=repeat('0',64),
    submission_key=null,
    source_origin=null,source_reference=null,
    starting_points='{}'::text[],
    production='{}'::jsonb,project='{}'::jsonb,
    contact_method=null,contact_name=null,contact_value=null,
    triage_status=null,
    personal_data_erased_at=transaction_timestamp(),
    updated_at=transaction_timestamp()
    where q.id=any(v_ids) and q.personal_data_erased_at is null;
  get diagnostics v_count = row_count;
  return v_count;
end $$;
revoke all on function public.quote_retention_scrub_submitted(uuid,integer)
  from public,anon,authenticated;
grant execute on function public.quote_retention_scrub_submitted(uuid,integer)
  to service_role;
