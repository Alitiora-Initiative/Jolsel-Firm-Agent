import type { CorporateContext } from "../context";
export class RecordKeeper {
  static async logHeartbeat(ctx: CorporateContext): Promise<void> {
    console.log(`[📒 RecordKeeper]: Heartbeat @ ${new Date(ctx.timestamp).toISOString()}`);
  }
}
