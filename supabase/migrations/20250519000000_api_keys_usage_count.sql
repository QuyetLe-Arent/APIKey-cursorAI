-- Track API calls per key (Playground + public endpoints). Safe to re-run in Supabase SQL Editor.

alter table public.api_keys
  add column if not exists usage_count integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'api_keys_usage_count_non_negative'
      and conrelid = 'public.api_keys'::regclass
  ) then
    alter table public.api_keys
      add constraint api_keys_usage_count_non_negative check (usage_count >= 0);
  end if;
end $$;

comment on column public.api_keys.usage_count is 'Number of successful API requests made with this key.';
