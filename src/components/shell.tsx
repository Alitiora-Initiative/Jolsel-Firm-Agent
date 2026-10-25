import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFirm } from "@/lib/firm/store";

const NAV = [
  { to: "/", label: "Core" },
  { to: "/terminal", label: "Terminal" },
  { to: "/agents", label: "Desks" },
  { to: "/ledger", label: "Ledger" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const poll = useFirm((s) => s.poll);
  const status = useFirm((s) => s.status);

  useEffect(() => {
    void poll();
    const id = window.setInterval(() => void poll(), 14000);
    return () => window.clearInterval(id);
  }, [poll]);

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 50% 42%, color-mix(in srgb, var(--color-ember) 16%, transparent), transparent 60%), radial-gradient(700px 480px at 70% 30%, color-mix(in srgb, var(--color-violet) 14%, transparent), transparent 55%), var(--color-void)",
        }}
      />
      <header className="relative z-30 flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-3 py-2 sm:px-5">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-cyan)]"
            style={{ boxShadow: "0 0 16px color-mix(in srgb, var(--color-cyan) 50%, transparent)" }}
          >
            <span className="h-3 w-3 rounded-full bg-[var(--color-cyan)]" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.22em] text-[var(--color-ink)]">
              JOLSEL FIRM
            </span>
            <span className="label-kicker">Solana mainnet · 17 desks</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const on = path === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-3 py-1.5 text-sm no-underline"
                style={{
                  color: on ? "var(--color-void)" : "var(--color-ink)",
                  background: on ? "var(--color-cyan)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <span className="label-kicker hidden sm:inline">
          <span
            className="mr-2 inline-block h-2 w-2 rounded-full"
            style={{
              background: status === "online" ? "var(--color-mint)" : "var(--color-amber)",
              boxShadow: "0 0 8px currentColor",
            }}
          />
          {status === "online" ? "LIVE TAPE" : status === "connecting" ? "LINKING" : "DEGRADED"}
        </span>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
