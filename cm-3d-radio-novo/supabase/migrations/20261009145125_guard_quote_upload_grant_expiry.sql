
-- Prevent a privileged integration from accidentally shortening a still-valid
-- signed upload grant to release reserved bytes while TUS may still write.
create function public.quote_grant_expiry_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.grant_expires_at < old.grant_expires_at then
    raise exception 'upload_grant_expiry_cannot_be_shortened'
      using errcode='23514';
  end if;
  return new;
end
$$;
revoke all on function public.quote_grant_expiry_guard()
  from public, anon, authenticated;
create trigger quote_grant_expiry_guard
  before update of grant_expires_at on public.quote_attachments
  for each row execute function public.quote_grant_expiry_guard();
