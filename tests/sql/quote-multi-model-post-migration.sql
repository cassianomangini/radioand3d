-- Existing production trigger from quote_private_bucket_and_capacity.sql.
-- The disposable fixture adds it only after the replacement function exists.
create trigger quote_attachment_capacity_guard
  before insert or update on public.quote_attachments
  for each row execute function public.quote_attachment_capacity_guard();
