import type { CorporateContext } from "../context";
import { getSwapTransaction } from "@/lib/jupiter";
import { logAgent } from "../log";

export class Trader {
  /**
   * Builds an unsigned Jupiter swap transaction. It never holds or uses a
   * private key: the connected wallet must sign and send.
   */
  static async executeAtomicTransaction(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token || ctx.action !== "BUY" || !ctx.quoteResponse) {
      logAgent(ctx, "Trader", "No approved executable quote; nothing prepared.", "info");
      return;
    }

    if (!ctx.walletPublicKey) {
      logAgent(
        ctx,
        "Trader",
        `Execution plan ready for ${token.symbol}: $${ctx.targetPositionSizeUsd.toFixed(2)}. Connect a wallet to build the unsigned swap transaction.`,
        "info"
      );
      return;
    }

    try {
      const swap = await getSwapTransaction({
        quoteResponse: ctx.quoteResponse,
        userPublicKey: ctx.walletPublicKey,
      });
      ctx.swapTransaction = swap.swapTransaction ?? null;
      logAgent(
        ctx,
        "Trader",
        ctx.swapTransaction
          ? `Unsigned Jupiter swap built for ${token.symbol}. The wallet must review and sign; the server cannot send it.`
          : "Jupiter returned no swap transaction.",
        ctx.swapTransaction ? "trade" : "warn"
      );
    } catch (e: any) {
      logAgent(ctx, "Trader", `Jupiter swap build failed: ${e?.message ?? "unknown error"}`, "warn");
    }
  }
}
