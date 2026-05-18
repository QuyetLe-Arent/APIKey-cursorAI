import "server-only";

import type {
  ApiKeyCreatedResponse,
  ApiKeyListItem,
} from "./api-key-types";
import { getServiceSupabase } from "./supabase/server";

export const DEFAULT_USAGE_LIMIT = 1000;

const API_KEY_LIST_COLUMNS =
  "id, user_id, name, key_prefix, created_at, last_used_at, revoked_at";

export type InsertApiKeyInput = {
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  usageLimit: number;
};

type InsertedRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  usage_limit: number;
};

function isUsageLimitColumnMissing(error: { message?: string; code?: string }): boolean {
  const msg = (error.message ?? "").toLowerCase();
  const code = error.code ?? "";
  if (code === "42703" || code === "PGRST204") return true;
  return (
    msg.includes("usage_limit") &&
    (msg.includes("does not exist") ||
      msg.includes("could not find") ||
      msg.includes("schema cache"))
  );
}

function withUsageLimit(row: Record<string, unknown>, fallback: number): ApiKeyListItem {
  const base = row as unknown as Omit<ApiKeyListItem, "usage_limit">;
  const limit = row.usage_limit;
  return {
    ...base,
    usage_limit: typeof limit === "number" ? limit : fallback,
  };
}

/**
 * Insert a new key row (metadata + hash). The caller keeps `fullKey` and must expose it to the user only once.
 * Works before and after `usage_limit` migration (falls back when the column is missing).
 */
export async function insertApiKey(
  input: InsertApiKeyInput,
): Promise<InsertedRow> {
  const supabase = getServiceSupabase();
  const name = input.name.trim();
  const baseRow = {
    user_id: input.userId,
    name,
    key_prefix: input.keyPrefix,
    key_hash: input.keyHash,
  };

  let { data, error } = await supabase
    .from("api_keys")
    .insert({ ...baseRow, usage_limit: input.usageLimit })
    .select("id, name, key_prefix, created_at, usage_limit")
    .single();

  if (error && isUsageLimitColumnMissing(error)) {
    ({ data, error } = await supabase
      .from("api_keys")
      .insert(baseRow)
      .select("id, name, key_prefix, created_at")
      .single());
    if (!error && data) {
      return { ...(data as Omit<InsertedRow, "usage_limit">), usage_limit: input.usageLimit };
    }
  }

  if (error) {
    throw new Error(`insertApiKey: ${error.message}`);
  }
  if (!data) {
    throw new Error("insertApiKey: no row returned");
  }

  const row = data as { usage_limit?: number } & Omit<InsertedRow, "usage_limit">;
  return {
    id: row.id,
    name: row.name,
    key_prefix: row.key_prefix,
    created_at: row.created_at,
    usage_limit: row.usage_limit ?? input.usageLimit,
  };
}

export function toCreatedResponse(
  row: InsertedRow,
  fullKey: string,
): ApiKeyCreatedResponse {
  return {
    id: row.id,
    name: row.name,
    key: fullKey,
    key_prefix: row.key_prefix,
    created_at: row.created_at,
    usage_limit: row.usage_limit,
  };
}

/** List keys for a user (excludes `key_hash`). */
export async function listApiKeysForUser(
  userId: string,
): Promise<ApiKeyListItem[]> {
  const supabase = getServiceSupabase();

  const withLimit = await supabase
    .from("api_keys")
    .select(`${API_KEY_LIST_COLUMNS}, usage_limit`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (withLimit.error && isUsageLimitColumnMissing(withLimit.error)) {
    const withoutLimit = await supabase
      .from("api_keys")
      .select(API_KEY_LIST_COLUMNS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (withoutLimit.error) {
      throw new Error(`listApiKeysForUser: ${withoutLimit.error.message}`);
    }
    return (withoutLimit.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
  }

  if (withLimit.error) {
    throw new Error(`listApiKeysForUser: ${withLimit.error.message}`);
  }

  return (withLimit.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
}

/** Set `revoked_at` if the key belongs to the user and is not already revoked. Returns `true` if a row was updated. */
export async function revokeApiKeyForUser(
  userId: string,
  keyId: string,
): Promise<boolean> {
  const supabase = getServiceSupabase();
  const revoked_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("api_keys")
    .update({ revoked_at })
    .eq("id", keyId)
    .eq("user_id", userId)
    .is("revoked_at", null)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`revokeApiKeyForUser: ${error.message}`);
  }

  return data !== null;
}

/** Update key label for a user-owned row. Returns updated row or null if not found. */
export async function updateApiKeyNameForUser(
  userId: string,
  keyId: string,
  name: string,
): Promise<ApiKeyListItem | null> {
  const supabase = getServiceSupabase();
  const trimmed = name.trim();

  const withLimit = await supabase
    .from("api_keys")
    .update({ name: trimmed })
    .eq("id", keyId)
    .eq("user_id", userId)
    .select(`${API_KEY_LIST_COLUMNS}, usage_limit`)
    .maybeSingle();

  if (withLimit.error && isUsageLimitColumnMissing(withLimit.error)) {
    const withoutLimit = await supabase
      .from("api_keys")
      .update({ name: trimmed })
      .eq("id", keyId)
      .eq("user_id", userId)
      .select(API_KEY_LIST_COLUMNS)
      .maybeSingle();
    if (withoutLimit.error) {
      throw new Error(`updateApiKeyNameForUser: ${withoutLimit.error.message}`);
    }
    return withoutLimit.data ? withUsageLimit(withoutLimit.data, DEFAULT_USAGE_LIMIT) : null;
  }

  if (withLimit.error) {
    throw new Error(`updateApiKeyNameForUser: ${withLimit.error.message}`);
  }

  return withLimit.data ? withUsageLimit(withLimit.data, DEFAULT_USAGE_LIMIT) : null;
}

/** Hard-delete a row when `user_id` matches. Returns `true` if at least one row was deleted. */
export async function deleteApiKeyForUser(
  userId: string,
  keyId: string,
): Promise<boolean> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", userId)
    .select("id");

  if (error) {
    throw new Error(`deleteApiKeyForUser: ${error.message}`);
  }

  return Array.isArray(data) && data.length > 0;
}
