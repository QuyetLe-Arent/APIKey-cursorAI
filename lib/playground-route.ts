import "server-only";

import type { ValidatedApiKey } from "@/lib/api-key-types";
import { recordApiKeyUsage } from "@/lib/api-keys-repository";
import { checkRateLimit, clientIpFromRequest } from "@/lib/rate-limit";
import {
  extractApiKeyFromRequest,
  isQuotaAvailable,
  validateApiKeyFromRequest,
} from "@/lib/validate-api-key";
import { NextResponse } from "next/server";

const IP_LIMIT = 120;
const IP_WINDOW_MS = 60_000;

export type PlaygroundAuthResult =
  | { ok: true; key: ValidatedApiKey; usage?: { usage_count: number; usage_limit: number } }
  | { ok: false; response: NextResponse };

export async function authenticatePlaygroundRequest(
  request: Request,
  options: { incrementUsage: boolean },
): Promise<PlaygroundAuthResult> {
  const ip = clientIpFromRequest(request);
  const ipRl = checkRateLimit(`playground:ip:${ip}`, IP_LIMIT, IP_WINDOW_MS);
  if (!ipRl.ok) {
    const sec = Math.max(1, Math.ceil(ipRl.retryAfterMs / 1000));
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(sec) } },
      ),
    };
  }

  const raw = extractApiKeyFromRequest(request);
  if (!raw) {
    return {
      ok: false,
      response: NextResponse.json({ error: "API key is required (x-api-key header)" }, { status: 400 }),
    };
  }

  const key = await validateApiKeyFromRequest(request);
  if (!key) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 }),
    };
  }

  if (!isQuotaAvailable(key)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Usage limit exceeded for this API key" },
        { status: 429 },
      ),
    };
  }

  if (!options.incrementUsage) {
    return { ok: true, key };
  }

  const recorded = await recordApiKeyUsage(key.id);
  if (!recorded.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Usage limit exceeded for this API key" },
        { status: 429 },
      ),
    };
  }

  return {
    ok: true,
    key: {
      ...key,
      usage_count: recorded.usage_count,
      usage_limit: recorded.usage_limit,
    },
    usage: {
      usage_count: recorded.usage_count,
      usage_limit: recorded.usage_limit,
    },
  };
}
