import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class RiskManager {
  static async verifySurvivalFloor(ctx: CorporateContext): Promise<void> {
    const failures: string[] = [];
    const balance = ctx.walletBalanceUsd;
    const size = ctx.targetPositionSizeUsd;

    if (size <= 0) failures.push("position size is $0");
    if (size > 50) failures.push("position exceeds the $50 desk cap");
    if (balance > 0 && size > balance * 0.25) failures.push("position breaches the 25% survival floor");
    if (ctx.slippageBps > 300) failures.push("slippage cap above 300 bps");

    ctx.boardroomVotes["RiskManager"] = {
      vote: failures.length ? "NO" : "YES",
      reason: failures.length ? failures.join("; ") : `$${size.toFixed(2)} at ${ctx.slippageBps} bps slippage stays inside the survival floor.`,
      weight: 2,
    };

    if (failures.length && ctx.walletBalanceUsd > 0) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = `RiskManager: ${failures.join("; ")}`;
    }

    logAgent(
      ctx,
      "RiskManager",
      failures.length ? `Execution blocked: ${failures.join("; ")}.` : `$${size.toFixed(2)} position at ${ctx.slippageBps} bps slippage is inside the survival floor.`,
      failures.length ? "warn" : "success"
    );
  }
}
