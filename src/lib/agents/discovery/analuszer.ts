import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class Analuszer {
  static async calculatePrecisionMetrics(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) {
      ctx.indicators = null;
      return;
    }

    ctx.indicators = token.indicators;
    ctx.tradeDirection = token.direction;

    logAgent(
      ctx,
      "Analuszer",
      `${token.symbol} ${token.direction} bias. Composite ${token.score}/99 (trend ${token.indicators.trend}, flow ${token.indicators.orderFlow}, depth ${token.indicators.liquidityDepth}, volume quality ${token.indicators.volumeQuality}, momentum ${token.indicators.momentum}%).`,
      token.score >= 80 ? "success" : "warn"
    );

    if (token.direction === "SHORT") {
      logAgent(
        ctx,
        "Analuszer",
        `${token.symbol} momentum is negative. This desk is spot-only, so SHORT means stand aside or exit an existing position, not open a short.`,
        "info"
      );
    }
  }
}
