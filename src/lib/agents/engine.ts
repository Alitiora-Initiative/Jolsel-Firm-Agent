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

export class TradingFirmEngine {
  private context: CorporateContext = createInitialContext();
  private baseIntervalMs = 5000;

  async startPipeline() {
    console.log("🏢 Jolsel Firm — Multi-Agent Trading Core Initialized.");
    while (true) {
      try {
        this.context.timestamp = Date.now();
        this.context.riskVetoTriggered = false;
        this.context.vetoReason = "";
        this.context.executionApproved = false;
        this.context.boardroomVotes = {};

        await Bscoter.scout(this.context);
        await CryptoGuru.analyzeCrowd(this.context);
        await Analuszer.calculatePrecisionMetrics(this.context);

        if (this.context.selectedToken && this.context.customIndicatorsScore >= 80) {
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
            }
          } else {
            console.log(`⚠️ Pipeline vetoed: ${this.context.vetoReason}`);
          }
        }

        await RecordKeeper.logHeartbeat(this.context);
        await RecordReviewer.evaluatePerformance();
        await Teacher.executeDailyAuditQuizzes();

        await new Promise((r) => setTimeout(r, this.baseIntervalMs));
      } catch (err: any) {
        console.error("🚨 Pipeline interrupted:", err?.message ?? err);
        await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }
}
