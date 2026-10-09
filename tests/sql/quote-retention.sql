-- Synthetic proof of single-writer lease, 27-hour TUS guard and retention.
-- Always rolled back. No personal data or Storage object is persisted.
begin;
set local lock_timeout='5s';
do $$
declare
  token uuid:=gen_random_uuid();
  other uuid:=gen_random_uuid();
  draft uuid; submitted uuid; expired_file uuid; active_file uuid; submitted_file uuid;
  n integer; freed bigint;
  d integer; s integer; r integer; e integer;
  blocked boolean;
begin
  if not public.quote_retention_acquire(token) then raise exception 'lease_failed'; end if;
  if public.quote_retention_acquire(other) then raise exception 'overlap_not_blocked'; end if;

  insert into public.quote_requests(project_type,owner_session_hash,created_at,expires_at)
  values('placa',repeat('a',64),now()-interval '4 days',now()-interval '2 days')
  returning id into draft;
  insert into public.quote_attachments(quote_request_id,upload_key,storage_path,
    original_name,extension,size_bytes,accounted_bytes,created_at,expires_at,grant_expires_at)
  values(draft,gen_random_uuid(),draft::text||'/'||gen_random_uuid()::text||'.stl',
    'synthetic.stl','.stl',100,50000000,now()-interval '4 days',
    now()-interval '2 days',now()-interval '1 day')
  returning id into expired_file;
  insert into public.quote_attachments(quote_request_id,upload_key,storage_path,
    original_name,extension,size_bytes,accounted_bytes,created_at,expires_at,grant_expires_at)
  values(draft,gen_random_uuid(),draft::text||'/'||gen_random_uuid()::text||'.obj',
    'active.obj','.obj',100,50000000,now()-interval '4 days',
    now()-interval '2 days',now()+interval '1 hour')
  returning id into active_file;

  insert into public.quote_requests(project_type,owner_session_hash,lifecycle_status,
    submitted_at,created_at,expires_at,contact_method,contact_name,contact_value,submission_key)
  values('placa',repeat('b',64),'submitted',now()-interval '185 days',
    now()-interval '200 days',now()-interval '10 days','email','Example',
    'test@example.invalid',gen_random_uuid())
  returning id into submitted;
  insert into public.quote_attachments(quote_request_id,upload_key,storage_path,
    original_name,extension,size_bytes,accounted_bytes,created_at,expires_at,grant_expires_at)
  values(submitted,gen_random_uuid(),submitted::text||'/'||gen_random_uuid()::text||'.stl',
    'old.stl','.stl',100,50000000,now()-interval '100 days',
    now()-interval '10 days',now()-interval '90 days')
  returning id into submitted_file;

  select count(*) into n from public.quote_retention_candidates(token,20);
  if n<>2 then raise exception 'wrong_candidate_count_%', n; end if;
  blocked:=false;
  begin perform 1 from public.quote_retention_finalize_attachment(other,expired_file);
  exception when others then blocked:=true; end;
  if not blocked then raise exception 'other_lease_finalized'; end if;
  blocked:=false;
  begin perform 1 from public.quote_retention_finalize_attachment(token,active_file);
  exception when others then blocked:=true; end;
  if not blocked then raise exception 'active_tus_released'; end if;

  freed:=public.quote_retention_finalize_attachment(token,expired_file);
  if freed<>50000000 then raise exception 'draft_capacity_not_released'; end if;
  freed:=public.quote_retention_finalize_attachment(token,submitted_file);
  if freed<>50000000 then raise exception 'submission_capacity_not_released'; end if;
  select count(*) into n from public.quote_retention_candidates(token,20);
  if n<>0 then raise exception 'already_finalized_candidate_returned'; end if;

  insert into public.quote_rate_limit_windows(action,key_hash,window_start,expires_at,request_count)
  values('create',repeat('c',64),date_trunc('hour',now()-interval '48 hours'),
    now()-interval '24 hours',1);
  insert into public.quote_events(quote_request_id,event_type,event_status,metadata,created_at)
  values(submitted,'technical.test','ok','{"synthetic":true}'::jsonb,now()-interval '2 days');
  insert into public.quote_events(quote_request_id,event_type,event_status,metadata,created_at)
  values(null,'technical.test','ok','{}'::jsonb,now()-interval '400 days');

  select drafts_deleted,submitted_deleted,rate_windows_deleted,events_deleted
  into d,s,r,e from public.quote_retention_sweep(token,100);
  if d<>0 or s<>1 or r<>1 or e<>1 then
    raise exception 'wrong_counts_%_%_%_%',d,s,r,e; end if;
  if exists(select 1 from public.quote_events
    where quote_request_id is null and metadata<>'{}'::jsonb) then
    raise exception 'technical_metadata_not_scrubbed'; end if;
  if not exists(select 1 from public.quote_requests where id=draft) then
    raise exception 'draft_removed_before_signed_upload_expired'; end if;
  if not public.quote_retention_finish(token,true,'{"files":2}'::jsonb) then
    raise exception 'finish_failed'; end if;
  if public.quote_retention_active(token) then raise exception 'lease_not_released'; end if;

  if has_function_privilege('anon','public.quote_retention_acquire(uuid)','execute')
    or has_function_privilege('authenticated','public.quote_retention_finalize_attachment(uuid,uuid)','execute')
    or has_table_privilege('anon','public.quote_retention_control','select') then
    raise exception 'retention_controls_publicly_exposed'; end if;
  raise notice 'PASS: SQL lease, eligibility, TUS TTL, quota, expiry, sweep, RLS';
end $$;
rollback;
