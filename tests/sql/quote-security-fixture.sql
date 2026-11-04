-- Disposable PostgreSQL fixture for security migration CI. NEVER run on live Supabase.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create table public.quote_upload_limits (
  bucket_id text primary key,
  max_bytes bigint not null
);
insert into public.quote_upload_limits values ('quote-intake', 600000000);
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  owner_session_hash text not null
);
create table public.quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id),
  storage_bucket text not null default 'quote-intake',
  storage_path text not null,
  size_bytes bigint not null default 1024,
  accounted_bytes bigint not null default 50000000,
  validated_size_bytes bigint,
  validation_status text not null default 'pending-upload',
  validation_code text,
  quota_released_at timestamptz,
  updated_at timestamptz not null default now()
);
