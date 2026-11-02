import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class Judge {
  static async aggregateVotes(ctx: CorporateContext): Promise<void> {
    const votes = Object.values(ctx.boardroomVotes);
    const yes = votes.filter((v) => v.vote === "YES").reduce((sum, v) => sum + v.weight, 0);
    const no = votes.filter((v) => v.vote === "NO").reduce((sum, v) => sum + v.weight, 0);
    const abstain = votes.filter((v) => v.vote === "ABSTAIN").reduce((sum, v) => sum + v.weight, 0);
    const quorum = votes.filter((v) => v.vote !== "ABSTAIN").length >= 4;

    ctx.executionApproved = quorum && yes > no && !ctx.riskVetoTriggered;

    logAgent(
      ctx,
      "Judge",
      `Weighted vote: ${yes} yes / ${no} no / ${abstain} abstain across ${votes.length} agents. Quorum ${quorum ? "met" : "not met"}; ${ctx.executionApproved ? "approved" : "not approved"}.`,
      ctx.executionApproved ? "success" : "warn"
    );
  }
}
