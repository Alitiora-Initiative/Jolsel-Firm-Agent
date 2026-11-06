import type { CorporateContext } from "../context";
import { logAgent } from "../log";
import { rankCandidates } from "../scoring";

export class Bscoter {
  static async scout(ctx: CorporateContext): Promise<void> {
    const candidates = rankCandidates(ctx.pairs, ctx.timestamp, 8);
    ctx.candidates = candidates;
    ctx.selectedToken = candidates[0] ?? null;

    if (!candidates.length) {
      logAgent(
        ctx,
        "Bscoter",
        `Scanned ${ctx.pairs.length} live Solana pairs. None cleared the $20k liquidity and $50k 24h volume floors.`,
        "warn"
      );
      return;
    }

    logAgent(
      ctx,
      "Bscoter",
      `Scanned ${ctx.pairs.length} live Solana pairs. ${candidates.length} cleared liquidity and volume floors; top: ${candidates[0].symbol} (${candidates[0].dexId}, $${Math.round(candidates[0].liquidityUsd).toLocaleString("en-US")} liquidity).`,
      "success"
    );
  }
}
