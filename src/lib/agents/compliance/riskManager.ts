import type { CorporateContext } from "../context";
export class RiskManager {
  static async verifySurvivalFloor(ctx: CorporateContext): Promise<void> {
    if (ctx.targetPositionSizeUSDT > ctx.walletBalanceUSDT * 0.25) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = "Position size breaches survival floor";
    }
    console.log("[🛡️ RiskManager]: Survival floor verified.");
  }
}
