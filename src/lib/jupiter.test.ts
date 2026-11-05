import { describe, expect, it } from "vitest";
import { summarizeQuote } from "./jupiter";

describe("summarizeQuote", () => {
  it("normalizes a live-shaped Jupiter quote", () => {
    const summary = summarizeQuote(
      {
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        inAmount: "100000000",
        outAmount: "15230000",
        otherAmountThreshold: "15153850",
        priceImpactPct: "0.000123456",
        routePlan: [
          { swapInfo: { label: "Raydium" } },
          { swapInfo: { label: "Orca" } },
          { swapInfo: {} },
        ],
      },
      100
    );

    expect(summary.inAmount).toBe("100000000");
    expect(summary.outAmount).toBe("15230000");
    expect(summary.priceImpactPct).toBe(0.0001);
    expect(summary.slippageBps).toBe(100);
    expect(summary.route).toEqual(["Raydium", "Orca"]);
  });

  it("never invents missing fields", () => {
    const summary = summarizeQuote({}, 250);
    expect(summary.inAmount).toBe("0");
    expect(summary.outAmount).toBe("0");
    expect(summary.priceImpactPct).toBe(0);
    expect(summary.route).toEqual([]);
    expect(summary.slippageBps).toBe(250);
  });

  it("coerces non-numeric impact to zero instead of NaN", () => {
    const summary = summarizeQuote({ priceImpactPct: "not-a-number" }, 50);
    expect(summary.priceImpactPct).toBe(0);
  });
});
