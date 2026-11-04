
-- Cover quote_events -> quote_requests FK for retention/deletion and audit lookup.
create index quote_events_request_fk_idx
  on public.quote_events (quote_request_id);
