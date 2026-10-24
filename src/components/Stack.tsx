const stack = [
  { layer: "Frontend", items: ["Next.js 14", "React 18", "Tailwind CSS", "TypeScript"] },
  { layer: "Agent Runtime", items: ["Node / TS", "Shared CorporateContext", "5s heartbeat loop"] },
  { layer: "Solana Execution", items: ["Jupiter Aggregator", "Solana Web3.js", "@solana/kit", "Anchor (Rust)"] },
  { layer: "On-chain", items: ["Rust programs", "Anchor frameworks", "Token-2022", "CPIs"] },
  { layer: "Infra", items: ["Ubuntu 22.04/24.04", "Docker", "Vercel (site)", "RPC + WS"] },
  { layer: "Future / Cross", items: ["Solidity adapters", "EVM bridges", "Multi-sig vaults"] },
];

export function Stack() {
  return (
    <section id="stack" className="px-6 py-24 bg-slate-950/50">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Technology Stack</h2>
          <p className="mt-4 text-slate-400">Designed for real Solana tools on Ubuntu, with clear upgrade paths to Rust programs and optional Solidity bridges.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((s) => (
            <div key={s.layer} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-solana-green">{s.layer}</h3>
              <ul className="mt-4 space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="h-1 w-1 rounded-full bg-solana-purple" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
