-- Permit one HTTPS model reference instead of an attachment for impression quotes.
create or replace function public.quote_submit(
  p_request_id uuid,p_owner_session_hash text,p_submission_key uuid,
  p_project_type text,p_no_file boolean,p_starting_points text[],
  p_source_origin text,p_source_reference text,p_production jsonb,p_project jsonb,
  p_contact_method text,p_contact_name text,p_contact_value text,
  p_triage_status text,p_attachment_ids uuid[]
) returns table(request_id uuid,submission_time timestamptz)
language plpgsql security invoker set search_path = ''
as $$
declare
  v_q public.quote_requests%rowtype;
  v_count integer;
  v_valid_count integer;
  v_total bigint;
  v_distinct_count integer;
  v_match_count integer;
begin
  if p_request_id is null or p_submission_key is null or
     p_owner_session_hash is null or p_owner_session_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_quote_submit' using errcode='22023';
  end if;
  select q.* into v_q from public.quote_requests q
    where q.id=p_request_id and q.owner_session_hash=p_owner_session_hash
    for update;
  if not found then
    raise exception 'quote_draft_unavailable' using errcode='P0001';
  end if;
  if v_q.lifecycle_status in ('submitted','reviewing','closed') then
    if v_q.submission_key=p_submission_key then
      return query select v_q.id,v_q.submitted_at;
      return;
    end if;
    raise exception 'quote_already_submitted' using errcode='23505';
  end if;
  if v_q.lifecycle_status<>'draft' or v_q.expires_at<=transaction_timestamp() or
     v_q.project_type is distinct from p_project_type or
     p_no_file is null or
     p_contact_method is null or p_contact_method not in ('email','whatsapp') or
     p_triage_status is null or p_triage_status not in ('ready-for-review','needs-information') or
     char_length(btrim(coalesce(p_contact_name,''))) not between 1 and 160 or
     char_length(btrim(coalesce(p_contact_value,''))) not between 1 and 320 or
     p_attachment_ids is null or cardinality(p_attachment_ids)>5 or
     array_position(p_attachment_ids,null) is not null or
     p_production is null or jsonb_typeof(p_production)<>'object' or
     p_project is null or jsonb_typeof(p_project)<>'object' or
     p_starting_points is null or cardinality(p_starting_points)>12 or
     array_position(p_starting_points,null) is not null or
     p_project_type<>'impressao' and cardinality(p_starting_points)=0 then
    raise exception 'invalid_quote_submit_payload' using errcode='22023';
  end if;

  select count(*),
         count(*) filter (where validation_status='validated'
           and validated_size_bytes is not null),
         coalesce(sum(coalesce(validated_size_bytes,0)),0)
    into v_count,v_valid_count,v_total
    from public.quote_attachments
    where quote_request_id=p_request_id and quota_released_at is null;

  select count(distinct x),count(*) filter (
      where exists (
        select 1 from public.quote_attachments a
        where a.id=u.x and a.quote_request_id=p_request_id
          and a.quota_released_at is null))
    into v_distinct_count,v_match_count
    from unnest(p_attachment_ids) as u(x);

  if v_count<>cardinality(p_attachment_ids) or
     v_valid_count<>v_count or v_distinct_count<>v_count or
     v_match_count<>v_count or
     v_total>100000000 or
     (p_no_file and v_count<>0) or
     (not p_no_file and v_count=0) or
     (p_project_type='impressao' and (
       p_project->>'kind' is distinct from 'impressao' or
       (p_no_file and (
         p_project->>'modelLink' is null or
         char_length(p_project->>'modelLink') > 2000 or
         not (p_project->>'modelLink' ~* '^https://((www\.)?makerworld\.com/([a-z]{2}(-[a-z]{2})?/)?models/[0-9]+(-[^/?#]+)?/?|share\.bambulab\.com/[a-z0-9_-]+/?)([?#].*)?$')
       )) or
       (not p_no_file and p_project->>'modelLink' is not null)
     )) then
    raise exception 'quote_attachments_not_validated' using errcode='23514';
  end if;

  update public.quote_requests set
    lifecycle_status='submitted',submission_key=p_submission_key,
    submitted_at=transaction_timestamp(),triage_status=p_triage_status,
    no_file=p_no_file,starting_points=p_starting_points,
    source_origin=p_source_origin,source_reference=p_source_reference,
    production=p_production,project=p_project,
    contact_method=p_contact_method,contact_name=btrim(p_contact_name),
    contact_value=btrim(p_contact_value),
    expires_at=transaction_timestamp()+interval '180 days',
    last_activity_at=transaction_timestamp(),updated_at=transaction_timestamp()
  where id=p_request_id;

  update public.quote_attachments
    set expires_at=transaction_timestamp()+interval '90 days',
        updated_at=transaction_timestamp()
    where quote_request_id=p_request_id and quota_released_at is null;

  insert into public.quote_events(quote_request_id,event_type,event_status)
    values(p_request_id,'submit','accepted');
  return query select p_request_id,transaction_timestamp();
end $$;
revoke all on function public.quote_submit(
  uuid,text,uuid,text,boolean,text[],text,text,jsonb,jsonb,text,text,text,text,uuid[]
) from public,anon,authenticated;
grant execute on function public.quote_submit(
  uuid,text,uuid,text,boolean,text[],text,text,jsonb,jsonb,text,text,text,text,uuid[]
) to service_role;

