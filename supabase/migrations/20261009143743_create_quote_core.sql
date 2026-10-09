-- CM 3D & Radio: private quote intake persistence, server-only access.
-- No consumer/marketplace tables, no public policies, no personal seed data.

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  schema_version smallint not null default 1 check (schema_version = 1),
  owner_session_hash text not null check (owner_session_hash ~ '^[0-9a-f]{64}$'),
  lifecycle_status text not null default 'draft'
    check (lifecycle_status in ('draft', 'submitted', 'reviewing', 'closed', 'expired')),
  triage_status text
    check (triage_status in ('ready-for-review', 'needs-information', 'incomplete')),
  project_type text not null
    check (project_type in ('impressao', 'placa', 'caixa', 'outro')),
  source_origin text check (char_length(source_origin) <= 160),
  source_reference text check (char_length(source_reference) <= 300),
  starting_points text[] not null default '{}',
  no_file boolean not null default false,
  production jsonb not null default '{}'::jsonb
    check (jsonb_typeof(production) = 'object' and octet_length(production::text) <= 32768),
  project jsonb not null default '{}'::jsonb
    check (jsonb_typeof(project) = 'object' and octet_length(project::text) <= 32768),
  contact_method text check (contact_method in ('whatsapp', 'email')),
  contact_name text check (char_length(contact_name) <= 160),
  contact_value text check (char_length(contact_value) <= 320),
  submission_key uuid unique,
  submitted_at timestamptz,
  last_activity_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_requests_expiry_after_creation check (expires_at > created_at),
  constraint quote_requests_submitted_timestamp_consistent check (
    (lifecycle_status in ('draft', 'expired') and submitted_at is null)
    or (lifecycle_status in ('submitted', 'reviewing', 'closed') and submitted_at is not null)
  )
);

create table public.quote_attachments (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete restrict,
  storage_bucket text not null default 'quote-intake'
    check (storage_bucket = 'quote-intake'),
  storage_path text not null unique
    check (char_length(storage_path) between 1 and 380),
  original_name text not null check (char_length(original_name) between 1 and 255),
  extension text not null
    check (extension in ('.stl', '.3mf', '.obj', '.step', '.stp', '.pdf', '.png', '.jpg', '.jpeg', '.webp')),
  reported_mime text check (char_length(reported_mime) <= 120),
  detected_type text check (char_length(detected_type) <= 120),
  size_bytes bigint not null check (size_bytes between 1 and 52428800),
  validated_size_bytes bigint check (validated_size_bytes between 1 and 52428800),
  validation_status text not null default 'pending-upload'
    check (validation_status in ('pending-upload', 'uploaded', 'validated', 'rejected', 'expired')),
  validation_code text check (char_length(validation_code) <= 80),
  uploaded_at timestamptz,
  validated_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_attachments_expiry_after_creation check (expires_at > created_at),
  constraint quote_attachments_validation_timestamps check (
    validated_at is null or (uploaded_at is not null and validation_status in ('validated', 'rejected', 'expired'))
  )
);

create table public.quote_events (
  id bigint generated always as identity primary key,
  quote_request_id uuid references public.quote_requests(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  event_status text not null check (char_length(event_status) between 1 and 40),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 4096),
  created_at timestamptz not null default now()
);

create table public.quote_rate_limit_windows (
  action text not null check (action in ('create', 'upload', 'submit')),
  key_hash text not null check (key_hash ~ '^[0-9a-f]{64}$'),
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  expires_at timestamptz not null,
  primary key (action, key_hash, window_start),
  constraint quote_rate_limit_expiry_after_window check (expires_at > window_start)
);

create index quote_requests_owner_status_idx on public.quote_requests
  (owner_session_hash, lifecycle_status, expires_at);
create index quote_requests_retention_idx on public.quote_requests
  (expires_at, lifecycle_status);
create index quote_requests_submitted_idx on public.quote_requests
  (submitted_at) where submitted_at is not null;
create index quote_attachments_request_idx on public.quote_attachments
  (quote_request_id, validation_status);
create index quote_attachments_retention_idx on public.quote_attachments
  (expires_at, validation_status);
create index quote_events_retention_idx on public.quote_events (created_at);
create index quote_rate_limit_expiry_idx on public.quote_rate_limit_windows (expires_at);

alter table public.quote_requests enable row level security;
alter table public.quote_attachments enable row level security;
alter table public.quote_events enable row level security;
alter table public.quote_rate_limit_windows enable row level security;

-- Explicit grants: new Supabase projects no longer auto-expose public tables.
-- The application only accesses these tables using server-side secret credentials.
revoke all on table public.quote_requests from public, anon, authenticated;
revoke all on table public.quote_attachments from public, anon, authenticated;
revoke all on table public.quote_events from public, anon, authenticated;
revoke all on table public.quote_rate_limit_windows from public, anon, authenticated;
revoke all on sequence public.quote_events_id_seq from public, anon, authenticated;

grant select, insert, update, delete on table
  public.quote_requests,
  public.quote_attachments,
  public.quote_events,
  public.quote_rate_limit_windows
  to service_role;
grant usage, select on sequence public.quote_events_id_seq to service_role;

-- Deliberately no policies: anon/authenticated cannot directly access quotes.
-- Authorization by cookie, request ID and owner_session_hash belongs in server routes.
