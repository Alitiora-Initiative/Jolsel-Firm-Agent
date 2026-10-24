import { NextRequest, NextResponse } from "next/server";
import { searchPairs } from "@/lib/dexscreener";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (!q || q.length < 1) return NextResponse.json({ pairs: [] });
  try {
    const pairs = await searchPairs(q);
    return NextResponse.json({ pairs: pairs.slice(0, 30) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, pairs: [] }, { status: 500 });
  }
}
