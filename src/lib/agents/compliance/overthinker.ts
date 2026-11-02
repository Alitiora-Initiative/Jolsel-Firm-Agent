import type { CorporateContext } from "../context";
import { logAgent } from "../log";

export class Overthinker {
  static async simulateTailRisk(ctx: CorporateContext): Promise<void> {
    const token = ctx.selectedToken;
    if (!token) return;

    const risks: string[] = [];
    let level: "LOW" | "MEDIUM" | "HIGH" = "LOW";

    if (token.liquidityUsd < 50_000) {
      risks.push("thin liquidity (<$50k)");
      level = "HIGH";
    } else if (token.liquidityUsd < 150_000) {
      risks.push("moderate liquidity (<$150k)");
      level = "MEDIUM";
    }
    if (token.pairAgeMinutes !== null && token.pairAgeMinutes < 60) {
      risks.push(`young pair (${token.pairAgeMinutes}m old)`);
      level = "HIGH";
    }
    if (token.indicators.volatility > 40) {
      risks.push(`${token.indicators.volatility.toFixed(1)}% hourly volatility`);
      level = level === "HIGH" ? "HIGH" : "MEDIUM";
    }
    if (ctx.priceImpactPct !== null && ctx.priceImpactPct > 3) {
      risks.push(`${ctx.priceImpactPct.toFixed(2)}% quoted price impact`);
      level = "HIGH";
    }
    if (!ctx.reversalProtectionPlan) risks.push("no exit plan");

    ctx.boardroomVotes["Overthinker"] = {
      vote: level === "HIGH" ? "NO" : "YES",
      reason: risks.length ? risks.join("; ") : "No tail-risk flags in the live snapshot.",
      weight: 1,
    };

    if (level === "HIGH") {
      ctx.riskVetoTriggered = true;
      ctx.vetoReason = `Overthinker tail risk HIGH: ${risks.join("; ")}`;
    }

    logAgent(
      ctx,
      "Overthinker",
      risks.length ? `Tail risk ${level}: ${risks.join("; ")}.` : "Tail risk LOW: no live liquidity, age, volatility, or impact flags.",
      level === "HIGH" ? "veto" : level === "MEDIUM" ? "warn" : "success"
    );
  }
}
