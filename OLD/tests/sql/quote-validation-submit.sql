-- Synthetic transactional proof of owner-bound completion and idempotent submit.
-- Executable with psql; always ROLLBACK. Does not insert Storage binary objects.
begin;
set local lock_timeout = '5s';

do $$
declare
  v_req uuid;
  v_file_request uuid;
  v_key uuid := gen_random_uuid();
  v_id uuid;
  v_time timestamptz;
  v_retry_id uuid;
  v_retry_time timestamptz;
  denied boolean;
begin
  insert into public.quote_requests(project_type,owner_session_hash)
  values('placa',repeat('a',64)) returning id into v_req;

  select request_id,submission_time into v_id,v_time
  from public.quote_submit(
    v_req,repeat('a',64),v_key,'placa',true,array['logo'],null,null,
    '{"quantity":"1"}'::jsonb,'{"kind":"placa"}'::jsonb,
    'email','Exemplo','demo@example.invalid','needs-information',array[]::uuid[]);
  if v_id is distinct from v_req or v_time is null
  then raise exception 'valid_submit_failed'; end if;

  select request_id,submission_time into v_retry_id,v_retry_time
  from public.quote_submit(
    v_req,repeat('a',64),v_key,'placa',true,array['logo'],null,null,
    '{"quantity":"1"}'::jsonb,'{"kind":"placa"}'::jsonb,
    'email','Exemplo','demo@example.invalid','needs-information',array[]::uuid[]);
  if v_retry_id is distinct from v_id or v_retry_time is distinct from v_time
  then raise exception 'submit_retry_failed'; end if;
  select request_id,submission_time into v_retry_id,v_retry_time
    from public.quote_submission_receipt(v_req,repeat('a',64),v_key);
  if v_retry_id is distinct from v_id or v_retry_time is distinct from v_time
  then raise exception 'idempotent_receipt_lookup_failed'; end if;
  if exists(select 1 from public.quote_submission_receipt(v_req,repeat('b',64),v_key))
     or exists(select 1 from public.quote_submission_receipt(v_req,repeat('a',64),gen_random_uuid())) then
    raise exception 'receipt_revealed_to_wrong_session_or_key';
  end if;


  if (select count(*) from public.quote_events where quote_request_id=v_req)<>1
  then raise exception 'duplicate_submit_events'; end if;

  denied:=false;
  begin
    perform 1 from public.quote_submit(
      v_req,repeat('b',64),v_key,'placa',true,array['logo'],null,null,
      '{}'::jsonb,'{}'::jsonb,'email','Exemplo','demo@example.invalid',
      'needs-information',array[]::uuid[]);
  exception when others then denied:=true; end;
  if not denied then raise exception 'cross_session_submit_allowed'; end if;

  denied:=false;
  begin
    perform 1 from public.quote_submit(
      v_req,repeat('a',64),gen_random_uuid(),'placa',true,array['logo'],null,null,
      '{}'::jsonb,'{}'::jsonb,'email','Exemplo','demo@example.invalid',
      'needs-information',array[]::uuid[]);
  exception when others then denied:=true; end;
  if not denied then raise exception 'conflicting_submission_key_allowed'; end if;

  insert into public.quote_requests(project_type,owner_session_hash)
  values('impressao',repeat('c',64)) returning id into v_file_request;

  denied:=false;
  begin
    perform 1 from public.quote_submit(
      v_file_request,repeat('c',64),gen_random_uuid(),'impressao',false,
      array[]::text[],null,null,'{}'::jsonb,'{}'::jsonb,
      'email','Exemplo','demo@example.invalid',
      'ready-for-review',array[]::uuid[]);
  exception when others then denied:=true; end;
  if not denied then raise exception 'unverified_file_submission_allowed'; end if;

  denied:=false;
  begin
    perform public.quote_validate_attachment(
      v_file_request,repeat('c',64),gen_random_uuid(),100,'pdf');
  exception when others then denied:=true; end;
  if not denied then raise exception 'missing_file_verified'; end if;

  if has_function_privilege('anon','public.quote_submit(uuid,text,uuid,text,boolean,text[],text,text,jsonb,jsonb,text,text,text,text,uuid[])','execute') or
     has_function_privilege('anon','public.quote_validate_attachment(uuid,text,uuid,bigint,text)','execute') or
     has_function_privilege('anon','public.quote_owned_attachment(uuid,text,uuid)','execute')
  then raise exception 'public_user_can_invoke_quote_rpc'; end if;

  raise notice 'PASS: nofile submit, retry, owner, duplicate prevention, missing file blocked, private RPC';
end $$;
rollback;
