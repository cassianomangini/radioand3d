-- CM 3D & Radio only. Aggregate, service-role-only operational metrics.
-- Upload events contain no request ID, file name, path, URL or customer data.
create index quote_events_upload_metrics_idx on public.quote_events (created_at, event_status)
  where event_type = 'upload_authorization';

create function public.quote_observability_snapshot()
returns jsonb
language sql stable security invoker
set search_path = ''
as $$
  with limits as (
    select max_bytes, max_daily_bytes
    from public.quote_upload_limits where bucket_id = 'quote-intake'
  ), attachments as (
    select coalesce(sum(accounted_bytes), 0)::bigint as accounted_bytes,
      coalesce(sum(accounted_bytes) filter (where validation_status <> 'validated'), 0)::bigint as reserved_bytes
    from public.quote_attachments where quota_released_at is null
  ), objects as (
    select coalesce(sum(case when metadata->>'size' ~ '^[0-9]{1,18}$'
      then (metadata->>'size')::bigint else 0 end), 0)::bigint as occupied_bytes,
      count(*) filter (where metadata->>'size' is null or metadata->>'size' !~ '^[0-9]{1,18}$')::bigint as unknown_size_objects
    from storage.objects where bucket_id = 'quote-intake'
  ), daily as (
    select coalesce(sum(reserved_bytes), 0)::bigint as reserved_bytes
    from public.quote_upload_daily_usage
    where day_utc = (transaction_timestamp() at time zone 'UTC')::date
  ), uploads as (
    select count(*) filter (where event_status = 'accepted')::bigint as accepted,
      count(*) filter (where event_status = 'blocked')::bigint as blocked,
      count(*) filter (where event_status = 'blocked' and metadata->>'reason' = 'capacity')::bigint as capacity_blocked
    from public.quote_events
    where event_type = 'upload_authorization'
      and created_at >= date_trunc('day', transaction_timestamp() at time zone 'UTC') at time zone 'UTC'
      and created_at < (date_trunc('day', transaction_timestamp() at time zone 'UTC') + interval '1 day') at time zone 'UTC'
  ), retention as (
    select last_started_at, last_success_at, last_failure_at,
      coalesce((last_result->>'failedObjects')::integer, 0) as failed_objects
    from public.quote_retention_control where name = 'quote-intake'
  )
  select jsonb_build_object(
    'maxBytes', limits.max_bytes,
    'maxDailyBytes', limits.max_daily_bytes,
    'accountedBytes', attachments.accounted_bytes,
    'reservedBytes', attachments.reserved_bytes,
    'occupiedBytes', objects.occupied_bytes,
    'unknownSizeObjects', objects.unknown_size_objects,
    'dailyReservedBytes', daily.reserved_bytes,
    'acceptedUploadsToday', uploads.accepted,
    'blockedUploadsToday', uploads.blocked,
    'capacityBlockedToday', uploads.capacity_blocked,
    'retentionFailedObjects', retention.failed_objects,
    'retentionLastStartedAt', retention.last_started_at,
    'retentionLastSuccessAt', retention.last_success_at,
    'retentionLastFailureAt', retention.last_failure_at
  )
  from limits cross join attachments cross join objects cross join daily cross join uploads cross join retention
$$;
revoke all on function public.quote_observability_snapshot() from public, anon, authenticated;
grant execute on function public.quote_observability_snapshot() to service_role;
