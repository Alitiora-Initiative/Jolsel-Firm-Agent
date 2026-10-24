import type { CorporateContext } from "../context";
export class Verdicter {
  static async signMandate(ctx: CorporateContext): Promise<void> {
    ctx.executionApproved = !ctx.riskVetoTriggered && ctx.isWorthIt;
    console.log(`[⚖️ Verdicter]: Mandate ${ctx.executionApproved ? "SIGNED" : "DENIED"}`);
  }
}
