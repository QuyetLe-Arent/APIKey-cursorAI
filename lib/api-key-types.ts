/** Row shape for `public.api_keys` (Supabase / Postgres). */
export type ApiKeyRow = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

/** Client payload right after creation (includes the full secret once). */
export type ApiKeyCreatedResponse = {
  id: string;
  name: string;
  key: string;
  key_prefix: string;
  created_at: string;
};

/** List view for keys (no secret material). */
export type ApiKeyListItem = Omit<ApiKeyRow, "key_hash">;
