export function WhitepaperSection() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Whitepaper</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Jolsel Firm architecture: a live, self-custodial multi-agent desk for Solana markets.
          </p>
          <a
            href="/whitepaper"
            className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white hover:bg-white/5"
          >
            Read the full whitepaper
          </a>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-solana-green">
              Discovery pipeline
            </h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Bscoter:</strong> scans live DexScreener Solana pairs and enforces liquidity
                  and 24h volume floors before a token reaches the desk.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Analuszer:</strong> computes deterministic momentum, order-flow, depth, and
                  volume-quality scores from observed market fields.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>CryptoGuru:</strong> measures participation with real buy/sell counts. No
                  social API is connected, so no social score is invented.
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
              Planning and risk
            </h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Forecaster:</strong> derives expected move and scenario bands from live
                  volatility and volume, and compares them with the quoted round-trip cost.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>LongTermPlanner:</strong> routes asset class from the supplied wallet equity
                  and observed market liquidity.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>ShortTermPlanner:</strong> sizes entries against real 24h volume, wallet
                  balance, and live Jupiter price impact.
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-400">
              Execution and compliance
            </h3>
            <ul className="mt-4 space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Reviewer / MrGrumpy:</strong> read the mint account itself for authorities,
                  transfer fees, hooks, and Token-2022 extensions; unsafe mints are blocked.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>RiskManager:</strong> verifies the survival floor and caps position size
                  against live liquidity.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-solana-purple" />
                <div>
                  <strong>Trader:</strong> returns an unsigned Jupiter swap transaction. The server
                  never holds keys, signs, or sends.
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-solana-green">
            Production posture
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-sm font-semibold text-solana-green">Live feeds</div>
              <div className="mt-1 text-sm text-slate-300">DexScreener markets, Jupiter quotes, and Solana RPC mint state.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-sm font-semibold text-solana-green">Self-custody</div>
              <div className="mt-1 text-sm text-slate-300">No server key can trade; every swap is signed by the user wallet.</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <div className="text-sm font-semibold text-solana-green">Honest gaps</div>
              <div className="mt-1 text-sm text-slate-300">Missing data is reported as unavailable, never replaced with fake numbers.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
