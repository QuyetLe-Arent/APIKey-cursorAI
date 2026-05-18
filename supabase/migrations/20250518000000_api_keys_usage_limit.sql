-- Optional per-key request limit (metadata). Run in Supabase SQL Editor after the base migration.

alter table public.api_keys
  add column if not exists usage_limit integer not null default 1000;

alter table public.api_keys
  add constraint api_keys_usage_limit_positive check (usage_limit > 0);

comment on column public.api_keys.usage_limit is 'Max API requests allowed for this key (enforced when usage tracking is added).';
