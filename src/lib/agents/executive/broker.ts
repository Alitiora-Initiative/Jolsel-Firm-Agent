import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class Broker {
  static async advocateMomentum(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) return;

    const yes = token.direction === "LONG" && token.score >= 80 && token.indicators.momentum > 0;
    ctx.boardroomVotes["Broker"] = {
      vote: yes ? "YES" : "NO",
      reason: yes
        ? `${token.symbol} has positive momentum and an ${token.score}/99 composite.`
        : `${token.symbol} does not have both positive momentum and an 80+ composite.`,
      weight: 1,
    };
    logAgent(ctx, "Broker", yes ? `Advocating entry in ${token.symbol}.` : `Not advocating entry in ${token.symbol}.`, yes ? "info" : "warn");
  }
}
