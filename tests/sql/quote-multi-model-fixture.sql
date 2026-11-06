-- Disposable PostgreSQL test database only. Never run on live Supabase.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema storage;
create table storage.objects (
  bucket_id text not null, name text not null, metadata jsonb not null default '{}'::jsonb,
  primary key(bucket_id, name)
);
create table public.quote_upload_limits (
  bucket_id text primary key, max_bytes bigint not null
);
insert into public.quote_upload_limits(bucket_id,max_bytes) values ('quote-intake',600000000);
create table public.quote_requests (
  id uuid primary key, owner_session_hash text not null,
  lifecycle_status text not null default 'draft',
  project_type text not null default 'impressao',
  expires_at timestamptz not null default now()+interval '24 hours'
);
create table public.quote_attachments (
  id uuid primary key, quote_request_id uuid not null references public.quote_requests(id),
  upload_key uuid not null, storage_bucket text not null default 'quote-intake',
  storage_path text not null, original_name text not null, extension text not null,
  reported_mime text, size_bytes bigint not null,
  accounted_bytes bigint not null default 50000000,
  grant_expires_at timestamptz not null default now()+interval '27 hours',
  validated_size_bytes bigint, validation_status text not null default 'pending-upload',
  quota_released_at timestamptz, detected_type text,
  uploaded_at timestamptz, validated_at timestamptz, updated_at timestamptz default now(),
  unique (quote_request_id,upload_key)
);
create function public.quote_touch_draft(p_request_id uuid)
returns void language plpgsql as $$ begin return; end $$;
