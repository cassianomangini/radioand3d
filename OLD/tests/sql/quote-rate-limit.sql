-- E2: synthetic, transactionally rolled-back atomic rate-limit checks.
-- Never stores a raw client IP; all keys below are synthetic HMAC-shaped hashes.
begin;
set local lock_timeout = '5s';

do $$
declare
  n integer;
  allowed boolean;
begin
  for n in 1..5 loop
    select public.quote_consume_rate_limit('create',repeat('a',64)) into allowed;
    if not allowed then raise exception 'create_request_%_incorrectly_rejected', n; end if;
  end loop;
  select public.quote_consume_rate_limit('create',repeat('a',64)) into allowed;
  if allowed then raise exception 'sixth_create_request_accepted'; end if;

  select public.quote_consume_rate_limit('upload',repeat('a',64)) into allowed;
  if not allowed then raise exception 'different_action_should_have_own_limit'; end if;
  select public.quote_consume_rate_limit('create',repeat('b',64)) into allowed;
  if not allowed then raise exception 'different_hmac_should_have_own_limit'; end if;

  if (select request_count from public.quote_rate_limit_windows
      where action='create' and key_hash=repeat('a',64)) <> 5 then
    raise exception 'denied_call_incremented_stored_count';
  end if;

  if has_function_privilege('anon','public.quote_consume_rate_limit(text,text)','execute') or
     has_function_privilege('authenticated','public.quote_consume_rate_limit(text,text)','execute') then
    raise exception 'client_can_execute_private_rate_function';
  end if;
  raise notice 'PASS: rate limit max, action/key isolation, no rejected increment, ACL';
end $$;

rollback;
