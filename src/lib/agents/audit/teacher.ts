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
  }
}
