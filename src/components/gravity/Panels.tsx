import { Link } from "@tanstack/react-router";
import { useFirm } from "@/lib/firm/store";
import { AGENTS } from "@/lib/firm/agents";

function money(n: number) {
  if (!n) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(2)}`;
}

function price(n: number) {
  if (!n) return "—";
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 1) return `$${n.toPrecision(3)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function StatusPanel() {
  const status = useFirm((s) => s.status);
  const cycle = useFirm((s) => s.cycle);
  const events = useFirm((s) => s.events);
  const mandates = useFirm((s) => s.mandates);
  const last = mandates[0];
  const error = useFirm((s) => s.error);
  return (
    <section className="hud p-3">
      <header className="mb-2 flex items-center justify-between">
        <span className="label-kicker">System status</span>
        <span className="font-mono text-xs text-[var(--color-mint)]">
          {status === "online" ? "ONLINE" : status === "connecting" ? "LINK" : "DEGRADED"}
        </span>
      </header>
      <dl className="grid grid-cols-2 gap-y-1 font-mono text-xs">
        <dt className="text-[var(--color-muted)]">Desks</dt>
        <dd className="text-right">{AGENTS.length}/{AGENTS.length}</dd>
        <dt className="text-[var(--color-muted)]">Cycle</dt>
        <dd className="text-right">#{cycle || "—"}</dd>
        <dt className="text-[var(--color-muted)]">Last call</dt>
        <dd className="text-right text-[var(--color-amber)]">{last ? last.side : "—"}</dd>
        <dt className="text-[var(--color-muted)]">Messages</dt>
        <dd className="text-right">{events.length}</dd>
        <dt className="text-[var(--color-muted)]">Fills</dt>
        <dd className="text-right text-[var(--color-cyan)]">0 unsigned</dd>
      </dl>
      {error && <p className="mt-2 text-xs text-[var(--color-rose)]">{error}</p>}
    </section>
  );
}

export function MarketPanel() {
  const pairs = useFirm((s) => s.pairs);
  return (
    <section className="hud p-3">
      <header className="mb-2 flex items-center justify-between">
        <span className="label-kicker">Solana tape</span>
        <span className="font-mono text-[0.65rem] text-[var(--color-mint)]">DEXSCREENER</span>
      </header>
      <ul className="space-y-1.5">
        {pairs.slice(0, 6).map((p) => (
          <li key={p.pairAddress} className="flex items-baseline justify-between gap-2 font-mono text-xs">
            <span className="truncate">{p.baseToken.symbol}</span>
            <span>{price(p.priceUsd)}</span>
            <span className={p.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]"}>
              {p.changeH1 >= 0 ? "+" : ""}
              {p.changeH1.toFixed(1)}%
            </span>
          </li>
        ))}
        {!pairs.length && <li className="text-xs text-[var(--color-muted)]">Waiting on mainnet pairs…</li>}
      </ul>
      <p className="label-kicker mt-3">Live market feed</p>
    </section>
  );
}

export function EventStream() {
  const events = useFirm((s) => s.events);
  return (
    <section className="hud flex max-h-[46vh] flex-col p-3 lg:max-h-[52vh]">
      <header className="mb-2 flex items-center justify-between">
        <span className="label-kicker">Live event stream</span>
        <span className="font-mono text-[0.65rem] text-[var(--color-mint)]">LIVE</span>
      </header>
      <ul className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
        {events.slice(0, 14).map((e) => (
          <li key={e.id} className="text-xs leading-snug">
            <span className="font-mono text-[var(--color-cyan)]">
              {e.from} → {e.to}
            </span>
            <p className="text-[var(--color-ink)]">{e.message}</p>
          </li>
        ))}
        {!events.length && <li className="text-xs text-[var(--color-muted)]">Desks quiet until the first tape.</li>}
      </ul>
    </section>
  );
}

export function Decisions() {
  const mandates = useFirm((s) => s.mandates);
  return (
    <section className="hud p-3">
      <header className="mb-2 flex items-center justify-between">
        <span className="label-kicker">Latest calls</span>
        <Link to="/ledger" className="text-xs text-[var(--color-cyan)] no-underline">
          Ledger
        </Link>
      </header>
      <ul className="space-y-1.5">
        {mandates.slice(0, 5).map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 font-mono text-xs">
            <span className={m.side === "VETO" ? "text-[var(--color-rose)]" : "text-[var(--color-mint)]"}>
              {m.side === "VETO" ? "VETO" : "LONG"}
            </span>
            <span className="truncate">{m.symbol}</span>
            <span className={m.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]"}>
              {m.changeH1 >= 0 ? "+" : ""}
              {m.changeH1.toFixed(1)}%
            </span>
          </li>
        ))}
        {!mandates.length && <li className="text-xs text-[var(--color-muted)]">No calls yet.</li>}
      </ul>
      <p className="mt-2 text-[0.65rem] leading-snug text-[var(--color-muted)]">
        Calls are reads of the public tape. Nothing is sent on-chain until you sign.
      </p>
    </section>
  );
}

export function ProbePanel() {
  const events = useFirm((s) => s.events);
  const head = events[0];
  return (
    <section className="hud p-3">
      <header className="label-kicker mb-1">Crawler probe</header>
      <p className="text-sm">{head ? `Visiting ${head.from}` : "Scanning desks…"}</p>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        {head ? head.message : "Collecting the next mainnet cycle."}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
        <div className="h-full w-2/3 animate-pulse bg-[var(--color-cyan)]" />
      </div>
    </section>
  );
}

export { money, price };
