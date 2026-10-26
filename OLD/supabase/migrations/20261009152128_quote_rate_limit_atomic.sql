-- CM 3D & Radio: server-only atomic rate limiting for anonymous quote routes.
-- Stores only a HMAC of normalized client IP, never the IP address itself.
create function public.quote_consume_rate_limit(
  p_action text,
  p_key_hash text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_limit integer;
  v_count integer;
  v_start timestamptz := date_trunc('hour', transaction_timestamp());
begin
  if p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quote_rate_key' using errcode = '22023';
  end if;

  v_limit := case p_action
    when 'create' then 5
    when 'upload' then 25
    when 'submit' then 5
    else null
  end;
  if v_limit is null then
    raise exception 'invalid_quote_rate_action' using errcode = '22023';
  end if;

  insert into public.quote_rate_limit_windows
    (action, key_hash, window_start, request_count, expires_at)
  values
    (p_action, p_key_hash, v_start, 1, v_start + interval '24 hours')
  on conflict (action, key_hash, window_start) do update
    set request_count = public.quote_rate_limit_windows.request_count + 1
    where public.quote_rate_limit_windows.request_count < v_limit
  returning request_count into v_count;

  return v_count is not null and v_count <= v_limit;
end
$$;

revoke all on function public.quote_consume_rate_limit(text, text)
  from public, anon, authenticated;
grant execute on function public.quote_consume_rate_limit(text, text)
  to service_role;
