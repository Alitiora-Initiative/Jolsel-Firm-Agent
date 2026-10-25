import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEV_WALLET } from "@/lib/chain/protocol";

export const Route = createFileRoute("/tech")({ component: TechPage });

type Check = { name: string; role: string; state: "ok" | "down" | "wait"; detail: string };

const TEAM = [
  { name: "Website Manager", role: "Front door", path: "/" },
  { name: "Cybersecurity", role: "RPC and market route", path: "/api/chain" },
  { name: "Fullstack Engineer", role: "Tape route", path: "/api/market" },
  { name: "On-chain Engineer", role: "Treasury account", path: "/api/chain" },
  { name: "Review Clerk", role: "Public issue list", path: "github" },
] as const;

function TechPage() {
  const [checks, setChecks] = useState<Check[]>(
    TEAM.map((t) => ({ name: t.name, role: t.role, state: "wait", detail: "Reading…" })),
  );

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      const [home, chain, market, issues] = await Promise.all([
        fetch("/").then((r) => r.status).catch(() => 0),
        fetch("/api/chain").then(async (r) => ({ status: r.status, body: await r.json() })).catch(() => null),
        fetch("/api/market").then(async (r) => ({ status: r.status, body: await r.json() })).catch(() => null),
        fetch("https://api.github.com/repos/Alitiora-Initiative/Jolsel-Firm-Agent/issues?state=open&per_page=5")
          .then(async (r) => ({ status: r.status, body: r.ok ? await r.json() : [] }))
          .catch(() => null),
      ]);
      if (cancel) return;
      const chainBody = (chain && "body" in chain ? chain.body : null) as {
        error?: string;
        treasury?: { sol?: number };
      } | null;
      const marketBody = (market && "body" in market ? market.body : null) as {
        pairs?: unknown[];
      } | null;
      const pairs = marketBody?.pairs?.length ?? 0;
      const sol = chainBody?.treasury?.sol;
      const issueCount = Array.isArray(issues?.body) ? issues.body.length : null;
      setChecks([
        {
          name: TEAM[0].name,
          role: TEAM[0].role,
          state: home >= 200 && home < 400 ? "ok" : "down",
          detail: home ? `GET / returned ${home}.` : "GET / failed.",
        },
        {
          name: TEAM[1].name,
          role: TEAM[1].role,
          state: chain?.status === 200 && !chainBody?.error ? "ok" : "down",
          detail: chainBody?.error
            ? String(chainBody.error)
            : chain
              ? `Chain route ${chain.status}. This is a live read, not a guarantee against a breach.`
              : "Chain route failed.",
        },
        {
          name: TEAM[2].name,
          role: TEAM[2].role,
          state: market?.status === 200 ? "ok" : "down",
          detail: market ? `Market route ${market.status}. ${pairs} pairs on this read.` : "Market route failed.",
        },
        {
          name: TEAM[3].name,
          role: TEAM[3].role,
          state: typeof sol === "number" ? "ok" : "down",
          detail:
            typeof sol === "number"
              ? `Treasury balance read: ${sol.toFixed(4)} SOL. Vault program id: none deployed.`
              : "Treasury balance missing.",
        },
        {
          name: TEAM[4].name,
          role: TEAM[4].role,
          state: issueCount == null ? "down" : "ok",
          detail:
            issueCount == null
              ? "GitHub issue list was not readable from this browser."
              : `${issueCount} open issue(s) returned. The clerk does not invent a parliament vote.`,
        },
      ]);
    };
    void run();
    const id = window.setInterval(() => void run(), 20000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="label-kicker">Technical team · read only</p>
      <h1 className="mt-2 text-4xl font-semibold">Five desks, live checks</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        These five are not on the trading core. They do not sign, and they do not edit the site
        from here. Each line is the last HTTP or RPC result. Dev wallet on record: {DEV_WALLET}.
      </p>
      <ul className="mt-6 space-y-3">
        {checks.map((c) => (
          <li key={c.name} className="hud flex items-start justify-between gap-3 p-4">
            <div>
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <p className="label-kicker">{c.role}</p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{c.detail}</p>
            </div>
            <span
              className="font-mono text-xs"
              style={{
                color:
                  c.state === "ok" ? "var(--color-mint)" : c.state === "down" ? "var(--color-rose)" : "var(--color-amber)",
              }}
            >
              {c.state === "ok" ? "UP" : c.state === "down" ? "DOWN" : "WAIT"}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
