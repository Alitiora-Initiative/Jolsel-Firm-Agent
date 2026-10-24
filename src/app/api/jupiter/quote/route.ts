import { NextRequest, NextResponse } from "next/server";
import { getQuote } from "@/lib/jupiter";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const inputMint = sp.get("inputMint");
  const outputMint = sp.get("outputMint");
  const amount = Number(sp.get("amount") || 0);
  const slippageBps = Number(sp.get("slippageBps") || 100);
  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }
  try {
    const quote = await getQuote({ inputMint, outputMint, amount, slippageBps });
    return NextResponse.json(quote);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
