import type { CorporateContext } from "../context";
export class ShortTermPlanner {
  static async calculatePyramiding(ctx: CorporateContext): Promise<void> {
    ctx.targetPositionSizeUSDT = Math.min(ctx.walletBalanceUSDT * 0.15, 50);
    console.log("[📊 ShortTermPlanner]: Size locked:", ctx.targetPositionSizeUSDT);
  }
}
