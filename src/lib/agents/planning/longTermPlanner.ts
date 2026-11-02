import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class LongTermPlanner {
  static async routeAssetClass(ctx: CorporateContext): Promise<void> {
    if (ctx.walletBalanceUsd < 200) ctx.activeAssetClass = "MEME_COIN";
    else if (ctx.walletBalanceUsd < 1000) ctx.activeAssetClass = "TOKENIZED_STOCK";
    else ctx.activeAssetClass = "PERPETUAL";

    logAgent(
      ctx,
      "LongTermPlanner",
      ctx.walletBalanceUsd > 0
        ? `$${ctx.walletBalanceUsd.toFixed(2)} equity routes to ${ctx.activeAssetClass}.`
        : "No wallet balance supplied; defaulting to MEME_COIN analysis and blocking execution sizing.",
      "info"
    );
  }
}
