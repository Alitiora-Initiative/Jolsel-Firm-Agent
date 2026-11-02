import { logAgent } from "../log";
import type { CorporateContext } from "../context";
import { getLedgerStats } from "./ledger";

export class RecordReviewer {
  static async evaluatePerformance(ctx: CorporateContext): Promise<void> {
    const stats = getLedgerStats();
    logAgent(
      ctx,
      "RecordReviewer",
      `${stats.total} recorded cycle(s) on this instance: ${stats.buys} buy mandate(s), ${stats.vetoes} veto(s), ${stats.standAside} stand-aside(s). No PnL is claimed from unexecuted signals.`,
      "info"
    );
  }
}
