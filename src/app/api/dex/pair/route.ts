import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Live pair snapshot for real-time price ticks */
export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get("pair");
  const chain = req.nextUrl.searchParams.get("chain") || "solana";
  if (!pair || pair.length > 64) {
    return NextResponse.json({ error: "valid pair required" }, { status: 400 });
  }
  if (!/^[a-z0-9-]{1,24}$/.test(chain)) {
    return NextResponse.json({ error: "invalid chain" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chain}/${encodeURIComponent(pair)}`,
      { cache: "no-store", signal: AbortSignal.timeout(7000) }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `dex ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    const p = data.pair || data.pairs?.[0] || null;
    return NextResponse.json({ pair: p, ts: Date.now() });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
