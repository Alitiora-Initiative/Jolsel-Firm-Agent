import type { CorporateContext } from "../context";
export class Trader {
  static async executeAtomicTransaction(ctx: CorporateContext): Promise<void> {
    console.log(`[⚡ Trader]: Atomic Solana execution for ${ctx.selectedToken?.symbol ?? "N/A"} size $${ctx.targetPositionSizeUSDT}`);
  }
}
