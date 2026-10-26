import type { CorporateContext } from "../context";

export class RiskManager {
  static async verifySurvivalFloor(ctx: CorporateContext): Promise<void> {
    if (!ctx.selectedToken) return;
    if (ctx.selectedToken.liquidityUsd < 10000) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = "Liquidity too thin for safe exit";
    }
    if (ctx.targetPositionSizeUSDT > 0 && ctx.walletBalanceUSDT > 0 && ctx.targetPositionSizeUSDT > ctx.walletBalanceUSDT * 0.2) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = "Position size too large vs wallet";
    }
    if (ctx.managedMints.includes(ctx.selectedToken.mint) && ctx.selectedToken.priceChangeH1 < -15) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = "Managed bag showing strong drawdown — review stop rules";
    }
    ctx.events.push(`[RiskManager] ${ctx.riskVetoTriggered ? "VETO: " + ctx.vetoReason : "Passed"}`);
  }
}
