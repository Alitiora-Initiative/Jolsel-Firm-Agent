import { describe, expect, it } from "vitest";
import type { DexPair } from "@/lib/dexscreener";
import {
  buildCandidate,
  computeIndicators,
  estimateRoundTripCostPct,
  rankCandidates,
} from "./scoring";

const NOW = 1_700_000_000_000;

function pair(overrides: Partial<DexPair> = {}): DexPair {
  return {
    chainId: "solana",
    dexId: "raydium",
    url: "https://dexscreener.com/solana/example",
    pairAddress: "Pair111111111111111111111111111111111111111",
    baseToken: {
      address: "Mint1111111111111111111111111111111111111111",
      name: "Example",
      symbol: "EXM",
    },
    quoteToken: {
      address: "So11111111111111111111111111111111111111112",
      name: "Wrapped SOL",
      symbol: "SOL",
    },
    priceUsd: "0.0012",
    priceChange: { m5: 2, h1: 10, h6: 25, h24: 40 },
    volume: { m5: 5_000, h1: 120_000, h6: 500_000, h24: 2_000_000 },
    txns: {
      h1: { buys: 400, sells: 200 },
      m5: { buys: 20, sells: 10 },
    },
    liquidity: { usd: 250_000 },
    pairCreatedAt: NOW - 6 * 60 * 60 * 1000,
    ...overrides,
  };
}

describe("computeIndicators", () => {
  it("is deterministic for the same pair and timestamp", () => {
    const a = computeIndicators(pair(), NOW);
    const b = computeIndicators(pair(), NOW);
    expect(a).toEqual(b);
  });

  it("rewards buy-side flow and deeper liquidity", () => {
    const balanced = computeIndicators(pair(), NOW);
    const buyHeavy = computeIndicators(
      pair({ txns: { h1: { buys: 900, sells: 100 } } }),
      NOW
    );
    expect(buyHeavy.orderFlow).toBeGreaterThan(balanced.orderFlow);

    const deeper = computeIndicators(
      pair({ liquidity: { usd: 2_500_000 } }),
      NOW
    );
    expect(deeper.liquidityDepth).toBeGreaterThan(balanced.liquidityDepth);
  });

  it("penalizes very young pairs and extreme volatility", () => {
    const mature = computeIndicators(pair(), NOW);
    const fresh = computeIndicators(pair({ pairCreatedAt: NOW - 5 * 60 * 1000 }), NOW);
    const wild = computeIndicators(
      pair({ priceChange: { m5: 20, h1: 120, h6: 300, h24: 500 } }),
      NOW
    );
    expect(fresh.composite).toBeLessThan(mature.composite);
    expect(wild.composite).toBeLessThan(mature.composite);
  });

  it("keeps composite in [0, 99]", () => {
    const extreme = computeIndicators(
      pair({
        priceChange: { m5: 1000, h1: 1000, h6: 1000, h24: 1000 },
        volume: { h1: 1e12 },
        liquidity: { usd: 1e12 },
      }),
      NOW
    );
    expect(extreme.composite).toBeGreaterThanOrEqual(0);
    expect(extreme.composite).toBeLessThanOrEqual(99);
  });
});

describe("buildCandidate", () => {
  it("rejects non-Solana, low-liquidity, low-volume, and unpriced pairs", () => {
    expect(buildCandidate(pair({ chainId: "ethereum" }), NOW)).toBeNull();
    expect(buildCandidate(pair({ liquidity: { usd: 5_000 } }), NOW)).toBeNull();
    expect(buildCandidate(pair({ volume: { h24: 10_000 } }), NOW)).toBeNull();
    expect(buildCandidate(pair({ priceUsd: "0" }), NOW)).toBeNull();
  });

  it("maps live fields without inventing values", () => {
    const candidate = buildCandidate(pair(), NOW);
    expect(candidate).not.toBeNull();
    expect(candidate!.mint).toBe("Mint1111111111111111111111111111111111111111");
    expect(candidate!.priceUsd).toBeCloseTo(0.0012);
    expect(candidate!.liquidityUsd).toBe(250_000);
    expect(candidate!.volumeH24Usd).toBe(2_000_000);
    expect(candidate!.direction).toBe("LONG");
    expect(candidate!.pairAgeMinutes).toBe(360);
  });

  it("marks negative momentum as a SHORT (stand-aside) signal", () => {
    const candidate = buildCandidate(
      pair({ priceChange: { m5: -5, h1: -20, h6: -30, h24: -40 } }),
      NOW
    );
    expect(candidate!.direction).toBe("SHORT");
  });
});

describe("rankCandidates", () => {
  it("de-duplicates by mint and keeps the deepest pair", () => {
    const shallow = pair({ pairAddress: "Shallow111", liquidity: { usd: 100_000 } });
    const deep = pair({ pairAddress: "Deep11111", liquidity: { usd: 900_000 } });
    const otherMint = pair({
      baseToken: {
        address: "OtherMint11111111111111111111111111111111111",
        name: "Other",
        symbol: "OTH",
      },
      pairAddress: "OtherPair11",
      priceChange: { m5: 1, h1: 4, h6: 8, h24: 12 },
    });

    const ranked = rankCandidates([shallow, deep, otherMint], NOW);
    expect(ranked).toHaveLength(2);
    const exm = ranked.find((c) => c.symbol === "EXM");
    expect(exm!.pairAddress).toBe("Deep11111");
    expect(exm!.liquidityUsd).toBe(900_000);
  });

  it("respects the result limit", () => {
    const pairs = Array.from({ length: 12 }, (_, i) =>
      pair({
        baseToken: {
          address: `Mint${String(i).padStart(40, "0")}`,
          name: `Token ${i}`,
          symbol: `T${i}`,
        },
        pairAddress: `Pair${String(i).padStart(40, "0")}`,
      })
    );
    expect(rankCandidates(pairs, NOW, 5)).toHaveLength(5);
  });
});

describe("estimateRoundTripCostPct", () => {
  it("counts both fills at the slippage cap plus impact and fees", () => {
    expect(estimateRoundTripCostPct(100, 0.5)).toBe(3.3);
    expect(estimateRoundTripCostPct(50, 0)).toBe(1.3);
  });

  it("uses a conservative default impact when no quote exists", () => {
    expect(estimateRoundTripCostPct(100, null)).toBe(3.3);
  });
});
