const SOL_MINT = "So11111111111111111111111111111111111111112";
const CACHE_TTL_MS = 30_000;

let cached: { usd: number; source: string; ts: number } | null = null;

async function fromJupiter(): Promise<number | null> {
  const res = await fetch(`https://lite-api.jup.ag/price/v3?ids=${SOL_MINT}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const price = Number(data?.[SOL_MINT]?.usdPrice);
  return Number.isFinite(price) && price > 0 ? price : null;
}

async function fromDexScreener(): Promise<number | null> {
  const res = await fetch(
    "https://api.dexscreener.com/latest/dex/pairs/solana/58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
    { cache: "no-store", signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const pair = data?.pairs?.[0] ?? data?.pair;
  const price = Number(pair?.priceUsd);
  return Number.isFinite(price) && price > 0 ? price : null;
}

/** Live SOL/USD from Jupiter, falling back to DexScreener. Never a hardcoded price. */
export async function getSolUsd(): Promise<{ usd: number; source: string; ts: number } | null> {
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) return cached;

  try {
    const jup = await fromJupiter();
    if (jup) {
      cached = { usd: jup, source: "jupiter-price-v3", ts: Date.now() };
      return cached;
    }
  } catch {
    /* fall through */
  }

  try {
    const dex = await fromDexScreener();
    if (dex) {
      cached = { usd: dex, source: "dexscreener-sol-usdc", ts: Date.now() };
      return cached;
    }
  } catch {
    /* fall through */
  }

  return null;
}
