import type { CorporateContext } from "../context";
import { logAgent } from "../log";
import { recordRun } from "./ledger";

export class RecordKeeper {
  static async logHeartbeat(ctx: CorporateContext): Promise<void> {
    const record = recordRun(ctx);
    logAgent(
      ctx,
      "RecordKeeper",
      `Recorded ${record.runId}: ${record.symbol ?? "no candidate"} → ${record.action} (${record.safety ?? "no safety report"}).`,
      "info"
    );
  }
}
