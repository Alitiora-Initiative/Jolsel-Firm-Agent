export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6">
      <div className="mx-auto max-w-6xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-solana-green/30 bg-solana-green/10 px-4 py-1.5 text-xs font-medium text-solana-green">
          <span className="h-1.5 w-1.5 rounded-full bg-solana-green animate-pulse" />
          17 Specialized Agents · Solana Native
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">Jolsel Firm</h1>
        <p className="mt-4 text-xl text-solana-green font-medium sm:text-2xl">Multi-Agent Solana Trading Firm</p>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 leading-relaxed">
          A unified corporate engine of specialized AI agents that discover, plan, risk-check, vote, execute and audit trades on Solana — from meme coins to tokenized assets and perpetuals.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#departments" className="rounded-full bg-gradient-to-r from-solana-green to-emerald-400 px-8 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-solana-green/25 hover:opacity-90 transition">Meet the Agents</a>
          <a href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">View Source</a>
        </div>
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
          {[ { label: "Agents", value: "17+" }, { label: "Departments", value: "5" }, { label: "Chain", value: "Solana" }, { label: "Mode", value: "Live-ready" } ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
