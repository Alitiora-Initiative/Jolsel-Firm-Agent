import type { DexPair } from "@/lib/dexscreener";
import { getTokenPairs, getTrendingSolana } from "@/lib/dexscreener";
import { getQuote, SOL, summarizeQuote } from "@/lib/jupiter";
import { getSolUsd } from "@/lib/price";
import { createInitialContext, type CorporateContext } from "./context";
import { Bscoter } from "./discovery/bscoter";
import { Analuszer } from "./discovery/analuszer";
import { CryptoGuru } from "./discovery/cryptoGuru";
import { Forecaster } from "./planning/forecaster";
import { LongTermPlanner } from "./planning/longTermPlanner";
import { ShortTermPlanner } from "./planning/shortTermPlanner";
import { Overthinker } from "./compliance/overthinker";
import { Reviewer } from "./compliance/reviewer";
import { MrGrumpy } from "./compliance/mrGrumpy";
import { RiskManager } from "./compliance/riskManager";
import { Broker } from "./executive/broker";
import { Judge } from "./executive/judge";
import { Verdicter } from "./executive/verdicter";
import { Trader } from "./executive/trader";
import { RecordKeeper } from "./audit/recordKeeper";
import { RecordReviewer } from "./audit/recordReviewer";
import { Teacher } from "./audit/teacher";
import { getLedgerStats } from "./audit/ledger";
import { logAgent } from "./log";

export interface FirmRunInput {
  pairs?: DexPair[];
  mint?: string;
  walletBalanceUsd?: number;
  walletPublicKey?: string;
  slippageBps?: number;
}

export interface FirmRunResult {
  ok: true;
  runId: string;
  asOf: number;
  source: string;
  scanned: number;
  candidates: CorporateContext["candidates"];
  selected: CorporateContext["selectedToken"];
  indicators: CorporateContext["indicators"];
  safety: CorporateContext["safety"];
  decision: {
    action: CorporateContext["action"];
    direction: CorporateContext["tradeDirection"] | null;
    approved: boolean;
    vetoReason: string;
    positionSizeUsd: number;
    slippageBps: number;
    expectedMovePct: number;
    roundTripCostPct: number | null;
    priceImpactPct: number | null;
    worthIt: boolean;
    votes: CorporateContext["boardroomVotes"];
    plan: CorporateContext["reversalProtectionPlan"];
  };
  quote: CorporateContext["quote"];
  swapTransaction: string | null;
  events: CorporateContext["events"];
  ledger: ReturnType<typeof getLedgerStats>;
  limits: {
    note: string;
    socialSentiment: string;
  };
}

function serialize(ctx: CorporateContext, scanned: number): FirmRunResult {
  return {
    ok: true,
    runId: ctx.runId,
    asOf: ctx.timestamp,
    source: "dexscreener + jupiter + solana-rpc",
    scanned,
    candidates: ctx.candidates,
    selected: ctx.selectedToken,
    indicators: ctx.indicators,
    safety: ctx.safety,
    decision: {
      action: ctx.action,
      direction: ctx.selectedToken?.direction ?? null,
      approved: ctx.executionApproved,
      vetoReason: ctx.vetoReason,
      positionSizeUsd: ctx.targetPositionSizeUsd,
      slippageBps: ctx.slippageBps,
      expectedMovePct: ctx.expectedMovePct,
      roundTripCostPct: ctx.roundTripCostPct,
      priceImpactPct: ctx.priceImpactPct,
      worthIt: ctx.isWorthIt,
      votes: ctx.boardroomVotes,
      plan: ctx.reversalProtectionPlan,
    },
    quote: ctx.quote,
    swapTransaction: ctx.swapTransaction,
    events: ctx.events,
    ledger: getLedgerStats(),
    limits: {
      note: "Signals use live public market and Solana RPC data. They are not financial advice, and no server key can trade for you.",
      socialSentiment: "No social API is connected, so no social sentiment score is produced.",
    },
  };
}

/**
 * One real, deterministic firm cycle. Agents read live DexScreener pairs,
 * Jupiter quotes, and Solana mint state; the server never signs or sends.
 */
export async function runFirmCycle(input: FirmRunInput = {}): Promise<FirmRunResult> {
  const now = Date.now();
  let pairs = input.pairs ?? [];

  if (input.mint) {
    const matched = pairs.filter((p) => p.baseToken?.address === input.mint);
    pairs = matched.length ? matched : await getTokenPairs(input.mint);
    if (!pairs.length) {
      pairs = await getTrendingSolana();
    }
  } else if (!pairs.length) {
    pairs = await getTrendingSolana();
  }

  const ctx = createInitialContext({
    pairs,
    walletBalanceUsd: input.walletBalanceUsd,
    walletPublicKey: input.walletPublicKey,
    slippageBps: input.slippageBps,
  });
  ctx.timestamp = now;

  await Bscoter.scout(ctx);

  if (ctx.selectedToken) {
    await CryptoGuru.analyzeCrowd(ctx);
    await Analuszer.calculatePrecisionMetrics(ctx);

    await LongTermPlanner.routeAssetClass(ctx);
    await ShortTermPlanner.calculatePyramiding(ctx);

    if (ctx.targetPositionSizeUsd > 0) {
      const sol = await getSolUsd();
      if (!sol) {
        logAgent(ctx, "Trader", "Live SOL/USD price unavailable; cannot size a Jupiter quote.", "warn");
      } else {
        const lamports = Math.max(1, Math.floor((ctx.targetPositionSizeUsd / sol.usd) * 1e9));
        try {
          const raw = await getQuote({
            inputMint: SOL,
            outputMint: ctx.selectedToken.mint,
            amount: String(lamports),
            slippageBps: ctx.slippageBps,
          });
          ctx.quoteResponse = raw;
          ctx.quote = summarizeQuote(raw, ctx.slippageBps);
          ctx.priceImpactPct = ctx.quote.priceImpactPct;
          logAgent(
            ctx,
            "Trader",
            `Live Jupiter quote: ${ctx.quote.inAmount} lamports → ${ctx.quote.outAmount} base units, impact ${ctx.quote.priceImpactPct.toFixed(3)}% via ${ctx.quote.route.join(" → ") || "unknown route"}.`,
            "info"
          );
        } catch (e: any) {
          logAgent(ctx, "Trader", `Jupiter quote failed: ${e?.message ?? "unknown error"}`, "warn");
        }
      }
    }

    await Forecaster.simulateScenarios(ctx);
    await Overthinker.simulateTailRisk(ctx);
    await Reviewer.auditContractSafety(ctx);
    await MrGrumpy.enforceZeroTolerance(ctx);
    await RiskManager.verifySurvivalFloor(ctx);
    await Broker.advocateMomentum(ctx);
    await Judge.aggregateVotes(ctx);
    await Verdicter.signMandate(ctx);

    if (ctx.action === "BUY") {
      await Trader.executeAtomicTransaction(ctx);
    }
  } else {
    await Verdicter.signMandate(ctx);
  }

  await RecordKeeper.logHeartbeat(ctx);
  await RecordReviewer.evaluatePerformance(ctx);
  await Teacher.executeDailyAuditQuizzes(ctx);

  return serialize(ctx, pairs.length);
}

/**
 * Local long-running runner for a dedicated host. Serverless deployments should
 * call runFirmCycle from a route or cron instead.
 */
export class TradingFirmEngine {
  private intervalMs = 15_000;

  async runOnce(input: FirmRunInput = {}): Promise<FirmRunResult> {
    return runFirmCycle(input);
  }

  async startPipeline(onResult?: (result: FirmRunResult) => void): Promise<never> {
    for (;;) {
      try {
        const result = await runFirmCycle();
        onResult?.(result);
      } catch (e: any) {
        console.error("Jolsel pipeline error:", e?.message ?? e);
      }
      await new Promise((resolve) => setTimeout(resolve, this.intervalMs));
    }

  }
}
