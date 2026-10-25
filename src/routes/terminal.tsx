import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFirm } from "@/lib/firm/store";
import { price } from "@/components/gravity/Panels";

export const Route = createFileRoute("/terminal")({ component: Terminal });

type Quote = {
  inAmount?: string;
  outAmount?: string;
  priceImpactPct?: string;
  labels?: string[];
  input?: string;
  error?: string;
};

function Terminal() {
  const pairs = useFirm((s) => s.pairs);
  const selected = useFirm((s) => s.selected);
  const [mint, setMint] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const active =
    pairs.find((p) => p.baseToken.address === mint) || selected || pairs[0] || null;

  const loadQuote = async () => {
    if (!active) return;
    setBusy(true);
    setQuote(null);
    try {
      const res = await fetch(`/api/quote?mint=${encodeURIComponent(active.baseToken.address)}`);
      const data = (await res.json()) as Quote;
      setQuote(data);
    } catch (err) {
      setQuote({ error: err instanceof Error ? err.message : "Quote failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid gap-3 p-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-4">
      <section className="hud max-h-[70vh] overflow-auto p-2">
        <header className="label-kicker px-2 py-2">Boosted Solana pairs</header>
        <ul>
          {pairs.map((p) => {
            const on = active?.pairAddress === p.pairAddress;
            return (
              <li key={p.pairAddress}>
                <button
                  type="button"
                  onClick={() => {
                    setMint(p.baseToken.address);
                    setQuote(null);
                  }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left"
                  style={{ background: on ? "color-mix(in srgb, var(--color-cyan) 12%, transparent)" : "transparent" }}
                >
                  <span>
                    <span className="block text-sm font-semibold">{p.baseToken.symbol}</span>
                    <span className="font-mono text-[0.65rem] text-[var(--color-muted)]">{p.dexId}</span>
                  </span>
                  <span className="text-right font-mono text-xs">
                    <span className="block">{price(p.priceUsd)}</span>
                    <span className={p.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]"}>
                      {p.changeH1 >= 0 ? "+" : ""}
                      {p.changeH1.toFixed(1)}%
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
          {!pairs.length && <li className="px-2 py-4 text-sm text-[var(--color-muted)]">Tape loading…</li>}
        </ul>
      </section>
      <section className="flex flex-col gap-3">
        <div className="hud overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <div>
              <h1 className="text-lg font-semibold">
                {active ? `${active.baseToken.symbol} / ${active.quoteToken.symbol}` : "Terminal"}
              </h1>
              <p className="font-mono text-xs text-[var(--color-muted)]">
                {active ? active.baseToken.address : "Pick a pair"}
              </p>
            </div>
            {active && (
              <a
                className="text-sm text-[var(--color-cyan)]"
                href={active.url}
                target="_blank"
                rel="noreferrer"
              >
                DexScreener
              </a>
            )}
          </div>
          <div className="h-[420px] bg-black">
            {active ? (
              <iframe
                title="DexScreener chart"
                className="h-full w-full border-0"
                src={`https://dexscreener.com/solana/${active.pairAddress}?embed=1&theme=dark&trades=0&info=0`}
              />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[var(--color-muted)]">
                Chart appears when the tape arrives.
              </div>
            )}
          </div>
        </div>
        <div className="hud p-4">
          <h2 className="text-sm font-semibold">Mainnet quote · 0.05 SOL in</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Jupiter returns a real route. This desk does not hold keys and will not send the swap.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!active || busy}
              onClick={() => void loadQuote()}
              className="rounded-full bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-[var(--color-void)] disabled:opacity-40"
            >
              {busy ? "Quoting…" : "Fetch Jupiter quote"}
            </button>
            {active && (
              <a
                className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-ink)] no-underline"
                href={`https://jup.ag/swap/SOL-${active.baseToken.address}`}
                target="_blank"
                rel="noreferrer"
              >
                Sign on Jupiter
              </a>
            )}
          </div>
          {quote?.error && <p className="mt-3 text-sm text-[var(--color-rose)]">{quote.error}</p>}
          {quote?.outAmount && (
            <dl className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
              <dt className="text-[var(--color-muted)]">In</dt>
              <dd>{quote.input}</dd>
              <dt className="text-[var(--color-muted)]">Out (raw)</dt>
              <dd className="break-all">{quote.outAmount}</dd>
              <dt className="text-[var(--color-muted)]">Impact</dt>
              <dd>{quote.priceImpactPct ?? "—"}</dd>
              <dt className="text-[var(--color-muted)]">Venues</dt>
              <dd>{quote.labels?.join(" · ") || "—"}</dd>
            </dl>
          )}
        </div>
      </section>
    </main>
  );
}
