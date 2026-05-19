import { authenticatePlaygroundRequest } from "@/lib/playground-route";
import { NextResponse } from "next/server";

/** POST — verify `x-api-key` and return usage metadata (increments usage). */
export async function POST(request: Request) {
  try {
    const auth = await authenticatePlaygroundRequest(request, { incrementUsage: true });
    if (!auth.ok) return auth.response;

    const { key, usage } = auth;
    const usage_count = usage?.usage_count ?? key.usage_count;
    const usage_limit = usage?.usage_limit ?? key.usage_limit;

    return NextResponse.json({
      ok: true,
      keyId: key.id,
      name: key.name,
      usage_count,
      usage_limit,
      remaining: Math.max(0, usage_limit - usage_count),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to validate API key" }, { status: 500 });
  }
}
