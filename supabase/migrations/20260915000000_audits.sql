-- SepticAudit audits table (Tally webhook + future ledger form)
-- Aligns with src/lib/audit types/engine + live dWyO7y service-log amendments.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create type public.audit_grade as enum ('sound', 'watch', 'risk', 'critical');
create type public.audit_source as enum ('tally_webhook', 'manual', 'import', 'reinspect');

create type public.wny_county as enum (
  'erie',
  'niagara',
  'genesee',
  'orleans',
  'wyoming',
  'cattaraugus',
  'chautauqua',
  'allegany',
  'other'
);

create table public.audits (
  id uuid primary key default gen_random_uuid(),

  public_id text not null,
  constraint audits_public_id_format
    check (public_id ~ '^SA-[0-9]{4}-[0-9]{4}$'),

  source public.audit_source not null default 'tally_webhook',

  tally_event_id text,
  tally_response_id text,
  tally_form_id text,
  request_idempotency_key text,

  contact_name text,
  contact_email citext,
  contact_phone text,
  contact_role text,

  property_address_line1 text not null,
  property_address_line2 text,
  property_city text,
  property_state text not null default 'NY',
  property_postal text,
  county public.wny_county,
  parcel_id text,
  parcel_data jsonb not null default '{}'::jsonb,
  latitude numeric(9, 6),
  longitude numeric(9, 6),

  answers jsonb not null default '{}'::jsonb,
  tank_condition text,
  occupancy text,
  symptoms text[] not null default '{}',

  -- Nullable when service-log only (incomplete ledger answers). Pair check enforces both-or-neither.
  score smallint,
  grade public.audit_grade,
  findings jsonb not null default '[]'::jsonb,
  actions text[] not null default '{}',
  pump_within_months integer,
  certified_inspect boolean not null default false,
  engine_version text not null default '1',

  -- Live Tally dWyO7y service-log fields
  tank_size_gallons numeric,
  gallons_pumped numeric,
  photo_refs jsonb not null default '[]'::jsonb,
  acknowledgment boolean,

  raw_payload jsonb not null,
  pdf_storage_path text,
  pdf_sha256 text,
  email_dispatched_at timestamptz,
  email_message_id text,
  email_error text,

  prior_audit_id uuid references public.audits (id) on delete set null,
  property_key text generated always as (
    lower(
      coalesce(parcel_id, '') || '|' ||
      coalesce(property_address_line1, '') || '|' ||
      coalesce(property_postal, '')
    )
  ) stored,
  inspected_at timestamptz,
  reinspect_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint audits_score_grade_pair check (
    (score is null and grade is null)
    or (score is not null and grade is not null)
  ),
  constraint audits_score_range check (score is null or score between 0 and 100),
  constraint audits_pump_months_nonneg
    check (pump_within_months is null or pump_within_months >= 0),
  constraint audits_state_ny check (property_state ~ '^[A-Z]{2}$'),
  constraint audits_findings_is_array check (jsonb_typeof(findings) = 'array'),
  constraint audits_answers_is_object check (jsonb_typeof(answers) = 'object'),
  constraint audits_raw_is_object check (jsonb_typeof(raw_payload) = 'object'),
  constraint audits_parcel_data_is_object check (jsonb_typeof(parcel_data) = 'object'),
  constraint audits_photo_refs_is_array check (jsonb_typeof(photo_refs) = 'array')
);

-- Uniqueness / idempotency
create unique index audits_public_id_uidx on public.audits (public_id);
create unique index audits_tally_event_uidx
  on public.audits (tally_event_id) where tally_event_id is not null;
create unique index audits_tally_response_uidx
  on public.audits (tally_response_id) where tally_response_id is not null;
create unique index audits_idempotency_uidx
  on public.audits (request_idempotency_key) where request_idempotency_key is not null;

-- Query paths (auditor package)
create index audits_created_at_idx on public.audits (created_at desc);
create index audits_county_created_idx on public.audits (county, created_at desc);
create index audits_grade_idx on public.audits (grade);
create index audits_score_idx on public.audits (score);
create index audits_contact_email_idx on public.audits (contact_email);
create index audits_property_key_idx on public.audits (property_key);
create index audits_reinspect_due_idx
  on public.audits (reinspect_due_at) where reinspect_due_at is not null;
create index audits_prior_audit_idx
  on public.audits (prior_audit_id) where prior_audit_id is not null;
create index audits_answers_gin on public.audits using gin (answers jsonb_path_ops);
create index audits_symptoms_gin on public.audits using gin (symptoms);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

-- RLS: enable, no anon/authenticated policies (deny by default).
-- Service role (webhook) bypasses RLS.
alter table public.audits enable row level security;
