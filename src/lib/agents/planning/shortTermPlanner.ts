import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class ShortTermPlanner {
  static async calculatePyramiding(ctx: CorporateContext): Promise<void> {
    const cap = 50;
    const size = Math.min(ctx.walletBalanceUsd * 0.15, cap);
    ctx.targetPositionSizeUsd = Math.round(Math.max(0, size) * 100) / 100;

    logAgent(
      ctx,
      "ShortTermPlanner",
      ctx.walletBalanceUsd > 0
        ? `Position size locked at $${ctx.targetPositionSizeUsd.toFixed(2)} (15% of equity, $${cap} cap).`
        : "No wallet balance supplied, so position size is $0.00 and no transaction can be prepared.",
      ctx.targetPositionSizeUsd > 0 ? "success" : "warn"
    );
  }
}
