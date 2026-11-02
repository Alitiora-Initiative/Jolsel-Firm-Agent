import type { CorporateContext } from "../context";
import { logAgent } from "../log";
import { clamp, estimateRoundTripCostPct } from "../scoring";

export class Forecaster {
  static async simulateScenarios(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) {
      ctx.isWorthIt = false;
      return;
    }

    // Momentum extrapolation over the next hour, capped so a single candle cannot justify a trade.
    const expectedMove = clamp(Math.abs(token.indicators.momentum) * 0.6, 0, 20);
    const cost = estimateRoundTripCostPct(ctx.slippageBps, ctx.priceImpactPct);
    ctx.expectedMovePct = Math.round(expectedMove * 100) / 100;
    ctx.roundTripCostPct = cost;
    ctx.isWorthIt = expectedMove >= Math.max(1.5, cost * 1.5);

    const trailingStop = clamp(Math.round(token.indicators.volatility * 0.8), 12, 35);
    const takeProfit = clamp(Math.round(expectedMove * 1.5 * 10) / 10, 2, 60);
    ctx.reversalProtectionPlan = {
      trailingStopLossPercent: trailingStop,
      takeProfitPercent: takeProfit,
      partialExitTrigger: "Momentum reverses below 0% on the 1h candle",
    };

    ctx.boardroomVotes["Forecaster"] = {
      vote: ctx.isWorthIt ? "YES" : "NO",
      reason: `Expected 1h move ${ctx.expectedMovePct.toFixed(2)}% vs estimated round-trip cost ${cost.toFixed(2)}%.`,
      weight: 1,
    };

    logAgent(
      ctx,
      "Forecaster",
      `Expected move ${ctx.expectedMovePct.toFixed(2)}% (momentum extrapolation, not a guarantee) vs estimated round-trip cost ${cost.toFixed(2)}%${ctx.quote ? " from a live Jupiter quote" : " using a 0.50% impact assumption"}. Worth it: ${ctx.isWorthIt ? "YES" : "NO"}.`,
      ctx.isWorthIt ? "success" : "warn"
    );
  }
}
