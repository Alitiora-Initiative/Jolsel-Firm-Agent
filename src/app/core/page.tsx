import Link from "next/link";
import { FirmConsole } from "@/components/core/FirmConsole";

export default function CorePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple text-xs font-bold text-slate-950">JF</Link>
            <div>
              <div className="text-sm font-semibold">Jolsel Firm Core</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Real agents, real data, real controls</div>
            </div>
          </div>
          <nav className="flex items-center gap-2 text-xs">
            <Link href="/" className="rounded-full px-3 py-1 text-slate-400 hover:text-white">Home</Link>
            <Link href="/dashboard" className="rounded-full px-3 py-1 text-slate-400 hover:text-white">Terminal</Link>
            <Link href="/whitepaper" className="rounded-full px-3 py-1 text-slate-400 hover:text-white">Whitepaper</Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.4em] text-solana-green">Core</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Agents made real</h1>
          <p className="mt-3 text-lg text-slate-400">Deterministic scoring, on-chain safety checks, live Jupiter quotes, and a wallet-signed execution model.</p>
        </header>

        <div className="mb-8">
          <FirmConsole />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Data Pipeline</h2>
            <ol className="mt-3 space-y-2 text-slate-300">
              <li>1. <span className="text-white">Scout</span> — pull live Solana pairs from DexScreener and rank by liquidity, volume, and momentum</li>
              <li>2. <span className="text-white">Analyze</span> — compute momentum/trend/order flow/liquidity/volume quality from live candles/txns</li>
              <li>3. <span className="text-white">Verify</span> — inspect the mint via Solana RPC for Token-2022 extensions and authorities</li>
              <li>4. <span className="text-white">Price</span> — fetch live SOL/USD and a Jupiter quote if sizing is possible</li>
              <li>5. <span className="text-white">Decide</span> — vote across the board, enforce gates, and only sign a BUY mandate if approved</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold">Execution Model</h2>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>• <span className="text-white">No server custody</span>: the trader builds an unsigned swap transaction; signing/sending stay in the wallet</li>
              <li>• <span className="text-white">Live routes</span>: Jupiter aggregates routes and reports price impact</li>
              <li>• <span className="text-white">Slippage control</span>: user-configurable 10–300 bps, enforced by risk checks</li>
              <li>• <span className="text-white">Real fees</span>: round-trip estimates include slippage, impact, and fees</li>
              <li>• <span className="text-white">Transparent errors</span>: failed quotes or RPC checks are logged, not hidden</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:col-span-2">
            <h2 className="text-xl font-semibold">API Surface</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">GET /api/firm/run</div>
                <div className="mt-1 text-slate-400">Run one full agent cycle with live data. Query params: mint, walletBalanceUsd, walletPublicKey, slippageBps.</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">POST /api/firm/run</div>
                <div className="mt-1 text-slate-400">Same as GET, accepts a JSON body for integrations.</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">GET /api/firm/ledger</div>
                <div className="mt-1 text-slate-400">Instance-local cycle history and aggregate stats.</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">GET /api/price/sol</div>
                <div className="mt-1 text-slate-400">Live SOL/USD from Jupiter/DexScreener.</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">GET /api/jupiter/quote</div>
                <div className="mt-1 text-slate-400">Proxied Jupiter Lite quote with validation.</div>
              </div>
              <div className="rounded-lg border border-white/5 bg-slate-950/60 p-3">
                <div className="font-mono text-solana-green">POST /api/jupiter/swap</div>
                <div className="mt-1 text-slate-400">Build unsigned swap transaction for a signed quote.</div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-gradient-to-r from-solana-green to-emerald-400 px-6 py-2 text-sm font-semibold text-slate-950">Open Terminal</Link>
          <Link href="/whitepaper" className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white hover:bg-white/5">Read Whitepaper</Link>
          <a href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent" className="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white hover:bg-white/5">GitHub</a>
        </div>
      </div>
    </main>
  );
}
