-- Optional per-key request limit (metadata). Safe to re-run in Supabase SQL Editor.

alter table public.api_keys
  add column if not exists usage_limit integer not null default 1000;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'api_keys_usage_limit_positive'
      and conrelid = 'public.api_keys'::regclass
  ) then
    alter table public.api_keys
      add constraint api_keys_usage_limit_positive check (usage_limit > 0);
  end if;
end $$;

comment on column public.api_keys.usage_limit is 'Max API requests allowed for this key (enforced when usage tracking is added).';
