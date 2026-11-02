import type { DexPair } from "@/lib/dexscreener";
import type { Indicators, TokenCandidate } from "./context";

const MIN_LIQUIDITY_USD = 20_000;
const MIN_VOLUME_H24_USD = 50_000;

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : 0;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function pairAgeMinutes(pair: DexPair, now = Date.now()): number | null {
  if (!pair.pairCreatedAt || pair.pairCreatedAt <= 0) return null;
  return Math.max(0, Math.floor((now - pair.pairCreatedAt) / 60_000));
}

/**
 * Deterministic, testable scoring from live DexScreener fields.
 * No randomness: the same pair always produces the same score at the same timestamp.
 */
export function computeIndicators(pair: DexPair, now = Date.now()): Indicators {
  const m5 = toNumber(pair.priceChange?.m5);
  const h1 = toNumber(pair.priceChange?.h1);
  const h6 = toNumber(pair.priceChange?.h6);
  const liquidity = toNumber(pair.liquidity?.usd);
  const volumeH1 = toNumber(pair.volume?.h1);
  const buys = toNumber(pair.txns?.h1?.buys) || toNumber(pair.txns?.m5?.buys);
  const sells = toNumber(pair.txns?.h1?.sells) || toNumber(pair.txns?.m5?.sells);

  const momentum = clamp(m5 * 0.5 + h1 + h6 * 0.25, -100, 100);
  const trend = clamp(50 + momentum * 1.2, 0, 100);
  const flowShare = buys + sells > 0 ? buys / (buys + sells) : 0.5;
  const orderFlow = clamp(flowShare * 100, 0, 100);
  const liquidityDepth = clamp(Math.log10(Math.max(liquidity, 1) / 10_000) * 33, 0, 100);
  const volumeQuality = clamp((volumeH1 / Math.max(liquidity, 1)) * 33, 0, 100);
  const volatility = Math.abs(h1);

  const age = pairAgeMinutes(pair, now);
  const agePenalty = age === null ? 5 : age < 30 ? 20 : age < 120 ? 10 : 0;
  const volatilityPenalty = volatility > 80 ? 15 : volatility > 40 ? 7 : 0;
  const composite = clamp(
    trend * 0.35 + orderFlow * 0.25 + liquidityDepth * 0.2 + volumeQuality * 0.2 - agePenalty - volatilityPenalty,
    0,
    99
  );

  return {
    momentum: Math.round(momentum * 100) / 100,
    trend: Math.round(trend),
    orderFlow: Math.round(orderFlow),
    liquidityDepth: Math.round(liquidityDepth),
    volumeQuality: Math.round(volumeQuality),
    volatility: Math.round(volatility * 100) / 100,
    composite: Math.round(composite),
  };
}

export function buildCandidate(pair: DexPair, now = Date.now()): TokenCandidate | null {
  if (pair.chainId !== "solana" || !pair.baseToken?.address || !pair.pairAddress) return null;
  const liquidityUsd = toNumber(pair.liquidity?.usd);
  const volumeH24Usd = toNumber(pair.volume?.h24);
  const priceUsd = toNumber(pair.priceUsd);
  if (liquidityUsd < MIN_LIQUIDITY_USD || volumeH24Usd < MIN_VOLUME_H24_USD || priceUsd <= 0) {
    return null;
  }

  const indicators = computeIndicators(pair, now);
  return {
    mint: pair.baseToken.address,
    symbol: pair.baseToken.symbol || "UNKNOWN",
    name: pair.baseToken.name || "Unknown token",
    pairAddress: pair.pairAddress,
    dexId: pair.dexId || "unknown",
    quoteSymbol: pair.quoteToken?.symbol || "?",
    priceUsd,
    liquidityUsd,
    volumeM5Usd: toNumber(pair.volume?.m5),
    volumeH1Usd: toNumber(pair.volume?.h1),
    volumeH24Usd,
    changeM5: pair.priceChange?.m5 ?? null,
    changeH1: pair.priceChange?.h1 ?? null,
    changeH6: pair.priceChange?.h6 ?? null,
    changeH24: pair.priceChange?.h24 ?? null,
    buysH1: toNumber(pair.txns?.h1?.buys) || toNumber(pair.txns?.m5?.buys),
    sellsH1: toNumber(pair.txns?.h1?.sells) || toNumber(pair.txns?.m5?.sells),
    pairAgeMinutes: pairAgeMinutes(pair, now),
    score: indicators.composite,
    direction: indicators.momentum >= 0 ? "LONG" : "SHORT",
    indicators,
  };
}

/** Rank live pairs, de-duplicated by mint (deepest pair per mint wins). */
export function rankCandidates(pairs: DexPair[], now = Date.now(), limit = 8): TokenCandidate[] {
  const byMint = new Map<string, TokenCandidate>();
  for (const pair of pairs) {
    const candidate = buildCandidate(pair, now);
    if (!candidate) continue;
    const existing = byMint.get(candidate.mint);
    if (!existing || candidate.liquidityUsd > existing.liquidityUsd) {
      byMint.set(candidate.mint, candidate);
    }
  }
  return [...byMint.values()]
    .sort((a, b) => b.score - a.score || b.liquidityUsd - a.liquidityUsd)
    .slice(0, limit);
}

/** Estimated round-trip cost in percent, from the user's slippage cap and live quote impact. */
export function estimateRoundTripCostPct(slippageBps: number, priceImpactPct: number | null): number {
  const slippage = slippageBps / 100;
  const impact = priceImpactPct ?? 0.5;
  // Two fills (entry + exit) at the slippage cap plus price impact, plus 0.30% for priority/aggregator fees.
  return Math.round((2 * slippage + 2 * impact + 0.3) * 100) / 100;
}
