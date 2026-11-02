import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getSwapTransaction } from "@/lib/jupiter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { quoteResponse, userPublicKey } = body ?? {};
  if (!quoteResponse || typeof quoteResponse !== "object") {
    return NextResponse.json({ error: "quoteResponse object is required" }, { status: 400 });
  }
  if (typeof userPublicKey !== "string" || userPublicKey.length < 32 || userPublicKey.length > 44) {
    return NextResponse.json({ error: "userPublicKey must be a Solana public key" }, { status: 400 });
  }
  try {
    new PublicKey(userPublicKey);
  } catch {
    return NextResponse.json({ error: "userPublicKey is not a valid public key" }, { status: 400 });
  }

  const encoded = JSON.stringify(quoteResponse);
  if (encoded.length > 60_000) {
    return NextResponse.json({ error: "quoteResponse is too large" }, { status: 413 });
  }

  try {
    const data = await getSwapTransaction({ quoteResponse, userPublicKey });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Jupiter swap failed" }, { status: 502 });
  }
}
