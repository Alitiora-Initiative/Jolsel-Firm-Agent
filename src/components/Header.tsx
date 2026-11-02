export function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-solana-green to-solana-purple font-bold text-slate-950">
            JF
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Jolsel Firm
          </span>
        </a>
        <nav className="flex items-center gap-2 overflow-x-auto text-sm text-slate-300 sm:gap-4">
          <a href="/core" className="hidden whitespace-nowrap hover:text-solana-green transition sm:inline">Core</a>
          <a href="/whitepaper" className="hidden whitespace-nowrap hover:text-solana-green transition sm:inline">Whitepaper</a>
          <a href="#departments" className="hidden whitespace-nowrap hover:text-solana-green transition md:inline">Agents</a>
          <a href="#pipeline" className="hidden whitespace-nowrap hover:text-solana-green transition lg:inline">Pipeline</a>
          <a href="/dashboard" className="whitespace-nowrap rounded-full bg-gradient-to-r from-solana-green to-emerald-400 px-4 py-1.5 font-semibold text-slate-950 hover:opacity-90 transition">
            Terminal
          </a>
          <a
            href="https://github.com/Alitiora-Initiative/Jolsel-Firm-Agent"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden whitespace-nowrap rounded-full bg-white/10 px-4 py-1.5 text-white hover:bg-white/20 transition md:inline"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
