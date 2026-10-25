import { createFileRoute, Link } from "@tanstack/react-router";
import { useFirm } from "@/lib/firm/store";
import { price } from "@/components/gravity/Panels";

export const Route = createFileRoute("/")({ component: Home });

function money(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function Home() {
  const pairs = useFirm((s) => s.pairs);
  const events = useFirm((s) => s.events);
  const status = useFirm((s) => s.status);
  const board = [...pairs].sort((a, b) => b.changeH24 - a.changeH24).slice(0, 12);
  const feed = events.slice(0, 8);

  return (
    <main>
      <section className="mx-auto max-w-5xl px-4 py-14 sm:py-20">
        <p className="label-kicker">Solana mainnet · social desk, not a custodian</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
          Never miss the tape.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-[var(--color-muted)]">
          Jolsel Firm watches live Solana memecoins the way a desk does. Pick it up on the core,
          leave the route unsigned until you sign it on Jupiter. No invented fills.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/core"
            className="rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-semibold text-[var(--color-void)] no-underline"
          >
            Open the core
          </Link>
          <Link
            to="/terminal"
            className="rounded-full border border-[var(--color-line)] px-5 py-2.5 text-sm no-underline"
          >
            Live terminal
          </Link>
        </div>
        <p className="label-kicker mt-8">
          {status === "online" ? "Tape online" : status === "connecting" ? "Linking tape" : "Tape degraded"}
          {" · "}
          {pairs.length} Solana pairs on this read
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-4 pb-6 sm:grid-cols-3">
        {[
          ["Leaderboard", "Real 24h movers from the DexScreener tape. Not a fake trader ranking."],
          ["Feed", "Desk-to-desk messages from the last cycle on that same tape."],
          ["Your keys", "Connect a wallet to read your mainnet balances. The firm cannot sign for you."],
        ].map(([title, copy]) => (
          <article key={title} className="hud p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto grid max-w-5xl gap-3 px-4 pb-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
        <div className="hud overflow-hidden">
          <header className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold">Leaderboard</h2>
            <span className="label-kicker">24h change · live</span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="label-kicker">
                <tr>
                  <th className="px-4 py-2 font-normal">#</th>
                  <th className="px-2 py-2 font-normal">Token</th>
                  <th className="px-2 py-2 font-normal">Price</th>
                  <th className="px-2 py-2 font-normal">24h</th>
                  <th className="px-2 py-2 font-normal">1h</th>
                  <th className="px-2 py-2 font-normal">Liquidity</th>
                  <th className="px-4 py-2 font-normal">Vol</th>
                </tr>
              </thead>
              <tbody>
                {board.map((p, i) => (
                  <tr key={p.pairAddress} className="border-t border-[var(--color-line)]">
                    <td className="px-4 py-2 font-mono text-xs text-[var(--color-muted)]">{i + 1}</td>
                    <td className="px-2 py-2">
                      <a href={p.url} className="font-semibold no-underline" target="_blank" rel="noreferrer">
                        {p.baseToken.symbol}
                      </a>
                      <span className="ml-2 font-mono text-[0.65rem] text-[var(--color-muted)]">{p.dexId}</span>
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{price(p.priceUsd)}</td>
                    <td className={`px-2 py-2 font-mono text-xs ${p.changeH24 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]"}`}>
                      {p.changeH24 >= 0 ? "+" : ""}
                      {p.changeH24.toFixed(1)}%
                    </td>
                    <td className={`px-2 py-2 font-mono text-xs ${p.changeH1 >= 0 ? "text-[var(--color-mint)]" : "text-[var(--color-rose)]"}`}>
                      {p.changeH1 >= 0 ? "+" : ""}
                      {p.changeH1.toFixed(1)}%
                    </td>
                    <td className="px-2 py-2 font-mono text-xs">{money(p.liquidityUsd)}</td>
                    <td className="px-4 py-2 font-mono text-xs">{money(p.volumeH24)}</td>
                  </tr>
                ))}
                {!board.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-sm text-[var(--color-muted)]">
                      No pairs on this read. The board stays empty rather than filling in names.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="hud p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Feed</h2>
            <Link to="/core" className="label-kicker no-underline">
              Core
            </Link>
          </header>
          <ul className="space-y-3">
            {feed.map((e) => (
              <li key={e.id} className="border-b border-[var(--color-line)] pb-2 text-sm">
                <span className="font-mono text-[0.65rem] text-[var(--color-cyan)]">
                  {e.from} → {e.to}
                </span>
                <p className="mt-1 text-[var(--color-ink)]">{e.message}</p>
              </li>
            ))}
            {!feed.length && <li className="text-sm text-[var(--color-muted)]">Waiting for the first cycle.</li>}
          </ul>
        </div>
      </section>
    </main>
  );
}
