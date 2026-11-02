import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class MrGrumpy {
  static async enforceZeroTolerance(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) return;

    const failures: string[] = [];
    if (token.score < 80) failures.push(`composite score ${token.score} is below the 80 gate`);
    if (token.direction === "SHORT") failures.push("negative momentum: spot desk stands aside instead of shorting");
    if (token.liquidityUsd < 25_000) failures.push("liquidity below $25k");
    if (token.volumeH24Usd < 75_000) failures.push("24h volume below $75k");
    if (token.pairAgeMinutes !== null && token.pairAgeMinutes < 15) failures.push(`pair is only ${token.pairAgeMinutes}m old`);
    if (ctx.priceImpactPct !== null && ctx.priceImpactPct > 5) failures.push(`price impact ${ctx.priceImpactPct.toFixed(2)}%`);
    if (!ctx.safety || ctx.safety.status === "unverified") failures.push("on-chain mint safety is unverified");
    if (ctx.safety?.status === "blocked") failures.push("mint safety is blocked");
    if (ctx.safety?.status === "warn" && (ctx.safety.mintAuthority || ctx.safety.freezeAuthority)) {
      failures.push("active mint or freeze authority");
    }

    const softStandAside = token.direction === "SHORT";
    if (failures.length) {
      ctx.boardroomVotes["MrGrumpy"] = {
        vote: "NO",
        reason: failures.join("; "),
        weight: 2,
      };
      if (!softStandAside) {
        ctx.riskVetoTriggered = true;
        ctx.vetoReason = `MrGrumpy zero-tolerance: ${failures.join("; ")}`;
      }
      logAgent(ctx, "MrGrumpy", `Rejected: ${failures.join("; ")}.`, softStandAside ? "warn" : "veto");
      return;
    }

    ctx.boardroomVotes["MrGrumpy"] = {
      vote: "YES",
      reason: "All zero-tolerance gates passed.",
      weight: 2,
    };
    logAgent(ctx, "MrGrumpy", "All zero-tolerance gates passed.", "success");
  }
}
