import type { ApiKeyCreatedResponse, ApiKeyListItem } from "@/lib/api-key-types";

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export type ApiKeysClientError = {
  ok: false;
  status: number;
  message: string;
};

export type ApiKeysClientSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiKeysClientResult<T> = ApiKeysClientSuccess<T> | ApiKeysClientError;

function errorMessage(status: number, body: { error?: string }, fallback: string): string {
  if (status === 429) return "Too many requests — try again shortly";
  if (status === 401) return "Session expired — please sign in again";
  return body.error ?? fallback;
}

async function readResponseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

async function request<T>(
  input: RequestInfo,
  init: RequestInit,
  fallbackError: string,
): Promise<ApiKeysClientResult<T>> {
  const res = await fetch(input, { ...init, credentials: "include" });

  if (res.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const parsed = await readResponseBody(res);

  if (!res.ok) {
    const body = (parsed ?? {}) as { error?: string };
    return {
      ok: false,
      status: res.status,
      message: errorMessage(res.status, body, fallbackError),
    };
  }

  if (parsed === undefined) {
    return { ok: true, data: undefined as T };
  }

  return { ok: true, data: parsed as T };
}

/** GET /api/keys — session cookie auth (no Bearer token). */
export async function listApiKeys(): Promise<ApiKeysClientResult<ApiKeyListItem[]>> {
  const result = await request<ApiKeyListItem[]>(
    "/api/keys",
    { method: "GET" },
    "Failed to load keys",
  );
  if (result.ok && !Array.isArray(result.data)) {
    return { ok: true, data: [] };
  }
  return result;
}

/** POST /api/keys — body `{ name?: string, limit?: number }`. */
export async function createApiKey(
  name: string,
  limit: number,
): Promise<ApiKeysClientResult<ApiKeyCreatedResponse>> {
  return request<ApiKeyCreatedResponse>(
    "/api/keys",
    {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ name, limit }),
    },
    "Failed to create API key",
  );
}

/** PATCH /api/keys/[id] — `{ action: "rename", name }`. */
export async function renameApiKey(
  id: string,
  name: string,
): Promise<ApiKeysClientResult<ApiKeyListItem>> {
  return request<ApiKeyListItem>(
    `/api/keys/${id}`,
    {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: "rename", name }),
    },
    "Failed to update API key",
  );
}

/** PATCH /api/keys/[id] — `{ action: "revoke" }`. */
export async function revokeApiKey(
  id: string,
): Promise<ApiKeysClientResult<{ revoked: boolean; id: string }>> {
  return request<{ revoked: boolean; id: string }>(
    `/api/keys/${id}`,
    {
      method: "PATCH",
      headers: JSON_HEADERS,
      body: JSON.stringify({ action: "revoke" }),
    },
    "Failed to revoke API key",
  );
}

/** DELETE /api/keys/[id]. */
export async function deleteApiKey(id: string): Promise<ApiKeysClientResult<void>> {
  return request<void>(`/api/keys/${id}`, { method: "DELETE" }, "Failed to delete API key");
}

export function isValidCreatedKey(
  data: ApiKeyCreatedResponse | undefined,
): data is ApiKeyCreatedResponse & { key: string } {
  return Boolean(data?.key && data.id && data.key_prefix);
}
