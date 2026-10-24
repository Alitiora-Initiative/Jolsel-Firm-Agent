export function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple text-xs font-bold text-slate-950">JF</div>
          <span className="text-sm text-slate-400">Jolsel Firm · Alitiora Initiative</span>
        </div>
        <div className="flex gap-6 text-sm text-slate-500">
          <a href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent" className="hover:text-solana-green transition" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://github.com/Alitiora-Initiative" className="hover:text-solana-green transition" target="_blank" rel="noopener noreferrer">Organization</a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-slate-600">Not financial advice. Trading involves risk of loss. Agents are experimental.</p>
    </footer>
  );
}
