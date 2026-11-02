export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple text-xs font-bold text-slate-950">JF</a>
            <div>
              <div className="text-sm font-semibold">Jolsel Firm Whitepaper</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Research, agents, and risk controls</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-xs">
            <a href="/" className="rounded-full px-3 py-1 text-slate-400 hover:text-white">Home</a>
            <a href="/core" className="rounded-full px-3 py-1 text-slate-400 hover:text-white">Core</a>
            <a href="/dashboard" className="rounded-full bg-white/10 px-3 py-1 text-white">Terminal</a>
          </nav>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-solana-green">Jolsel Firm</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Whitepaper</h1>
          <p className="mt-3 text-lg text-slate-400">A live, self-custodial multi-agent trading desk for Solana memecoins with hard gates, real market data, and no hidden server keys.</p>
          <p className="mt-2 text-xs text-slate-500">Version 1.0.0 · Published for review · Not financial advice</p>
        </header>

        <div className="space-y-8">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Abstract</h2>
            <p className="mt-3 leading-relaxed text-slate-300">Jolsel Firm treats a trading desk as a corporation. Seventeen specialized agents are split across Discovery, Planning, Compliance, Executive, and Audit departments and share a single mutable context. Each cycle reads live DexScreener pairs, computes deterministic indicators, inspects Token-2022/SPL mints on-chain, requests a live Jupiter quote when sizing is possible, and only signs a mandate if every hard gate passes. All swaps are signed by the connected wallet; the server never holds private keys.</p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">1. Principles</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• <span className="text-white">Self-custody</span>: proposals only; you sign every transaction.</li>
              <li>• <span className="text-white">Real data only</span>: no simulated prices, volumes, or fabricated PnL. Missing feeds return <span className="font-mono">unverified</span> or are logged explicitly.</li>
              <li>• <span className="text-white">Hard gates</span>: a composite score below 80, thin liquidity, dangerous mint extensions, or failed risk checks can veto a trade.</li>
              <li>• <span className="text-white">Spot-first</span>: negative momentum triggers stand-aside on a spot-only desk.</li>
              <li>• <span className="text-white">Explainability</span>: every agent action is logged to the boardroom stream.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">2. Agent Architecture</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400">Discovery</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  <li>• Bscoter — filters by liquidity ($20k+) and 24h volume ($50k+) from live pairs</li>
                  <li>• CryptoGuru — derives buy/sell share from DexScreener transaction counts</li>
                  <li>• Analuszer — deterministic momentum/trend/flow scoring</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400">Planning</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  <li>• Forecaster — compares expected move to estimated round-trip cost</li>
                  <li>• LongTermPlanner — routes by equity to MEME_COIN / TOKENIZED_STOCK / PERPETUAL</li>
                  <li>• ShortTermPlanner — sizes at 15% of equity with a $50 cap</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">Compliance</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  <li>• Overthinker — tail risk (liquidity, age, volatility, impact)</li>
                  <li>• Reviewer — on-chain mint inspection (Token-2022 extensions, authorities)</li>
                  <li>• MrGrumpy — zero-tolerance gate enforcement</li>
                  <li>• RiskManager — survival floor (25% of equity) and slippage caps</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">Executive</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-300">
                  <li>• Broker — momentum advocacy</li>
                  <li>• Judge — weighted vote aggregation with quorum</li>
                  <li>• Verdicter — mandate signing or veto</li>
                  <li>• Trader — builds unsigned Jupiter swaps; wallet must sign</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-400">Audit</h3>
              <p className="mt-2 text-sm text-slate-300">RecordKeeper, RecordReviewer, and Teacher log each cycle, surface instance-local stats, and provide post-trade lessons. Durability depends on the hosting environment.</p>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">3. Data Sources &amp; Infrastructure</h2>
            <div className="mt-3 grid gap-4 md:grid-cols-3 text-sm text-slate-300">
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <div className="font-semibold text-white">Market</div>
                <p className="mt-2">DexScreener public APIs for pairs, tokens, and live prices.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <div className="font-semibold text-white">Execution</div>
                <p className="mt-2">Jupiter Lite API for quotes and unsigned swap transactions.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-slate-950/60 p-4">
                <div className="font-semibold text-white">On-chain</div>
                <p className="mt-2">Solana RPC for SPL/Token-2022 mint inspection; public mainnet-beta by default.</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">4. Risk Controls</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• <span className="text-white">Liquidity floor</span>: $20k+ liquidity and $50k+ 24h volume to be considered.</li>
              <li>• <span className="text-white">Safety audit</span>: block or warn on non-transferable, permanent delegate, transfer hook, active freeze/mint authority.</li>
              <li>• <span className="text-white">Position sizing</span>: max $50, max 25% of equity, slippage capped at 300 bps.</li>
              <li>• <span className="text-white">Cost awareness</span>: estimated round-trip cost compared to expected move.</li>
              <li>• <span className="text-white">Age/volatility</span>: young pairs and high volatility increase veto probability.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">5. Limitations</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• <span className="text-white">No guaranteed execution</span>: Jupiter quotes can change between quote and signature.</li>
              <li>• <span className="text-white">No server-side trading</span>: private keys are never requested or stored.</li>
              <li>• <span className="text-white">Public data</span>: some pairs may lack full transaction counts or metadata.</li>
              <li>• <span className="text-white">Experimental</span>: memecoins are highly volatile; use extreme caution.</li>
              <li>• <span className="text-white">Instance-local ledger</span>: the in-memory audit ledger is not durable across serverless cold starts.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
            <h2 className="text-xl font-semibold text-amber-200">Disclaimer</h2>
            <p className="mt-3 leading-relaxed text-amber-100/80">This software is provided for informational and educational purposes only. Nothing herein constitutes financial, investment, tax, or legal advice. Trading digital assets involves substantial risk of loss. You are solely responsible for your decisions and wallet security. Past signals do not predict future results.</p>
          </section>
        </div>
      </article>

      <footer className="border-t border-white/5 px-4 py-8 text-center text-xs text-slate-500">
        <p>Jolsel Firm • Alitiora Initiative • <a href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent" className="hover:text-white">GitHub</a></p>
      </footer>
    </main>
  );
}
