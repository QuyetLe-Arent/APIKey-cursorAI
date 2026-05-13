import { isUuid, requireSessionUserId } from "@/lib/api-route-auth";
import { deleteApiKeyForUser, revokeApiKeyForUser } from "@/lib/api-keys-repository";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

  const { id } = await context.params;
  if (!isUuid(id)) {
    return NextResponse.json({ error: "Invalid key id" }, { status: 400 });
  }

  let body: { action?: unknown };
  try {
    body = (await request.json()) as { action?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.action !== "revoke") {
    return NextResponse.json(
      { error: 'Body must be { "action": "revoke" }' },
      { status: 400 },
    );
  }

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

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

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
