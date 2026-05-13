import { requireSessionUserId } from "@/lib/api-route-auth";
import { generateApiKey } from "@/lib/api-key";
import {
  insertApiKey,
  listApiKeysForUser,
  toCreatedResponse,
} from "@/lib/api-keys-repository";
import { NextResponse } from "next/server";

const MAX_NAME_LENGTH = 200;

export async function GET() {
  const session = await requireSessionUserId();
  if ("error" in session) return session.error;

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

  let name = "";
  try {
    const body = (await request.json()) as { name?: unknown };
    if (body.name !== undefined && body.name !== null) {
      if (typeof body.name !== "string") {
        return NextResponse.json({ error: "name must be a string" }, { status: 400 });
      }
      name = body.name.trim().slice(0, MAX_NAME_LENGTH);
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
