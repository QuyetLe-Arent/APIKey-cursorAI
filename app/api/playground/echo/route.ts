import { authenticatePlaygroundRequest } from "@/lib/playground-route";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

const ECHO_LIMIT = 60;
const ECHO_WINDOW_MS = 60_000;
const MAX_MESSAGE_LENGTH = 500;

function tooManyRequests(retryAfterMs: number) {
  const sec = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return NextResponse.json(
    { error: "Too many requests" },
    { status: 429, headers: { "Retry-After": String(sec) } },
  );
}

/** POST — demo API: echo a message when `x-api-key` is valid. */
export async function POST(request: Request) {
  try {
    const auth = await authenticatePlaygroundRequest(request, { incrementUsage: true });
    if (!auth.ok) return auth.response;

    const rl = checkRateLimit(
      `playground:echo:${auth.key.id}`,
      ECHO_LIMIT,
      ECHO_WINDOW_MS,
    );
    if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

    let message = "hello";
    try {
      const body = (await request.json()) as { message?: unknown };
      if (body.message !== undefined && body.message !== null) {
        if (typeof body.message !== "string") {
          return NextResponse.json({ error: "message must be a string" }, { status: 400 });
        }
        message = body.message.trim().slice(0, MAX_MESSAGE_LENGTH);
        if (!message) {
          return NextResponse.json({ error: "message cannot be empty" }, { status: 400 });
        }
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const usage_count = auth.usage?.usage_count ?? auth.key.usage_count;
    const usage_limit = auth.usage?.usage_limit ?? auth.key.usage_limit;

    return NextResponse.json({
      ok: true,
      echo: message,
      timestamp: new Date().toISOString(),
      keyId: auth.key.id,
      usage_count,
      usage_limit,
      remaining: Math.max(0, usage_limit - usage_count),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
