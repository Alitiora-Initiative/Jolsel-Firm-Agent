import type { CorporateContext } from "../context";
import { logAgent } from "../log";
import { inspectMintSafety } from "../security";

export class Reviewer {
  static async auditContractSafety(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) {
      ctx.safety = null;
      return;
    }

    const safety = await inspectMintSafety(token.mint);
    ctx.safety = safety;

    const vote = safety.status === "blocked" ? "NO" : safety.status === "unverified" ? "ABSTAIN" : "YES";
    ctx.boardroomVotes["Reviewer"] = {
      vote,
      reason:
        safety.status === "safe"
          ? "On-chain mint authorities and Token-2022 extensions are clean."
          : safety.warnings.join("; ") || `Mint status ${safety.status}.`,
      weight: 2,
    };

    logAgent(
      ctx,
      "Reviewer",
      `${token.symbol} mint ${token.mint.slice(0, 8)}… ${safety.status.toUpperCase()} (${safety.program}). ${safety.warnings.length ? safety.warnings.join("; ") : "No mint, freeze, delegate, hook, or transfer-fee flags returned by the Solana RPC."}`,
      safety.status === "safe" ? "success" : safety.status === "warn" ? "warn" : "veto"
    );
  }
}
