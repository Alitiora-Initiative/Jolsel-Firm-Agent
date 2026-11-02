"use client";

import { useCallback, useEffect, useState } from "react";

type FirmResult = {
  asOf: number;
  scanned: number;
  source: string;
  candidates: Array<{
    symbol: string;
    score: number;
    direction: string;
    liquidityUsd: number;
    volumeH24Usd: number;
    changeH1: number | null;
    pairAgeMinutes: number | null;
    mint: string;
  }>;
  selected: { symbol: string; mint: string; score: number; direction: string } | null;
  safety: { status: string; warnings: string[] } | null;
  decision: {
    action: string;
    approved: boolean;
    vetoReason: string;
    positionSizeUsd: number;
    slippageBps: number;
    expectedMovePct: number;
    roundTripCostPct: number | null;
    priceImpactPct: number | null;
  } | null;
  events: Array<{ id: string; agent: string; message: string; level: string; at: number }>;
  limits: { note: string; socialSentiment: string };
};

const LEVEL: Record<string, string> = {
  success: "text-emerald-400",
  trade: "text-[#14F195]",
  warn: "text-amber-300",
  veto: "text-rose-400",
  info: "text-slate-400",
};

export function FirmConsole() {
  const [data, setData] = useState<FirmResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const run = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/firm/run", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Firm run failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run();
    const id = setInterval(run, 30_000);
    return () => clearInterval(id);
  }, [run]);

  const action = data?.decision?.action ?? "…";
  const actionColor =
    action === "BUY" ? "text-[#14F195]" : action === "VETO" ? "text-rose-400" : "text-amber-300";

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Live Firm Cycle</h2>
          <p className="mt-1 text-xs text-slate-400">
            {data ? `${data.source} · ${data.scanned} pairs scanned · ${new Date(data.asOf).toLocaleTimeString()}` : "Fetching live market and chain data…"}
          </p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/5 disabled:opacity-50"
        >
          {loading ? "Running…" : "Run now"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{error}</p>}

      {data && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Stat label="Decision" value={action} className={actionColor} />
            <Stat label="Selected" value={data.selected?.symbol ?? "none"} />
            <Stat label="Score" value={data.selected ? `${data.selected.score}/99` : "—"} />
            <Stat label="Safety" value={data.safety?.status ?? "not checked"} />
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/60 p-4 text-xs text-slate-400">
            <div>
              Expected move <span className="text-white">{data.decision?.expectedMovePct ?? 0}%</span> vs estimated round-trip cost{" "}
              <span className="text-white">{data.decision?.roundTripCostPct ?? "unknown"}%</span> · impact{" "}
              <span className="text-white">{data.decision?.priceImpactPct == null ? "no quote" : `${data.decision.priceImpactPct}%`}</span> · size{" "}
              <span className="text-white">${data.decision?.positionSizeUsd ?? 0}</span>
            </div>
            {data.decision?.vetoReason && <div className="mt-2 text-rose-300">Blocked: {data.decision.vetoReason}</div>}
            {data.safety?.warnings?.length ? <div className="mt-2 text-amber-300">Mint: {data.safety.warnings.join("; ")}</div> : null}
            <div className="mt-2 text-slate-500">{data.limits.socialSentiment}</div>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="pb-2">Token</th>
                  <th className="pb-2">Score</th>
                  <th className="pb-2">Bias</th>
                  <th className="pb-2">1h</th>
                  <th className="pb-2">Liquidity</th>
                  <th className="pb-2">24h Volume</th>
                  <th className="pb-2">Age</th>
                </tr>
              </thead>
              <tbody>
                {data.candidates.map((c) => (
                  <tr key={c.mint} className="border-t border-white/5 text-slate-300">
                    <td className="py-2 font-medium text-white">{c.symbol}</td>
                    <td className="py-2 font-mono">{c.score}</td>
                    <td className={`py-2 ${c.direction === "LONG" ? "text-emerald-400" : "text-rose-400"}`}>{c.direction}</td>
                    <td className={`py-2 font-mono ${(c.changeH1 ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {c.changeH1 == null ? "—" : `${c.changeH1.toFixed(2)}%`}
                    </td>
                    <td className="py-2 font-mono">${Math.round(c.liquidityUsd).toLocaleString("en-US")}</td>
                    <td className="py-2 font-mono">${Math.round(c.volumeH24Usd).toLocaleString("en-US")}</td>
                    <td className="py-2">{c.pairAgeMinutes == null ? "—" : `${c.pairAgeMinutes}m`}</td>
                  </tr>
                ))}
                {!data.candidates.length && (
                  <tr>
                    <td colSpan={7} className="py-4 text-slate-500">
                      No live pair cleared the liquidity and volume floors in this snapshot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 max-h-72 space-y-1 overflow-y-auto rounded-xl border border-white/5 bg-slate-950/60 p-3">
            {data.events.map((ev) => (
              <div key={ev.id} className="text-xs">
                <span className={`font-mono ${LEVEL[ev.level] ?? "text-slate-400"}`}>{ev.agent}</span>
                <span className="ml-2 text-slate-400">{ev.message}</span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-slate-500">{data.limits.note}</p>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-slate-950/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-1 font-mono text-sm font-semibold ${className ?? "text-white"}`}>{value}</div>
    </div>
  );
}
