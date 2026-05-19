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
  usage_limit: number;
  usage_count: number;
};

/** Key resolved after `x-api-key` validation (server-only). */
export type ValidatedApiKey = {
  id: string;
  user_id: string;
  name: string;
  usage_count: number;
  usage_limit: number;
};

/** Client payload right after creation (includes the full secret once). */
export type ApiKeyCreatedResponse = {
  id: string;
  name: string;
  key: string;
  key_prefix: string;
  created_at: string;
  usage_limit: number;
};

/** List view for keys (no secret material). */
export type ApiKeyListItem = Omit<ApiKeyRow, "key_hash">;
