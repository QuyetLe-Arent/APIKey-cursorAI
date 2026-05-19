import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Fixed prefix: full keys look like `akm_<secret_base64url>`. */
export const API_KEY_PREFIX = "akm_" as const;

const SECRET_BYTE_LENGTH = 32;
const SCRYPT_SALT_LENGTH = 16;
const SCRYPT_HASH_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

/** How many secret characters to show in the UI prefix (does not count `akm_`). */
const PREFIX_VISIBLE_SECRET_CHARS = 8;

export type GeneratedApiKey = {
  /** Shown to the user exactly once at creation time. */
  fullKey: string;
  /** Stored in `key_prefix` — not sufficient to call the API. */
  keyPrefix: string;
  /** Stored in `key_hash`. */
  keyHash: string;
};

function assertAkmFormat(fullKey: string): void {
  if (!fullKey.startsWith(API_KEY_PREFIX)) {
    throw new Error("Invalid API key format: missing akm_ prefix");
  }
  const secret = fullKey.slice(API_KEY_PREFIX.length);
  if (secret.length < 16) {
    throw new Error("Invalid API key: secret too short");
  }
}

/**
 * Generate a new key: `akm_` + base64url(32 random bytes).
 * Do not log `fullKey` in production.
 */
export function generateApiKey(): GeneratedApiKey {
  const secret = randomBytes(SECRET_BYTE_LENGTH).toString("base64url");
  const fullKey = `${API_KEY_PREFIX}${secret}`;
  const peek = secret.slice(0, PREFIX_VISIBLE_SECRET_CHARS);
  const keyPrefix = `${API_KEY_PREFIX}${peek}...`;
  const keyHash = hashFullKey(fullKey);
  return { fullKey, keyPrefix, keyHash };
}

/**
 * Hash the entire full key (including `akm_`) with scrypt; returns base64url(salt || hash).
 */
export function hashFullKey(fullKey: string): string {
  assertAkmFormat(fullKey);
  const salt = randomBytes(SCRYPT_SALT_LENGTH);
  const hash = scryptSync(fullKey, salt, SCRYPT_HASH_LENGTH, SCRYPT_PARAMS);
  const combined = Buffer.concat([salt, hash]);
  return combined.toString("base64url");
}

/** Constant-time verify of a Bearer full key against stored `key_hash`. */
export function verifyFullKey(fullKey: string, storedHash: string): boolean {
  try {
    assertAkmFormat(fullKey);
    const combined = Buffer.from(storedHash, "base64url");
    if (combined.length !== SCRYPT_SALT_LENGTH + SCRYPT_HASH_LENGTH) {
      return false;
    }
    const salt = combined.subarray(0, SCRYPT_SALT_LENGTH);
    const expected = combined.subarray(SCRYPT_SALT_LENGTH);
    const actual = scryptSync(fullKey, salt, SCRYPT_HASH_LENGTH, SCRYPT_PARAMS);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Cheap format check (does not verify the hash). */
export function isProbableAkmKey(value: string): boolean {
  if (!value.startsWith(API_KEY_PREFIX)) return false;
  const secret = value.slice(API_KEY_PREFIX.length);
  return /^[A-Za-z0-9_-]+$/.test(secret) && secret.length >= 16;
}

/** Stored `key_prefix` value for lookup (must match `generateApiKey`). */
export function displayKeyPrefixFromFullKey(fullKey: string): string {
  if (!isProbableAkmKey(fullKey)) return "";
  const secret = fullKey.slice(API_KEY_PREFIX.length);
  const peek = secret.slice(0, PREFIX_VISIBLE_SECRET_CHARS);
  return `${API_KEY_PREFIX}${peek}...`;
}
