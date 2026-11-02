import { NextResponse } from "next/server";
import { getSolUsd } from "@/lib/price";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const price = await getSolUsd();
  if (!price) {
    return NextResponse.json(
      { error: "Live SOL/USD price unavailable from Jupiter and DexScreener." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
  return NextResponse.json(price, { headers: { "Cache-Control": "no-store" } });
}
