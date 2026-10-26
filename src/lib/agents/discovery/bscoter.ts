import type { CorporateContext, LivePair } from "../context";
import { recordDecision, getAdjustedScoreBias } from "../learning";

export class Bscoter {
  static async scout(ctx: CorporateContext, livePairs: LivePair[] = []): Promise<void> {
    const bias = getAdjustedScoreBias("Bscoter");
    ctx.learningBias = bias;
    ctx.scoutedTokens = livePairs
      .filter((p) => p.liquidityUsd >= 15000 && p.volumeH24 >= 8000)
      .map((p) => ({
        ...p,
        score: Math.min(100, Math.max(0, 50 + p.priceChangeH1 * 0.8 + (p.volumeH24 / 10000) + bias)),
      }))
      .sort((a, b) => (b as any).score - (a as any).score)
      .slice(0, 8);

    if (ctx.scoutedTokens.length) {
      ctx.selectedToken = ctx.scoutedTokens[0];
      recordDecision("Bscoter", ctx.selectedToken.symbol, (ctx.selectedToken as any).score || 70);
    }
    ctx.events.push(`[Bscoter] Scouted ${ctx.scoutedTokens.length} live candidates (bias ${bias.toFixed(1)})`);
  }
}
