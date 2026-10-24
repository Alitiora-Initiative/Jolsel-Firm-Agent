import type { CorporateContext } from "../context";
export class MrGrumpy {
  static async enforceZeroTolerance(ctx: CorporateContext): Promise<void> {
    if (ctx.customIndicatorsScore < 70) {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = "Indicator score below zero-tolerance floor";
    }
    console.log("[🛡️ MrGrumpy]: Zero-tolerance scan complete.");
  }
}
