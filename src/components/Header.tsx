export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple font-bold text-slate-950">
            JF
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Jolsel Firm
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a href="/dashboard" className="rounded-full bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-1.5 font-semibold text-slate-950 hover:opacity-90 transition">
            Terminal
          </a>
          <a href="#departments" className="hover:text-solana-green transition">Agents</a>
          <a href="#pipeline" className="hover:text-solana-green transition">Pipeline</a>
          <a href="#architecture" className="hover:text-solana-green transition">Architecture</a>
          <a
            href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/10 px-4 py-1.5 text-white hover:bg-white/20 transition"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
