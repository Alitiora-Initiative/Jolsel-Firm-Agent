export function Architecture() {
  return (
    <section id="architecture" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Corporate Context Engine</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Shared mutable state that every agent reads and writes. The firm thinks as one organism.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 md:p-10 font-mono text-sm overflow-x-auto">
          <pre className="text-slate-300 leading-relaxed">{`interface CorporateContext {
  timestamp: number;
  walletBalanceUSDT: number;
  activeAssetClass: 'MEME_COIN' | 'TOKENIZED_STOCK' | 'PERPETUAL';
  scoutedTokens: Token[];
  selectedToken: Token | null;
  customIndicatorsScore: number;   // gate ≥ 80
  socialSentimentScore: number;
  isWorthIt: boolean;
  reversalProtectionPlan: Plan | null;
  riskVetoTriggered: boolean;
  vetoReason: string;
  targetPositionSizeUSDT: number;
  slippageMax: number;
  boardroomVotes: Record<string, string>;
  executionApproved: boolean;
}`}</pre>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-solana-green text-sm font-semibold">Hard Gate</div>
            <p className="mt-2 text-sm text-slate-400">Indicator score must be ≥ 80 before Planning even runs.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-amber-400 text-sm font-semibold">Veto Power</div>
            <p className="mt-2 text-sm text-slate-400">Any Compliance agent can set riskVetoTriggered and stop the trade.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="text-violet-400 text-sm font-semibold">Board Vote</div>
            <p className="mt-2 text-sm text-slate-400">Executive agents cast votes; Verdicter only signs on quorum.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
