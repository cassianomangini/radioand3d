-- Transactional database test; safe to run against a configured CM test project.
-- Uses synthetic values only and always rolls back. Never invoke with psql -1
-- combined with unrelated DDL; this script creates no persistent client data.
begin;
set local lock_timeout = '5s';

do $$
declare
  q1 uuid;
  q2 uuid;
  k uuid := gen_random_uuid();
  first_id uuid;
  first_path text;
  repeat_path text;
  denied boolean;
begin
  if not exists (
    select 1 from storage.buckets
    where id='quote-intake' and public=false and file_size_limit=50000000
  ) then raise exception 'private_bucket_not_configured'; end if;

  if exists(
    select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and ('anon'=any(roles) or 'authenticated'=any(roles))
  ) then raise exception 'unexpected_storage_object_policy'; end if;

  if exists (
    select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public' and c.relkind='r' and c.relname like 'quote_%'
      and (not c.relrowsecurity or has_table_privilege('anon',c.oid,'select')
       or has_table_privilege('authenticated',c.oid,'select'))
  ) then raise exception 'private_table_acl_violation'; end if;

  insert into public.quote_requests(project_type,owner_session_hash)
    values ('impressao',repeat('a',64)) returning id into q1;

  select attachment_id,object_path into first_id,first_path
    from public.quote_reserve_attachment(q1,repeat('a',64),k,
      'model.stl','.stl','application/octet-stream',1);
  select object_path into repeat_path
    from public.quote_reserve_attachment(q1,repeat('a',64),k,
      'model.stl','.stl','application/octet-stream',1);
  if first_path is distinct from repeat_path then
    raise exception 'idempotency_broken';
  end if;
  if (select grant_expires_at from public.quote_attachments where id=first_id)
      < transaction_timestamp()+interval '26 hours 59 minutes' then
    raise exception 'tus_reservation_does_not_cover_24h_resumable_url';
  end if;
  if (select expires_at from public.quote_requests where id=q1)
      < transaction_timestamp()+interval '23 hours 59 minutes' then
    raise exception 'draft_sliding_expiry_not_refreshed';
  end if;


  denied:=false;
  begin
    perform 1 from public.quote_reserve_attachment(q1,repeat('b',64),
      gen_random_uuid(),'other.stl','.stl',null,1);
  exception when others then denied:=true; end;
  if not denied then raise exception 'cross_session_access_not_denied'; end if;

  denied:=false;
  begin
    perform 1 from public.quote_reserve_attachment(q1,repeat('a',64),
      k,'changed.stl','.stl','application/octet-stream',1);
  exception when others then denied:=true; end;
  if not denied then raise exception 'conflicting_idempotency_not_denied'; end if;

  perform 1 from public.quote_reserve_attachment(q1,repeat('a',64),
    gen_random_uuid(),'diagram.pdf','.pdf','application/pdf',1);
  denied:=false;
  begin
    perform 1 from public.quote_reserve_attachment(q1,repeat('a',64),
      gen_random_uuid(),'third.png','.png','image/png',1);
  exception when others then denied:=true; end;
  if not denied then raise exception 'request_quota_not_enforced'; end if;

  denied:=false;
  begin
    update public.quote_attachments set accounted_bytes=1 where id=first_id;
  exception when others then denied:=true; end;
  if not denied then raise exception 'direct_accounting_tamper_allowed'; end if;

  denied:=false;
  begin
    update public.quote_attachments
      set validation_status='validated',validated_size_bytes=1,accounted_bytes=1
      where id=first_id;
  exception when others then denied:=true; end;
  if not denied then raise exception 'phantom_object_validated'; end if;

  denied:=false;
  begin
    update public.quote_attachments set
      validation_status='expired',quota_released_at=transaction_timestamp()
      where id=first_id;
  exception when others then denied:=true; end;
  if not denied then raise exception 'active_grant_released_early'; end if;

  insert into public.quote_requests(project_type,owner_session_hash)
    values ('impressao',repeat('c',64)) returning id into q2;
  update public.quote_upload_limits set max_bytes=100000000
    where bucket_id='quote-intake';

  denied:=false;
  begin
    perform 1 from public.quote_reserve_attachment(q2,repeat('c',64),
      gen_random_uuid(),'new.3mf','.3mf','application/octet-stream',1);
  exception when others then denied:=true; end;
  if not denied then raise exception 'global_capacity_not_enforced'; end if;

  raise notice 'OK: bucket, ACL/RLS, retries, owner, request/global quotas, unverified object and premature release';
end $$;

rollback;
