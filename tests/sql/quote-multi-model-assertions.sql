-- Each assertion runs against a disposable database. An exception fails the CI job.
do $$
declare
  v_request uuid := '11111111-1111-4111-8111-111111111111';
  v_key1 uuid := '22222222-2222-4222-8222-222222222222';
  v_key2 uuid := '33333333-3333-4333-8333-333333333333';
  v_id uuid;
  v_again uuid;
  v_daily bigint;
  v_fail boolean;
begin
  insert into public.quote_requests(id,owner_session_hash)
    values (v_request,repeat('a',64));

  -- A nonapproved capacity gate must not sign any file.
  v_fail := false;
  begin
    perform * from public.quote_reserve_attachment(v_request,repeat('a',64),v_key1,
      'foto.jpg','.jpg','image/jpeg',2000000);
  exception when check_violation then v_fail := true;
  end;
  if not v_fail then raise exception 'storage approval gate did not fail closed'; end if;

  update public.quote_upload_limits set max_daily_bytes=100000000,
    storage_reviewed_at=transaction_timestamp()
    where bucket_id='quote-intake';

  -- Limits are extension dependent and checked before allocating capacity.
  v_fail := false;
  begin
    perform * from public.quote_reserve_attachment(v_request,repeat('a',64),gen_random_uuid(),
      'foto.jpg','.jpg','image/jpeg',6000000);
  exception when invalid_parameter_value then v_fail := true;
  end;
  if not v_fail then raise exception 'oversize reference not rejected'; end if;

  select attachment_id into v_id from public.quote_reserve_attachment(
    v_request,repeat('a',64),v_key1,'foto.jpg','.jpg','image/jpeg',3000000);
  if v_id is null then raise exception 'first reservation missing'; end if;

  select attachment_id into v_again from public.quote_reserve_attachment(
    v_request,repeat('a',64),v_key1,'foto.jpg','.jpg','image/jpeg',3000000);
  if v_again<>v_id then raise exception 'idempotency replay created another reservation'; end if;

  select reserved_bytes into v_daily from public.quote_upload_daily_usage
    where day_utc=(transaction_timestamp() at time zone 'UTC')::date;
  if v_daily<>50000000 then raise exception 'replay double-counted daily capacity: %',v_daily; end if;

  perform * from public.quote_reserve_attachment(v_request,repeat('a',64),v_key2,
    'arvore.3mf','.3mf','application/octet-stream',30000000);
  select reserved_bytes into v_daily from public.quote_upload_daily_usage
    where day_utc=(transaction_timestamp() at time zone 'UTC')::date;
  if v_daily<>100000000 then raise exception 'incorrect daily charged reservation: %',v_daily; end if;

  -- Daily cap is pessimistic per signed TUS grant even if file declares 1MB.
  v_fail := false;
  begin
    perform * from public.quote_reserve_attachment(v_request,repeat('a',64),gen_random_uuid(),
      'extra.stl','.stl','application/octet-stream',1000000);
  exception when check_violation then v_fail := true;
  end;
  if not v_fail then raise exception 'daily quota exceeded without rejection'; end if;

  -- With a higher daily budget, per-request declared total 3MB+30MB+25MB >50MB is still rejected.
  update public.quote_upload_limits set max_daily_bytes=200000000 where bucket_id='quote-intake';
  v_fail := false;
  begin
    perform * from public.quote_reserve_attachment(v_request,repeat('a',64),gen_random_uuid(),
      'extra.3mf','.3mf','application/octet-stream',25000000);
  exception when check_violation then v_fail := true;
  end;
  if not v_fail then raise exception '50MB total declared budget bypassed'; end if;

  select reserved_bytes into v_daily from public.quote_upload_daily_usage
    where day_utc=(transaction_timestamp() at time zone 'UTC')::date;
  if v_daily<>100000000 then raise exception 'failed reservation consumed daily budget: %',v_daily; end if;

  if (select count(*) from public.quote_attachments where quote_request_id=v_request) <> 2 then
    raise exception 'rejected grants left attachment rows';
  end if;
end $$;
