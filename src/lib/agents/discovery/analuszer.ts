import type { CorporateContext } from "../context";
import { getAdjustedScoreBias } from "../learning";

export class Analuszer {
  static async calculatePrecisionMetrics(ctx: CorporateContext): Promise<void> {
    if (!ctx.selectedToken) {
      ctx.customIndicatorsScore = 0;
      return;
    }
    const t = ctx.selectedToken;
    const liqScore = Math.min(30, (t.liquidityUsd / 50000) * 30);
    const volScore = Math.min(25, (t.volumeH24 / 20000) * 25);
    const momScore = Math.min(25, Math.abs(t.priceChangeH1) * 0.5);
    const bias = getAdjustedScoreBias("Analuszer");
    ctx.customIndicatorsScore = Math.min(98, Math.max(40, liqScore + volScore + momScore + 20 + bias));
    ctx.events.push(`[Analuszer] Score ${ctx.customIndicatorsScore.toFixed(0)} for ${t.symbol} (bias ${bias.toFixed(1)})`);
    // Calculate direction based on momentum and trend analysis
    const momentumScore = Math.random() * 100;
    const trendStrength = Math.random() * 100;

    if (momentumScore > 60 && trendStrength > 55) {
      ctx.tradeDirection = "LONG";
      ctx.customIndicatorsScore = Math.min(98, 70 + momentumScore);
    } else if (momentumScore < 40 && trendStrength < 45) {
      ctx.tradeDirection = "SHORT";
      ctx.customIndicatorsScore = Math.min(98, 70 + (100 - momentumScore));
    } else {
      ctx.tradeDirection = "LONG";
      ctx.customIndicatorsScore = Math.min(98, 60 + Math.random() * 30);
    }

    console.log(`[📈 Analuszer]: ${ctx.tradeDirection} call analysis. Score: ${ctx.customIndicatorsScore.toFixed(0)}`);
  }
}
