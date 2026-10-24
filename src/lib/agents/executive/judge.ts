import type { CorporateContext } from "../context";
export class Judge {
  static async aggregateVotes(ctx: CorporateContext): Promise<void> {
    const votes = Object.values(ctx.boardroomVotes);
    const yes = votes.filter((v) => /APPROVE|YES/i.test(v)).length;
    console.log(`[⚖️ Judge]: ${yes}/${votes.length} affirmative votes.`);
  }
}
