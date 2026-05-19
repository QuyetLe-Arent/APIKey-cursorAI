import "server-only";

import type { ValidatedApiKey } from "@/lib/api-key-types";
import {
  displayKeyPrefixFromFullKey,
  isProbableAkmKey,
  verifyFullKey,
} from "@/lib/api-key";
import {
  checkUsageQuota,
  findActiveKeysByPrefixForVerify,
  toValidatedApiKey,
} from "@/lib/api-keys-repository";

export function extractApiKeyFromRequest(request: Request): string | null {
  const header = request.headers.get("x-api-key")?.trim();
  if (header) return header;

  const auth = request.headers.get("authorization")?.trim();
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim();
  }

  return null;
}

/** Resolve and verify API key from `x-api-key` or `Authorization: Bearer`. */
export async function validateApiKeyFromRequest(
  request: Request,
): Promise<ValidatedApiKey | null> {
  const fullKey = extractApiKeyFromRequest(request);
  if (!fullKey || !isProbableAkmKey(fullKey)) {
    return null;
  }

  const keyPrefix = displayKeyPrefixFromFullKey(fullKey);
  if (!keyPrefix) return null;

  const candidates = await findActiveKeysByPrefixForVerify(keyPrefix);
  for (const candidate of candidates) {
    if (verifyFullKey(fullKey, candidate.key_hash)) {
      return toValidatedApiKey(candidate);
    }
  }

  return null;
}

export function isQuotaAvailable(key: ValidatedApiKey): boolean {
  return checkUsageQuota(key.usage_count, key.usage_limit);
}
