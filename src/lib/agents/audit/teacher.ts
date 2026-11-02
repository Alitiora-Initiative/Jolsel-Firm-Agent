import type { CorporateContext } from "../context";
import { getAgentWinRate, loadLearning } from "../learning";

export class Teacher {
  static async executeDailyAuditQuizzes(ctx?: CorporateContext): Promise<void> {
    const agents = ["Bscoter", "Analuszer", "RiskManager"];
    const notes: string[] = [];
    for (const a of agents) {
      const wr = getAgentWinRate(a);
      notes.push(`${a} win-rate ${(wr * 100).toFixed(0)}%`);
    }
    const recent = loadLearning().slice(0, 5);
    if (ctx) {
      ctx.events.push(`[Teacher] Learning review: ${notes.join(", ")} | recent records ${recent.length}`);
    }
import { logAgent } from "../log";

export class Teacher {
  static async executeDailyAuditQuizzes(ctx: CorporateContext): Promise<void> {
    const lesson = ctx.vetoReason
      ? `Lesson: ${ctx.vetoReason}. The desk skips trades that fail a hard gate; skipping is a result, not a failure.`
      : ctx.action === "BUY"
        ? "Lesson: a signed mandate is still only a proposal. The wallet owner must review the quote, impact, and size before signing."
        : "Lesson: no setup cleared every gate. Standing aside preserves capital and is the default when data is missing.";

    logAgent(ctx, "Teacher", lesson, "info");
  }
}
