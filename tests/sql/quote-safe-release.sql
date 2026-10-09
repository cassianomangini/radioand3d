-- Negative and positive cleanup invariants. Synthetic data, ROLLBACK at end.
begin;
set local lock_timeout = '5s';
do $$
declare
  v_request uuid;
  v_pending uuid;
  v_expired uuid;
  v_denied boolean;
  v_result boolean;
begin
  insert into public.quote_requests(project_type, owner_session_hash)
    values ('impressao',repeat('a',64)) returning id into v_request;

  select attachment_id into v_pending
    from public.quote_reserve_attachment(
      v_request,repeat('a',64),gen_random_uuid(),
      'pending.stl','.stl','application/octet-stream',1000
    );

  v_denied:=false;
  begin
    delete from public.quote_attachments where id=v_pending;
  exception when others then v_denied:=true; end;
  if not v_denied then raise exception 'reserved_row_deleted_while_token_valid'; end if;

  v_denied:=false;
  begin
    update public.quote_attachments
      set grant_expires_at=transaction_timestamp()
      where id=v_pending;
  exception when others then v_denied:=true; end;
  if not v_denied then raise exception 'token_grant_shortened'; end if;

  v_denied:=false;
  begin
    perform public.quote_release_attachment(
      v_request,repeat('a',64),v_pending);
  exception when others then v_denied:=true; end;
  if not v_denied then raise exception 'live_token_quota_released'; end if;

  insert into public.quote_attachments(
    quote_request_id,upload_key,storage_path,original_name,
    extension,size_bytes,accounted_bytes,grant_expires_at
  ) values (
    v_request,gen_random_uuid(),
    v_request::text||'/'||gen_random_uuid()::text||'.stl',
    'expired.stl','.stl',100,50000000,
    transaction_timestamp()-interval '1 minute'
  ) returning id into v_expired;

  v_denied:=false;
  begin
    perform public.quote_release_attachment(
      v_request,repeat('b',64),v_expired);
  exception when others then v_denied:=true; end;
  if not v_denied then raise exception 'wrong_session_cleanup_allowed'; end if;

  v_result:=public.quote_release_attachment(
    v_request,repeat('a',64),v_expired);
  if not v_result then raise exception 'verified_cleanup_failed'; end if;
  v_result:=public.quote_release_attachment(
    v_request,repeat('a',64),v_expired);
  if not v_result then raise exception 'cleanup_retry_not_idempotent'; end if;

  delete from public.quote_attachments where id=v_expired;
  if exists(select 1 from public.quote_attachments where id=v_expired)
  then raise exception 'cleanup_delete_failed'; end if;
  raise notice 'PASS: cannot delete reserved upload or shorten token, expired cleanup only, owner check, idempotency';
end $$;
rollback;
