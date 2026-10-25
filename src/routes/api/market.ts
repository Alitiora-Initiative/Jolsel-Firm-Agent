import { createFileRoute } from "@tanstack/react-router";
import type { LivePair } from "@/lib/firm/types";

type DexPair = {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  url?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { symbol?: string };
  priceUsd?: string;
  priceChange?: { h1?: number; h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  txns?: { h1?: { buys?: number; sells?: number } };
  fdv?: number;
};

function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function mapPair(p: DexPair): LivePair | null {
  if (p.chainId !== "solana") return null;
  if (!p.pairAddress || !p.baseToken?.address || !p.baseToken.symbol) return null;
  return {
    chainId: "solana",
    dexId: p.dexId || "dex",
    pairAddress: p.pairAddress,
    baseToken: {
      address: p.baseToken.address,
      name: p.baseToken.name || p.baseToken.symbol,
      symbol: p.baseToken.symbol,
    },
    quoteToken: { symbol: p.quoteToken?.symbol || "SOL" },
    priceUsd: num(p.priceUsd),
    changeH1: num(p.priceChange?.h1),
    changeH24: num(p.priceChange?.h24),
    volumeH24: num(p.volume?.h24),
    liquidityUsd: num(p.liquidity?.usd),
    buysH1: num(p.txns?.h1?.buys),
    sellsH1: num(p.txns?.h1?.sells),
    fdv: num(p.fdv),
    url: p.url || `https://dexscreener.com/solana/${p.pairAddress}`,
  };
}

async function loadSolanaTape(): Promise<LivePair[]> {
  const boostsRes = await fetch("https://api.dexscreener.com/token-boosts/top/v1", {
    headers: { accept: "application/json" },
  });
  if (!boostsRes.ok) throw new Error(`DexScreener boosts ${boostsRes.status}`);
  const boosts = (await boostsRes.json()) as { chainId?: string; tokenAddress?: string }[];
  const mints = [
    ...new Set(
      (Array.isArray(boosts) ? boosts : [])
        .filter((b) => b.chainId === "solana" && b.tokenAddress)
        .map((b) => b.tokenAddress as string),
    ),
  ].slice(0, 30);

  if (!mints.length) return [];

  const pairsRes = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${mints.join(",")}`,
    { headers: { accept: "application/json" } },
  );
  if (!pairsRes.ok) throw new Error(`DexScreener pairs ${pairsRes.status}`);
  const body = (await pairsRes.json()) as { pairs?: DexPair[] };
  const mapped = (body.pairs ?? []).map(mapPair).filter((p): p is LivePair => !!p);

  const best = new Map<string, LivePair>();
  for (const p of mapped) {
    const prev = best.get(p.baseToken.address);
    if (!prev || p.liquidityUsd > prev.liquidityUsd) best.set(p.baseToken.address, p);
  }
  return [...best.values()]
    .filter((p) => p.liquidityUsd >= 8_000)
    .sort((a, b) => b.volumeH24 - a.volumeH24)
    .slice(0, 18);
}

export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const pairs = await loadSolanaTape();
          return Response.json({ pairs, ts: Date.now() });
        } catch (err) {
          const message = err instanceof Error ? err.message : "market feed failed";
          return Response.json({ pairs: [], error: message }, { status: 200 });
        }
      },
    },
  },
});
