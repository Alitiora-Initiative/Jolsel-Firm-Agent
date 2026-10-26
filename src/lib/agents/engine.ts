import { createInitialContext, type CorporateContext, type LivePair } from "./context";
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

export class TradingFirmEngine {
  private context: CorporateContext = createInitialContext();

  /** One-shot live run usable from the browser Terminal */
  async runOnce(livePairs: LivePair[], managedMints: string[] = [], walletUsd = 0): Promise<CorporateContext> {
    this.context = createInitialContext();
    this.context.timestamp = Date.now();
    this.context.walletBalanceUSDT = walletUsd;
    this.context.managedMints = managedMints;
    this.context.events = [];

    await Bscoter.scout(this.context, livePairs);
    await CryptoGuru.analyzeCrowd(this.context);
    await Analuszer.calculatePrecisionMetrics(this.context);

    if (this.context.selectedToken && this.context.customIndicatorsScore >= 75) {
      await Forecaster.simulateScenarios(this.context);
      await LongTermPlanner.routeAssetClass(this.context);
      await ShortTermPlanner.calculatePyramiding(this.context);

      await Overthinker.simulateTailRisk(this.context);
      await Reviewer.auditContractSafety(this.context);
      await MrGrumpy.enforceZeroTolerance(this.context);
      await RiskManager.verifySurvivalFloor(this.context);

      if (!this.context.riskVetoTriggered) {
        await Broker.advocateMomentum(this.context);
        await Judge.aggregateVotes(this.context);
        await Verdicter.signMandate(this.context);
        if (this.context.executionApproved) {
          await Trader.executeAtomicTransaction(this.context);
          this.context.events.push(`[Trader] Proposal ready for ${this.context.selectedToken.symbol} — user must sign`);
        }
      } else {
        this.context.events.push(`[Pipeline] Vetoed: ${this.context.vetoReason}`);
      }
    } else {
      this.context.events.push("[Pipeline] No candidate cleared score gate");
    }

    await RecordKeeper.logHeartbeat(this.context);
    await RecordReviewer.evaluatePerformance();
    await Teacher.executeDailyAuditQuizzes(this.context);

    return this.context;
  }
}
