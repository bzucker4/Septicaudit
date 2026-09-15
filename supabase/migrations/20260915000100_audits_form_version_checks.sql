-- Follow-up (non-blocking): form_version + service-log numeric CHECKs.
-- Does not alter the approved core audits DDL shape from 20260915000000_audits.sql.

alter table public.audits
  add column if not exists form_version text;

alter table public.audits
  drop constraint if exists audits_tank_size_positive;
alter table public.audits
  add constraint audits_tank_size_positive
    check (tank_size_gallons is null or tank_size_gallons > 0);

alter table public.audits
  drop constraint if exists audits_gallons_pumped_nonneg;
alter table public.audits
  add constraint audits_gallons_pumped_nonneg
    check (gallons_pumped is null or gallons_pumped >= 0);
