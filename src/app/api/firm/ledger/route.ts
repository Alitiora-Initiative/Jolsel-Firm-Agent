import { NextRequest, NextResponse } from "next/server";
import { getRecentRuns, getLedgerStats } from "@/lib/agents/audit/ledger";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const limit = Number(req.nextUrl.searchParams.get("limit") || 20);
  return NextResponse.json(
    {
      stats: getLedgerStats(),
      runs: getRecentRuns(Number.isFinite(limit) ? limit : 20),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
