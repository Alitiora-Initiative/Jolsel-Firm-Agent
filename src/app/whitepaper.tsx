/* eslint-disable */
import Image from "next/image";

export default function Whitepaper() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Whitepaper</h2>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Jolsel Firm Architecture — Production-Grade Multi-Agent Solana Memecoin Trading
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-text-solana-green text-sm font-semibold uppercase tracking-wider">Agent Discovery Pipeline</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Bscoter:</strong> Token scouting with real SOL balance queries and on-chain mint data from SPL standard
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Analuszer:</strong> Real momentum analysis via Jupiter Aggregator API — 24h price change, volume-weighted scoring
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>CryptoGuru:</strong> Real social sentiment from DexScreener trending pairs and volume data
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Planning & Risk Engine</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Forecaster:</strong> Real scenario simulation using DexScreener volume and price data to determine viability
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>LongTermPlanner:</strong> Asset-class routing based on real portfolio equity and observed market volumes
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>ShortTermPlanner:</strong> Real-time position sizing based on 24h trading volume and wallet balance
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-violet-400 text-sm font-semibold uppercase tracking-wider">Execution & Compliance</h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>MrGrumpy:</strong> Zero-tolerance enforcement combined with real liquidity checks — score + volume must both pass
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>RiskManager:</strong> Survival floor verified against both wallet balance and real 24h volume caps
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Verdicter:</strong> Mandate signing only when all conditions pass: indicator score ≥ 80, market valid, real liquidity present
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <h3 className="text-text-solana-green text-sm font-semibold uppercase tracking-wider mb-4">Production Readiness</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-solana-green text-sm font-semibold">✓</div>
              <div>Real API integrations (Jupiter, DexScreener)</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-solana-green text-sm font-semibold">✓</div>
              <div>Self-custody model — no private keys on server</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-solana-green text-sm font-semibold">✓</div>
              <div>Verified on-chain data flows</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}