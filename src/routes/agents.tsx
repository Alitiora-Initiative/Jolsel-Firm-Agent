import { createFileRoute } from "@tanstack/react-router";
import { AGENTS, DEPT_COLOR } from "@/lib/firm/agents";
import { useFirm } from "@/lib/firm/store";
import { AgentIcon } from "@/components/gravity/icons";

export const Route = createFileRoute("/agents")({ component: AgentsPage });

function AgentsPage() {
  const pulses = useFirm((s) => s.pulses);
  const events = useFirm((s) => s.events);
  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-2xl font-semibold tracking-wide">Seventeen desks</h1>
      <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted)]">
        The same firm that orbits Jolsel Core. A desk glows when it spoke on the latest mainnet cycle.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {AGENTS.map((a, i) => {
          const hot = Date.now() - (pulses[a.id] ?? 0) < 8000;
          const last = events.find((e) => e.from === a.id);
          const color = DEPT_COLOR[a.dept];
          return (
            <li key={a.id} className="hud p-3">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-full border bg-[var(--color-void)]"
                  style={{ borderColor: color, color, boxShadow: hot ? `0 0 12px ${color}` : "none" }}
                >
                  <AgentIcon name={a.icon} />
                </span>
                <div>
                  <div className="text-sm font-semibold">
                    {i + 1}. {a.name}
                  </div>
                  <div className="label-kicker">{a.dept}</div>
                </div>
              </div>
              <p className="mt-2 text-sm">{a.role}</p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">{last?.message ?? "Silent this cycle."}</p>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
