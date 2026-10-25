import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LAUNCH_MILESTONE_SOL, TREASURY_WALLET } from "@/lib/chain/protocol";
import type { ChainSnapshot } from "@/lib/chain/types";

export const Route = createFileRoute("/treasury")({ component: TreasuryPage });

const SAMPLE_KEY = "jolsel-treasury-samples-v1";

type Sample = { t: number; sol: number };

function readSamples(): Sample[] {
  try {
    const raw = localStorage.getItem(SAMPLE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Sample[]) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => Number.isFinite(s.sol) && Number.isFinite(s.t)) : [];
  } catch {
    return [];
  }
}

function TreasuryPage() {
  const [snap, setSnap] = useState<ChainSnapshot | null>(null);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setSamples(readSamples());
    let cancel = false;
    const load = async () => {
      try {
        const res = await fetch("/api/chain");
        const data = (await res.json()) as ChainSnapshot;
        if (cancel) return;
        if (data.error || !data.treasury) {
          setError(data.error || "Treasury read missing");
          return;
        }
        setError("");
        setSnap(data);
        setSamples((prev) => {
          const last = prev[prev.length - 1];
          const next =
            last && data.ts - last.t < 55_000 ? prev : [...prev, { t: data.ts, sol: data.treasury.sol }].slice(-180);
          localStorage.setItem(SAMPLE_KEY, JSON.stringify(next));
          return next;
        });
      } catch (err) {
        if (!cancel) setError(err instanceof Error ? err.message : "Read failed");
      }
    };
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, []);

  const sol = snap?.treasury.sol ?? 0;
  const pct = Math.min(100, (sol / LAUNCH_MILESTONE_SOL) * 100);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="label-kicker">Treasury · no cap on the account</p>
      <h1 className="mt-2 text-4xl font-semibold">Mainnet treasury</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        Address {TREASURY_WALLET}. The number is the live SOL balance from mainnet, not a fee
        simulator. There is no separate fee ledger yet, so this chart cannot honestly show “fees
        collected”. It shows samples of that balance taken while this browser is open.
      </p>

      <section className="hud mt-6 p-5">
        <p className="font-mono text-4xl">{snap ? sol.toFixed(4) : "…"} SOL</p>
        <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
          {snap?.solPriceUsd != null && snap ? `$${(sol * snap.solPriceUsd).toFixed(2)}` : "price pending"}
          {" · "}
          milestone {LAUNCH_MILESTONE_SOL.toLocaleString()} SOL · {pct.toFixed(2)}%
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div className="h-full bg-[var(--color-cyan)]" style={{ width: `${pct}%` }} />
        </div>
        {error && <p className="mt-3 text-sm text-[var(--color-rose)]">{error}</p>}
        <div className="mt-4 h-56">
          {samples.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={samples.map((s) => ({ ...s, label: new Date(s.t).toLocaleTimeString() }))}>
                <CartesianGrid stroke="#1c3148" />
                <XAxis dataKey="label" hide />
                <YAxis stroke="#7f93ab" tick={{ fontSize: 11 }} domain={[0, Math.max(LAUNCH_MILESTONE_SOL, sol * 1.2)]} width={48} />
                <Tooltip
                  contentStyle={{ background: "#07111f", border: "1px solid #1c3148", fontSize: 12 }}
                  formatter={(v) => [`${Number(v ?? 0).toFixed(4)} SOL`, "Balance"]}
                />
                <ReferenceLine y={LAUNCH_MILESTONE_SOL} stroke="#ffb020" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="sol" stroke="#3ee0ff" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-muted)]">
              One live sample so far. The line appears after the next read. Nothing is backfilled.
            </p>
          )}
        </div>
      </section>

      <section className="hud mt-3 p-5">
        <h2 className="text-lg font-semibold">Recent signatures on this address</h2>
        <ul className="mt-3 space-y-2">
          {(snap?.signatures ?? []).map((s) => (
            <li key={s.signature} className="font-mono text-xs">
              <a
                className="text-[var(--color-cyan)]"
                href={`https://solscan.io/tx/${s.signature}`}
                target="_blank"
                rel="noreferrer"
              >
                {s.signature.slice(0, 10)}…{s.signature.slice(-6)}
              </a>
              <span className="ml-2 text-[var(--color-muted)]">
                {s.blockTime ? new Date(s.blockTime * 1000).toLocaleString() : "time pending"}
                {s.err ? " · failed" : ""}
              </span>
            </li>
          ))}
          {snap && !snap.signatures.length && (
            <li className="text-sm text-[var(--color-muted)]">No signatures returned for this address.</li>
          )}
        </ul>
      </section>
    </main>
  );
}
