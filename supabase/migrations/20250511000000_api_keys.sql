-- API keys: metadata + scrypt hash only. Run in Supabase → SQL Editor (or `supabase db push`).
-- user_id: matches the NextAuth user id (string), e.g. Google `sub`.

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null default '',
  key_prefix text not null,
  key_hash text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_keys_user_id_idx on public.api_keys (user_id);
create index if not exists api_keys_user_id_revoked_idx on public.api_keys (user_id) where revoked_at is null;

comment on table public.api_keys is 'API keys: display prefix + scrypt hash of full key (format akm_...).';
comment on column public.api_keys.key_prefix is 'Leading characters of the full key for UI display, e.g. akm_Ab3xYz9...';
comment on column public.api_keys.key_hash is 'Base64url string containing salt + scrypt hash of the entire full key.';
