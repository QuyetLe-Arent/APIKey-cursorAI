import "server-only";

import type {
  ApiKeyCreatedResponse,
  ApiKeyListItem,
  ValidatedApiKey,
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

export type ApiKeyVerifyCandidate = {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  usage_count: number;
  usage_limit: number;
};

export type RecordUsageResult =
  | { ok: true; usage_count: number; usage_limit: number }
  | { ok: false; reason: "quota_exceeded" };

function isColumnMissing(
  error: { message?: string; code?: string },
  column: string,
): boolean {
  const msg = (error.message ?? "").toLowerCase();
  const col = column.toLowerCase();
  if (error.code === "42703" || error.code === "PGRST204") return msg.includes(col);
  return (
    msg.includes(col) &&
    (msg.includes("does not exist") ||
      msg.includes("could not find") ||
      msg.includes("schema cache"))
  );
}

function withUsageLimit(row: Record<string, unknown>, fallback: number): ApiKeyListItem {
  const base = row as unknown as Omit<ApiKeyListItem, "usage_limit" | "usage_count">;
  const limit = row.usage_limit;
  const count = row.usage_count;
  return {
    ...base,
    usage_limit: typeof limit === "number" ? limit : fallback,
    usage_count: typeof count === "number" ? count : 0,
  };
}

export function checkUsageQuota(usageCount: number, usageLimit: number): boolean {
  return usageCount < usageLimit;
}

/** Active rows sharing a display prefix (for scrypt verify). */
export async function findActiveKeysByPrefixForVerify(
  keyPrefix: string,
): Promise<ApiKeyVerifyCandidate[]> {
  const supabase = getServiceSupabase();

  const withUsage = await supabase
    .from("api_keys")
    .select("id, user_id, name, key_hash, usage_count, usage_limit")
    .eq("key_prefix", keyPrefix)
    .is("revoked_at", null);

  if (withUsage.error && isColumnMissing(withUsage.error, "usage_count")) {
    const withoutCount = await supabase
      .from("api_keys")
      .select("id, user_id, name, key_hash, usage_limit")
      .eq("key_prefix", keyPrefix)
      .is("revoked_at", null);
    if (withoutCount.error && isColumnMissing(withoutCount.error, "usage_limit")) {
      const base = await supabase
        .from("api_keys")
        .select("id, user_id, name, key_hash")
        .eq("key_prefix", keyPrefix)
        .is("revoked_at", null);
      if (base.error) {
        throw new Error(`findActiveKeysByPrefixForVerify: ${base.error.message}`);
      }
      return (base.data ?? []).map((row) => ({
        ...(row as Omit<ApiKeyVerifyCandidate, "usage_count" | "usage_limit">),
        usage_count: 0,
        usage_limit: DEFAULT_USAGE_LIMIT,
      }));
    }
    if (withoutCount.error) {
      throw new Error(`findActiveKeysByPrefixForVerify: ${withoutCount.error.message}`);
    }
    return (withoutCount.data ?? []).map((row) => ({
      ...(row as Omit<ApiKeyVerifyCandidate, "usage_count">),
      usage_count: 0,
      usage_limit:
        typeof (row as { usage_limit?: number }).usage_limit === "number"
          ? (row as { usage_limit: number }).usage_limit
          : DEFAULT_USAGE_LIMIT,
    }));
  }

  if (withUsage.error) {
    throw new Error(`findActiveKeysByPrefixForVerify: ${withUsage.error.message}`);
  }

  return (withUsage.data ?? []).map((row) => {
    const r = row as {
      id: string;
      user_id: string;
      name: string;
      key_hash: string;
      usage_count?: number;
      usage_limit?: number;
    };
    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      key_hash: r.key_hash,
      usage_count: r.usage_count ?? 0,
      usage_limit: r.usage_limit ?? DEFAULT_USAGE_LIMIT,
    };
  });
}

export function toValidatedApiKey(candidate: ApiKeyVerifyCandidate): ValidatedApiKey {
  return {
    id: candidate.id,
    user_id: candidate.user_id,
    name: candidate.name,
    usage_count: candidate.usage_count,
    usage_limit: candidate.usage_limit,
  };
}

/** Increment usage if under quota; always updates `last_used_at` on success. */
export async function recordApiKeyUsage(keyId: string): Promise<RecordUsageResult> {
  const supabase = getServiceSupabase();

  const current = await supabase
    .from("api_keys")
    .select("usage_count, usage_limit")
    .eq("id", keyId)
    .is("revoked_at", null)
    .maybeSingle();

  if (current.error && isColumnMissing(current.error, "usage_count")) {
    const fallback = await supabase
      .from("api_keys")
      .select("usage_limit")
      .eq("id", keyId)
      .is("revoked_at", null)
      .maybeSingle();
    if (fallback.error || !fallback.data) {
      return { ok: false, reason: "quota_exceeded" };
    }
    const limit =
      typeof (fallback.data as { usage_limit?: number }).usage_limit === "number"
        ? (fallback.data as { usage_limit: number }).usage_limit
        : DEFAULT_USAGE_LIMIT;
    await supabase
      .from("api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyId);
    return { ok: true, usage_count: 1, usage_limit: limit };
  }

  if (current.error || !current.data) {
    return { ok: false, reason: "quota_exceeded" };
  }

  const row = current.data as { usage_count: number; usage_limit: number };
  const usage_limit = row.usage_limit ?? DEFAULT_USAGE_LIMIT;
  const usage_count = row.usage_count ?? 0;

  if (!checkUsageQuota(usage_count, usage_limit)) {
    return { ok: false, reason: "quota_exceeded" };
  }

  const nextCount = usage_count + 1;
  const { error } = await supabase
    .from("api_keys")
    .update({
      usage_count: nextCount,
      last_used_at: new Date().toISOString(),
    })
    .eq("id", keyId)
    .is("revoked_at", null);

  if (error) {
    throw new Error(`recordApiKeyUsage: ${error.message}`);
  }

  return { ok: true, usage_count: nextCount, usage_limit };
}

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

  if (error && isColumnMissing(error, "usage_limit")) {
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

export async function listApiKeysForUser(
  userId: string,
): Promise<ApiKeyListItem[]> {
  const supabase = getServiceSupabase();

  const withUsage = await supabase
    .from("api_keys")
    .select(`${API_KEY_LIST_COLUMNS}, usage_limit, usage_count`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (withUsage.error && isColumnMissing(withUsage.error, "usage_count")) {
    const withLimitOnly = await supabase
      .from("api_keys")
      .select(`${API_KEY_LIST_COLUMNS}, usage_limit`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (withLimitOnly.error && isColumnMissing(withLimitOnly.error, "usage_limit")) {
      const without = await supabase
        .from("api_keys")
        .select(API_KEY_LIST_COLUMNS)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (without.error) {
        throw new Error(`listApiKeysForUser: ${without.error.message}`);
      }
      return (without.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
    }
    if (withLimitOnly.error) {
      throw new Error(`listApiKeysForUser: ${withLimitOnly.error.message}`);
    }
    return (withLimitOnly.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
  }

  if (withUsage.error && isColumnMissing(withUsage.error, "usage_limit")) {
    const withoutLimit = await supabase
      .from("api_keys")
      .select(`${API_KEY_LIST_COLUMNS}, usage_count`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (withoutLimit.error) {
      throw new Error(`listApiKeysForUser: ${withoutLimit.error.message}`);
    }
    return (withoutLimit.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
  }

  if (withUsage.error) {
    throw new Error(`listApiKeysForUser: ${withUsage.error.message}`);
  }

  return (withUsage.data ?? []).map((row) => withUsageLimit(row, DEFAULT_USAGE_LIMIT));
}

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

export async function updateApiKeyNameForUser(
  userId: string,
  keyId: string,
  name: string,
): Promise<ApiKeyListItem | null> {
  const supabase = getServiceSupabase();
  const trimmed = name.trim();

  const withUsage = await supabase
    .from("api_keys")
    .update({ name: trimmed })
    .eq("id", keyId)
    .eq("user_id", userId)
    .select(`${API_KEY_LIST_COLUMNS}, usage_limit, usage_count`)
    .maybeSingle();

  if (withUsage.error && isColumnMissing(withUsage.error, "usage_count")) {
    const withLimit = await supabase
      .from("api_keys")
      .update({ name: trimmed })
      .eq("id", keyId)
      .eq("user_id", userId)
      .select(`${API_KEY_LIST_COLUMNS}, usage_limit`)
      .maybeSingle();
    if (withLimit.error && isColumnMissing(withLimit.error, "usage_limit")) {
      const without = await supabase
        .from("api_keys")
        .update({ name: trimmed })
        .eq("id", keyId)
        .eq("user_id", userId)
        .select(API_KEY_LIST_COLUMNS)
        .maybeSingle();
      if (without.error) {
        throw new Error(`updateApiKeyNameForUser: ${without.error.message}`);
      }
      return without.data ? withUsageLimit(without.data, DEFAULT_USAGE_LIMIT) : null;
    }
    if (withLimit.error) {
      throw new Error(`updateApiKeyNameForUser: ${withLimit.error.message}`);
    }
    return withLimit.data ? withUsageLimit(withLimit.data, DEFAULT_USAGE_LIMIT) : null;
  }

  if (withUsage.error) {
    throw new Error(`updateApiKeyNameForUser: ${withUsage.error.message}`);
  }

  return withUsage.data ? withUsageLimit(withUsage.data, DEFAULT_USAGE_LIMIT) : null;
}

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
