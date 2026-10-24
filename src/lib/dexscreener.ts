export type DexPair = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { address: string; name: string; symbol: string };
  priceNative?: string;
  priceUsd?: string;
  txns?: { m5?: { buys: number; sells: number }; h1?: { buys: number; sells: number }; h24?: { buys: number; sells: number } };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number; base?: number; quote?: number };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
};

const BASE = "https://api.dexscreener.com";

export async function searchPairs(q: string): Promise<DexPair[]> {
  const res = await fetch(`${BASE}/latest/dex/search?q=${encodeURIComponent(q)}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.pairs || []).filter((p: DexPair) => p.chainId === "solana");
}

export async function getTokenPairs(tokenAddress: string): Promise<DexPair[]> {
  const res = await fetch(`${BASE}/token-pairs/v1/solana/${tokenAddress}`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : data.pairs || [];
}

export async function getBoostedTokens(): Promise<any[]> {
  const res = await fetch(`${BASE}/token-boosts/top/v1`, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getLatestProfiles(): Promise<any[]> {
  const res = await fetch(`${BASE}/token-profiles/latest/v1`, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  return res.json();
}

export async function getTrendingSolana(): Promise<DexPair[]> {
  const queries = ["SOL", "BONK", "WIF", "POPCAT", "FARTCOIN"];
  const all: DexPair[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    const pairs = await searchPairs(q);
    for (const p of pairs.slice(0, 8)) {
      if (p.chainId !== "solana") continue;
      if (seen.has(p.pairAddress)) continue;
      seen.add(p.pairAddress);
      all.push(p);
    }
  }
  return all
    .filter((p) => (p.liquidity?.usd || 0) > 5000)
    .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .slice(0, 40);
}

export function formatUsd(n?: number | string | null): string {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  if (!isFinite(v)) return "—";
  if (Math.abs(v) >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  if (Math.abs(v) >= 1) return `$${v.toFixed(2)}`;
  if (Math.abs(v) >= 0.0001) return `$${v.toFixed(6)}`;
  return `$${v.toExponential(2)}`;
}

export function formatPct(n?: number | null): string {
  if (n == null || !isFinite(n)) return "—";
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}
