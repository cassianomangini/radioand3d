-- This script must run only against the disposable CI fixture.
begin;
do $test$
declare
  v_request uuid;
  v_second_owner uuid;
  v_first uuid;
  v_second uuid;
  v_third uuid;
  v_other uuid;
  v_claim record;
  v_checked boolean := false;
  v_result boolean;
  v_count integer;
begin
  insert into public.quote_requests(owner_session_hash) values (repeat('a',64))
    returning id into v_request;
  insert into public.quote_requests(owner_session_hash) values (repeat('b',64))
    returning id into v_second_owner;

  insert into public.quote_attachments(quote_request_id,storage_path)
    values(v_request,'owner-a-first') returning id into v_first;
  insert into public.quote_attachments(quote_request_id,storage_path)
    values(v_request,'owner-a-second') returning id into v_second;

  -- Quarantine starts pending for every new object and cannot be fetched
  -- from the release view before explicit antivirus clearance.
  select count(*) into v_count from public.quote_clean_attachments;
  if v_count <> 0 then raise exception 'unscanned attachment leaked into release view'; end if;
  select count(*) into v_count from public.quote_attachment_scans where status='pending';
  if v_count <> 2 then raise exception 'missing quarantine scan rows'; end if;

  begin
    insert into public.quote_attachments(quote_request_id,storage_path)
      values(v_request,'owner-a-third');
  exception when check_violation then
    v_checked := true;
  end;
  if not v_checked then raise exception 'third pending upload for same owner was allowed'; end if;

  -- Separate owners can use their own quota.
  insert into public.quote_attachments(quote_request_id,storage_path)
    values(v_second_owner,'owner-b-first') returning id into v_other;

  -- Completing structural validation frees one pending slot but does not
  -- mark the file malware-safe.
  update public.quote_attachments set validation_status='validated',
      validated_size_bytes=1024 where id=v_first;
  insert into public.quote_attachments(quote_request_id,storage_path)
    values(v_request,'owner-a-third-valid') returning id into v_third;
  select count(*) into v_count from public.quote_clean_attachments where id=v_first;
  if v_count <> 0 then raise exception 'structure-validated file bypassed quarantine'; end if;

  select * into v_claim from public.quote_claim_attachment_scan();
  if not found or v_claim.attachment_id<>v_first then
    raise exception 'scanner claimed an unvalidated or different file';
  end if;
  select public.quote_finish_attachment_scan(
    v_first,v_claim.lease_token,'clean',repeat('d',64)
  ) into v_result;
  if not v_result then raise exception 'clean scan verdict rejected'; end if;
  select count(*) into v_count from public.quote_clean_attachments where id=v_first;
  if v_count <> 1 then raise exception 'clean scan missing from release view'; end if;
  select public.quote_finish_attachment_scan(
    v_first,v_claim.lease_token,'infected',repeat('d',64)
  ) into v_result;
  if v_result then raise exception 'replayed scan lease was accepted'; end if;

  update public.quote_attachments set validation_status='validated',
      validated_size_bytes=1024 where id=v_second;
  select * into v_claim from public.quote_claim_attachment_scan();
  if not found or v_claim.attachment_id<>v_second then
    raise exception 'second validated object could not be claimed';
  end if;
  select public.quote_finish_attachment_scan(
    v_second,v_claim.lease_token,'infected',repeat('e',64)
  ) into v_result;
  if not v_result then raise exception 'infected verdict was not saved'; end if;
  select count(*) into v_count from public.quote_clean_attachments where id=v_second;
  if v_count <> 0 then raise exception 'infected object leaked into release view'; end if;
  select count(*) into v_count from public.quote_attachments
    where id=v_second and validation_status='rejected' and validation_code='malware_detected';
  if v_count <> 1 then raise exception 'infected object not rejected'; end if;

  if has_table_privilege('anon','public.quote_clean_attachments','SELECT') or
     has_table_privilege('authenticated','public.quote_attachment_scans','SELECT') or
     has_function_privilege('anon','public.quote_claim_attachment_scan()','EXECUTE') then
    raise exception 'unauthorized database role can access quarantine control';
  end if;
  raise notice 'quote security migration checks passed';
end $test$;
rollback;
