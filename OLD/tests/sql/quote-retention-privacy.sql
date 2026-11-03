-- E2: privacy cutoff is independent of stuck Storage delete.
-- Synthetic values only. Transaction always rolled back.
begin;
set local lock_timeout = '5s';
do $$
declare
  run_token uuid:=gen_random_uuid();
  rid uuid;
  aid uuid;
  expired_draft uuid;
  draft_file uuid;
  n integer;
  q public.quote_requests%rowtype;
  a public.quote_attachments%rowtype;
  blocked boolean:=false;
begin
  if not public.quote_retention_acquire(run_token)
  then raise exception 'retention_lease_busy'; end if;
  insert into public.quote_requests(
    project_type,owner_session_hash,lifecycle_status,submitted_at,
    created_at,expires_at,contact_method,contact_name,contact_value,
    submission_key,production,project,starting_points
  ) values(
    'placa',repeat('f',64),'submitted',now()-interval '185 days',
    now()-interval '200 days',now()-interval '1 day',
    'email','synthetic private name','synthetic@example.invalid',
    gen_random_uuid(),'{"sensitive":"test"}','{"details":"synthetic"}',
    array['private note']
  ) returning id into rid;
  insert into public.quote_attachments(
    quote_request_id,upload_key,storage_path,original_name,
    extension,size_bytes,accounted_bytes,created_at,expires_at,grant_expires_at
  ) values(
    rid,gen_random_uuid(),rid::text||'/'||gen_random_uuid()::text||'.stl',
    'synthetic-personal-name.stl','.stl',123,50000000,
    now()-interval '190 days',now()-interval '1 day',now()+interval '1 day'
  ) returning id into aid;
  insert into public.quote_events(quote_request_id,event_type,event_status,metadata)
    values(rid,'technical.test','ok','{"contact":"synthetic@example.invalid"}'::jsonb);

  select public.quote_retention_scrub_submitted(run_token,50) into n;
  if n<>1 then raise exception 'expired_request_not_scrubbed'; end if;
  select * into q from public.quote_requests where id=rid;
  select * into a from public.quote_attachments where id=aid;
  if q.contact_name is not null or q.contact_value is not null
    or q.owner_session_hash<>repeat('0',64) or q.submission_key is not null
    or q.production<>'{}'::jsonb or q.project<>'{}'::jsonb
    or cardinality(q.starting_points)<>0 or q.personal_data_erased_at is null
    or a.original_name<>'expired-upload' or a.reported_mime is not null
    or a.quota_released_at is not null then
    raise exception 'privacy_scrub_incomplete_or_quota_released'; end if;
  if exists(select 1 from public.quote_events
    where quote_request_id=rid and metadata<>'{}'::jsonb) then
    raise exception 'event_pii_still_present'; end if;
  if (select public.quote_retention_scrub_submitted(run_token,50))<>0
    then raise exception 'scrub_not_idempotent'; end if;
  if not exists(select 1 from public.quote_attachments where id=aid) then
    raise exception 'stuck_file_lost_before_storage_cleanup'; end if;

  -- Drafts may contain personal information in original filenames even
  -- before contact/project fields have been submitted.
  insert into public.quote_requests(project_type,owner_session_hash,created_at,expires_at)
    values('placa',repeat('d',64),now()-interval '4 days',now()-interval '2 days')
    returning id into expired_draft;
  insert into public.quote_attachments(
    quote_request_id,upload_key,storage_path,original_name,
    extension,size_bytes,accounted_bytes,created_at,expires_at,grant_expires_at
  ) values(
    expired_draft,gen_random_uuid(),
    expired_draft::text||'/'||gen_random_uuid()::text||'.obj',
    'synthetic-private-name.obj','.obj',100,50000000,
    now()-interval '4 days',now()-interval '2 days',now()+interval '1 day'
  ) returning id into draft_file;
  insert into public.quote_events(quote_request_id,event_type,event_status,metadata)
    values(expired_draft,'technical.test','ok',
      '{"email":"synthetic@example.invalid"}'::jsonb);
  if (select public.quote_retention_scrub_submitted(run_token,50))<>1
    then raise exception 'expired_draft_metadata_not_scrubbed'; end if;
  select * into q from public.quote_requests where id=expired_draft;
  select * into a from public.quote_attachments where id=draft_file;
  if q.owner_session_hash<>repeat('0',64) or q.personal_data_erased_at is null
    or a.original_name<>'expired-upload' or a.quota_released_at is not null
    then raise exception 'expired_draft_metadata_leaked_or_quota_released'; end if;
  if exists(select 1 from public.quote_events
    where quote_request_id=expired_draft and metadata<>'{}'::jsonb) then
    raise exception 'expired_draft_event_metadata_leaked'; end if;
  if not exists(select 1 from public.quote_attachments where id=draft_file) then
    raise exception 'active_tus_metadata_discarded_early'; end if;
  if (select public.quote_retention_scrub_submitted(run_token,50))<>0
    then raise exception 'second_scrub_not_idempotent'; end if;

  begin
    perform public.quote_retention_scrub_submitted(gen_random_uuid(),50);
  exception when others then blocked:=true; end;
  if not blocked then raise exception 'wrong_lease_scrub_allowed'; end if;
  if has_function_privilege('anon','public.quote_retention_scrub_submitted(uuid,integer)','execute')
    or has_function_privilege('authenticated','public.quote_retention_scrub_submitted(uuid,integer)','execute')
    then raise exception 'public_scrub_rpc_exposed'; end if;
  raise notice 'PASS: 24h draft and 180d submission PII scrub independent of Storage, idempotency, quota and ACL';
end $$;
rollback;
