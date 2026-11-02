import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class Verdicter {
  static async signMandate(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;

    if (!token) {
      ctx.action = "STAND_ASIDE";
      ctx.executionApproved = false;
      logAgent(ctx, "Verdicter", "No candidate cleared the live floors; no mandate signed.", "warn");
      return;
    }

    if (ctx.riskVetoTriggered) {
      ctx.action = "VETO";
      ctx.executionApproved = false;
      logAgent(ctx, "Verdicter", `Mandate VETOED: ${ctx.vetoReason}`, "veto");
      return;
    }

    if (token.direction === "SHORT") {
      ctx.action = "STAND_ASIDE";
      ctx.executionApproved = false;
      logAgent(ctx, "Verdicter", `${token.symbol} is a SHORT signal; spot desk stands aside and does not open a short.`, "warn");
      return;
    }

    if (!ctx.isWorthIt) {
      ctx.action = "STAND_ASIDE";
      ctx.executionApproved = false;
      logAgent(ctx, "Verdicter", "Expected move does not clear the estimated round-trip cost.", "warn");
      return;
    }

    if (ctx.targetPositionSizeUsd <= 0) {
      ctx.action = "STAND_ASIDE";
      ctx.executionApproved = false;
      logAgent(ctx, "Verdicter", "Analysis approved, but no wallet balance was supplied so no order can be sized.", "warn");
      return;
    }

    if (!ctx.executionApproved) {
      ctx.action = "STAND_ASIDE";
      logAgent(ctx, "Verdicter", "Board did not approve a mandate.", "warn");
      return;
    }

    ctx.action = "BUY";
    logAgent(
      ctx,
      "Verdicter",
      `BUY mandate signed for ${token.symbol}: $${ctx.targetPositionSizeUsd.toFixed(2)} at ${ctx.slippageBps} bps slippage. The user still signs the swap in their wallet.`,
      "trade"
    );
  }
}
