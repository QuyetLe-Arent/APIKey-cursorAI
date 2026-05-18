import { requireSessionUserId } from "@/lib/api-route-auth";
import { generateApiKey } from "@/lib/api-key";
import {
  DEFAULT_USAGE_LIMIT,
  insertApiKey,
  listApiKeysForUser,
  toCreatedResponse,
} from "@/lib/api-keys-repository";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const MAX_NAME_LENGTH = 200;
const MAX_USAGE_LIMIT = 1_000_000;

function parseUsageLimit(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n =
    typeof value === "string"
      ? Number.parseInt(value, 10)
      : typeof value === "number"
        ? value
        : NaN;
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  return n;
}

/** List: per authenticated user, per rolling minute. */
const GET_LIMIT = 120;
const GET_WINDOW_MS = 60_000;

/** Create: stricter limit per user. */
const POST_LIMIT = 20;
const POST_WINDOW_MS = 60_000;

function tooManyRequests(retryAfterMs: number) {
  const sec = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(sec) },
    },
  );
}

export async function GET() {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

  const rl = checkRateLimit(`keys:get:${session.userId}`, GET_LIMIT, GET_WINDOW_MS);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  try {
    const keys = await listApiKeysForUser(session.userId);
    return NextResponse.json(keys);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to list API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

  const rl = checkRateLimit(`keys:post:${session.userId}`, POST_LIMIT, POST_WINDOW_MS);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  let name = "";
  let usageLimit = DEFAULT_USAGE_LIMIT;
  try {
    const body = (await request.json()) as { name?: unknown; limit?: unknown };
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== "string") {
        return NextResponse.json({ error: "name must be a string" }, { status: 400 });
      }
      name = body.name.trim().slice(0, MAX_NAME_LENGTH);
    }
    const parsedLimit = parseUsageLimit(body.limit);
    if (body.limit !== undefined && body.limit !== null) {
      if (parsedLimit === null) {
        return NextResponse.json({ error: "limit must be an integer" }, { status: 400 });
      }
      if (parsedLimit < 1 || parsedLimit > MAX_USAGE_LIMIT) {
        return NextResponse.json(
          { error: `limit must be between 1 and ${MAX_USAGE_LIMIT}` },
          { status: 400 },
        );
      }
      usageLimit = parsedLimit;
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const generated = generateApiKey();
    const row = await insertApiKey({
      userId: session.userId,
      name,
      keyPrefix: generated.keyPrefix,
      keyHash: generated.keyHash,
      usageLimit,
    });
    const payload = toCreatedResponse(row, generated.fullKey);
    return NextResponse.json(payload, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}
