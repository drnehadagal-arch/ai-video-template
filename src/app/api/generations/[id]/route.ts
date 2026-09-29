import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { loadAndRefreshGeneration } from "@/lib/generations";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: Request, ctx: RouteContext<"/api/generations/[id]">) {
  const { id } = await ctx.params;
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!UUID.test(id)) return NextResponse.json({ error: "Not found." }, { status: 404 });

  try {
    const generation = await loadAndRefreshGeneration(id);
    if (!generation) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json(generation);
  } catch (err) {
    console.error("status check failed", err);
    return NextResponse.json({ error: "Please try again." }, { status: 500 });
  }
}
