import "server-only";

import type {
  ApiKeyCreatedResponse,
  ApiKeyListItem,
} from "./api-key-types";
import { getServiceSupabase } from "./supabase/server";

export type InsertApiKeyInput = {
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
};

type InsertedRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
};

/**
 * Insert a new key row (metadata + hash). The caller keeps `fullKey` and must expose it to the user only once.
 */
export async function insertApiKey(
  input: InsertApiKeyInput,
): Promise<InsertedRow> {
  const supabase = getServiceSupabase();
  const name = input.name.trim();

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: input.userId,
      name,
      key_prefix: input.keyPrefix,
      key_hash: input.keyHash,
    })
    .select("id, name, key_prefix, created_at")
    .single();

  if (error) {
    throw new Error(`insertApiKey: ${error.message}`);
  }
  if (!data) {
    throw new Error("insertApiKey: no row returned");
  }

  return data as InsertedRow;
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
  };
}

/** List keys for a user (excludes `key_hash`). */
export async function listApiKeysForUser(
  userId: string,
): Promise<ApiKeyListItem[]> {
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("api_keys")
    .select(
      "id, user_id, name, key_prefix, created_at, last_used_at, revoked_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`listApiKeysForUser: ${error.message}`);
  }

  return (data ?? []) as ApiKeyListItem[];
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

  const { data, error } = await supabase
    .from("api_keys")
    .update({ name: trimmed })
    .eq("id", keyId)
    .eq("user_id", userId)
    .select(
      "id, user_id, name, key_prefix, created_at, last_used_at, revoked_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(`updateApiKeyNameForUser: ${error.message}`);
  }

  return (data as ApiKeyListItem | null) ?? null;
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
