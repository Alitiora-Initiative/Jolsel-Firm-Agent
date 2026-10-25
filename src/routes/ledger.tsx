import { createFileRoute } from "@tanstack/react-router";
import { useFirm } from "@/lib/firm/store";
import { price } from "@/components/gravity/Panels";

export const Route = createFileRoute("/ledger")({ component: Ledger });

function Ledger() {
  const mandates = useFirm((s) => s.mandates);
  const cycle = useFirm((s) => s.cycle);
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-semibold tracking-wide">Mandate ledger</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Cycle #{cycle || "—"}. Long means the desks cleared the public tape. It is not a fill.
      </p>
      <div className="hud mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="label-kicker">
            <tr>
              <th className="px-3 py-2 font-medium">Call</th>
              <th className="px-3 py-2 font-medium">Token</th>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">1h</th>
              <th className="px-3 py-2 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {mandates.map((m) => (
              <tr key={m.id} className="border-t border-[var(--color-line)]">
                <td className="px-3 py-2 font-mono text-xs">
                  <span className={m.side === "VETO" ? "text-[var(--color-rose)]" : "text-[var(--color-mint)]"}>
                    {m.side}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <a className="text-[var(--color-cyan)]" href={m.url} target="_blank" rel="noreferrer">
                    {m.symbol}
                  </a>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{m.score}</td>
                <td className="px-3 py-2 font-mono text-xs">{price(m.priceUsd)}</td>
                <td className="px-3 py-2 font-mono text-xs">
                  {m.changeH1 >= 0 ? "+" : ""}
                  {m.changeH1.toFixed(1)}%
                </td>
                <td className="px-3 py-2 text-xs text-[var(--color-muted)]">{m.reason}</td>
              </tr>
            ))}
            {!mandates.length && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-[var(--color-muted)]">
                  The ledger fills after the first live cycle.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
