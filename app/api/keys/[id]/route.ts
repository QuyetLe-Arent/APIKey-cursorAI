import { isUuid, requireSessionUserId } from "@/lib/api-route-auth";
import {
  deleteApiKeyForUser,
  revokeApiKeyForUser,
  updateApiKeyNameForUser,
} from "@/lib/api-keys-repository";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

const MUTATE_LIMIT = 45;
const MUTATE_WINDOW_MS = 60_000;

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

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

  const rl = checkRateLimit(
    `keys:mutate:${session.userId}`,
    MUTATE_LIMIT,
    MUTATE_WINDOW_MS,
  );
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid key id" }, { status: 400 });
  }

  let body: { action?: unknown; name?: unknown };
  try {
    body = (await request.json()) as { action?: unknown; name?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action === "revoke") {
    try {
      const ok = await revokeApiKeyForUser(session.userId, id);
      if (!ok) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ revoked: true, id });
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Failed to revoke API key" },
        { status: 500 },
      );
    }
  }

  if (body.action === "rename") {
    if (typeof body.name !== "string") {
      return NextResponse.json(
        { error: 'Body must include string "name"' },
        { status: 400 },
      );
    }
    const name = body.name.trim();
    if (name.length > 200) {
      return NextResponse.json(
        { error: "Name must be at most 200 characters" },
        { status: 400 },
      );
    }
    try {
      const updated = await updateApiKeyNameForUser(session.userId, id, name);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    } catch (e) {
      console.error(e);
      return NextResponse.json(
        { error: "Failed to update API key" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: 'Body must be { "action": "revoke" } or { "action": "rename", "name": "..." }' },
    { status: 400 },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

  const rl = checkRateLimit(
    `keys:mutate:${session.userId}`,
    MUTATE_LIMIT,
    MUTATE_WINDOW_MS,
  );
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs);

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid key id" }, { status: 400 });
  }

  try {
    const ok = await deleteApiKeyForUser(session.userId, id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 },
    );
  }
}
