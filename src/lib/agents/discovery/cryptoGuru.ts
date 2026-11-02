import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class CryptoGuru {
  /**
   * Uses real DEX buy/sell transaction counts as order-flow sentiment.
   * No social API is configured, so no social score is invented.
   */
  static async analyzeCrowd(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) {
      ctx.orderFlowScore = null;
      return;
    }

    const total = token.buysH1 + token.sellsH1;
    if (total <= 0) {
      ctx.orderFlowScore = null;
      logAgent(ctx, "CryptoGuru", `${token.symbol}: no 1h trade counts published by the DEX feed; order flow unknown.`, "warn");
      return;
    }

    const share = (token.buysH1 / total) * 100;
    ctx.orderFlowScore = Math.round(share);
    logAgent(
      ctx,
      "CryptoGuru",
      `${token.symbol} 1h order flow: ${token.buysH1} buys / ${token.sellsH1} sells (${share.toFixed(0)}% buy-side). Social sentiment is not connected, so it is not scored.`,
      share >= 55 ? "success" : share <= 45 ? "warn" : "info"
    );
  }
}
