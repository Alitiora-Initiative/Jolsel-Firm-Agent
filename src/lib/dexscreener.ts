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
const SEARCH_TTL_MS = 20_000;
const TRENDING_TTL_MS = 30_000;

type CacheEntry<T> = { at: number; value: T };
const searchCache = new Map<string, CacheEntry<DexPair[]>>();
const tokenPairsCache = new Map<string, CacheEntry<DexPair[]>>();
let trendingCache: CacheEntry<DexPair[]> | null = null;
let trendingInFlight: Promise<DexPair[]> | null = null;

async function fetchJson(url: string, timeoutMs = 7000): Promise<any> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`DEX feed ${res.status}`);
  return res.json();
}

export async function searchPairs(q: string): Promise<DexPair[]> {
  const key = q.trim().toLowerCase();
  if (!key) return [];
  const cached = searchCache.get(key);
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) return cached.value;
  try {
    const data = await fetchJson(`${BASE}/latest/dex/search?q=${encodeURIComponent(key)}`);
    const pairs = (data.pairs || []).filter((p: DexPair) => p.chainId === "solana");
    searchCache.set(key, { at: Date.now(), value: pairs });
    return pairs;
  } catch {
    return cached?.value ?? [];
  }
}

export async function getTokenPairs(tokenAddress: string): Promise<DexPair[]> {
  const cached = tokenPairsCache.get(tokenAddress);
  if (cached && Date.now() - cached.at < SEARCH_TTL_MS) return cached.value;
  try {
    const data = await fetchJson(
      `${BASE}/token-pairs/v1/solana/${encodeURIComponent(tokenAddress)}`
    );
    const pairs: DexPair[] = Array.isArray(data) ? data : data.pairs || [];
    tokenPairsCache.set(tokenAddress, { at: Date.now(), value: pairs });
    return pairs;
  } catch {
    return cached?.value ?? [];
  }
}

export async function getBoostedTokens(): Promise<any[]> {
  try {
    return await fetchJson(`${BASE}/token-boosts/top/v1`, 8000);
  } catch {
    return [];
  }
}

export async function getLatestProfiles(): Promise<any[]> {
  try {
    return await fetchJson(`${BASE}/token-profiles/latest/v1`, 8000);
  } catch {
    return [];
  }
}

async function buildTrending(): Promise<DexPair[]> {
  const queries = ["SOL", "BONK", "WIF", "POPCAT", "FARTCOIN", "PENGU", "TRUMP", "MOODENG"];
  const results = await Promise.all(queries.map((q) => searchPairs(q)));
  const all: DexPair[] = [];
  const seen = new Set<string>();

  for (const pairs of results) {
    for (const p of pairs.slice(0, 12)) {
      if (p.chainId !== "solana" || seen.has(p.pairAddress)) continue;
      if (!p.baseToken?.address || !p.priceUsd) continue;
      if ((p.liquidity?.usd || 0) < 25_000) continue;
      seen.add(p.pairAddress);
      all.push(p);
    }
  }

  return all
    .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
    .slice(0, 50);
}

export async function getTrendingSolana(): Promise<DexPair[]> {
  if (trendingCache && Date.now() - trendingCache.at < TRENDING_TTL_MS) {
    return trendingCache.value;
  }
  if (trendingInFlight) return trendingInFlight;

  trendingInFlight = buildTrending()
    .then((pairs) => {
      if (pairs.length) trendingCache = { at: Date.now(), value: pairs };
      return pairs.length ? pairs : trendingCache?.value ?? [];
    })
    .catch(() => trendingCache?.value ?? [])
    .finally(() => {
      trendingInFlight = null;
    });

  return trendingInFlight;
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
