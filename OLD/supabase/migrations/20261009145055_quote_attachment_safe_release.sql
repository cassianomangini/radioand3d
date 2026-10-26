
-- E2/P4: fail-closed release and deletion after confirmed Storage API cleanup.
-- The token lifetime cannot be shortened by an application update.
create or replace function public.quote_attachment_delete_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if old.quota_released_at is null
     or exists (
       select 1 from storage.objects o
       where o.bucket_id='quote-intake' and o.name=old.storage_path
     ) then
    raise exception 'attachment_storage_must_be_removed_before_delete'
      using errcode='23514';
  end if;
  return old;
end
$$;

revoke all on function public.quote_attachment_delete_guard()
  from public, anon, authenticated;

create trigger quote_attachment_delete_guard
  before delete on public.quote_attachments
  for each row execute function public.quote_attachment_delete_guard();

-- The storage-side signed grant may outlive a partial upload.
-- Only release after the grant has expired AND the object is absent.
-- The server must also verify Storage API deletion/absence; SQL metadata
-- cannot prove remote bytes were physically deleted.
create function public.quote_release_attachment(
  p_request_id uuid,
  p_owner_session_hash text,
  p_attachment_id uuid
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request_id uuid;
  v_attachment public.quote_attachments%rowtype;
begin
  select q.id into v_request_id
  from public.quote_requests q
  where q.id=p_request_id
    and q.owner_session_hash=p_owner_session_hash
  for update;
  if not found then
    raise exception 'quote_draft_unavailable' using errcode='P0001';
  end if;

  select * into v_attachment
    from public.quote_attachments a
    where a.id=p_attachment_id and a.quote_request_id=p_request_id
    for update;
  if not found then
    return false;
  end if;
  if v_attachment.quota_released_at is not null then
    return true;
  end if;

  update public.quote_attachments
  set validation_status='expired',
      quota_released_at=transaction_timestamp(),
      updated_at=transaction_timestamp()
  where id=p_attachment_id and quote_request_id=p_request_id;

  return true;
end
$$;

revoke all on function public.quote_release_attachment(
  uuid, text, uuid
) from public, anon, authenticated;
grant execute on function public.quote_release_attachment(
  uuid, text, uuid
) to service_role;
