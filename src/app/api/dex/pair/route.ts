import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Live pair snapshot for real-time price ticks */
export async function GET(req: NextRequest) {
  const pair = req.nextUrl.searchParams.get("pair");
  const chain = req.nextUrl.searchParams.get("chain") || "solana";
  if (!pair) {
    return NextResponse.json({ error: "pair required" }, { status: 400 });
  }
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pair}`,
      { cache: "no-store" }
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
