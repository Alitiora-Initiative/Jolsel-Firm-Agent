import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getPairsForTokens, type DexPair } from "@/lib/dexscreener";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function validMint(value: string): boolean {
  if (value.length < 32 || value.length > 44) return false;
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("mints") || "";
  const mints = raw
    .split(",")
    .map((m) => m.trim())
    .filter(validMint)
    .slice(0, 30);

  if (!mints.length) {
    return NextResponse.json(
      { error: "Provide 1-30 comma-separated Solana mint addresses in ?mints=" },
      { status: 400 }
    );
  }

  const pairs = await getPairsForTokens(mints);
  const best = new Map<string, DexPair>();

  for (const pair of pairs) {
    const mint = pair.baseToken?.address;
    if (!mint || !mints.includes(mint) || !pair.priceUsd) continue;
    const prev = best.get(mint);
    if (!prev || (pair.liquidity?.usd || 0) > (prev.liquidity?.usd || 0)) {
      best.set(mint, pair);
    }
  }

  const tokens: Record<
    string,
    {
      mint: string;
      symbol: string;
      name: string;
      priceUsd: number | null;
      pairAddress: string;
      liquidityUsd: number;
      changeH24: number | null;
    }
  > = {};

  for (const mint of mints) {
    const pair = best.get(mint);
    if (!pair) {
      tokens[mint] = {
        mint,
        symbol: mint.slice(0, 4),
        name: "Unknown token",
        priceUsd: null,
        pairAddress: "",
        liquidityUsd: 0,
        changeH24: null,
      };
      continue;
    }
    tokens[mint] = {
      mint,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      priceUsd: pair.priceUsd ? Number(pair.priceUsd) : null,
      pairAddress: pair.pairAddress,
      liquidityUsd: pair.liquidity?.usd ?? 0,
      changeH24: pair.priceChange?.h24 ?? null,
    };
  }

  return NextResponse.json(
    { tokens, source: "dexscreener", asOf: Date.now() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
