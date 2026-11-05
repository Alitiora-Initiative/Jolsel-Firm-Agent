import type { CorporateContext } from "../context";
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
