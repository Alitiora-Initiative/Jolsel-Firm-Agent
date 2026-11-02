import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getQuote } from "@/lib/jupiter";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validMint(value: string | null): value is string {
  if (!value || value.length < 32 || value.length > 44) return false;
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const inputMint = sp.get("inputMint");
  const outputMint = sp.get("outputMint");
  const amount = sp.get("amount") ?? "";
  const slippageBps = Number(sp.get("slippageBps") || 100);

  if (!validMint(inputMint) || !validMint(outputMint)) {
    return NextResponse.json({ error: "inputMint and outputMint must be valid Solana mints" }, { status: 400 });
  }
  if (!/^\d{1,20}$/.test(amount) || BigInt(amount) <= 0n) {
    return NextResponse.json({ error: "amount must be a positive integer string in base units" }, { status: 400 });
  }
  if (!Number.isFinite(slippageBps) || slippageBps < 10 || slippageBps > 300) {
    return NextResponse.json({ error: "slippageBps must be between 10 and 300" }, { status: 400 });
  }

  try {
    const quote = await getQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps: Math.round(slippageBps),
    });
    return NextResponse.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Jupiter quote failed" }, { status: 502 });
  }
}
