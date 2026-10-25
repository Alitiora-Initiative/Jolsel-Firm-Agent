import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useFirm } from "@/lib/firm/store";
import { ConnectButton } from "@/components/ConnectButton";
import { isDevWallet } from "@/lib/chain/protocol";
import { useWallet } from "@/lib/chain/wallet";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/core", label: "Core" },
  { to: "/terminal", label: "Terminal" },
  { to: "/vault", label: "Vault" },
  { to: "/treasury", label: "Treasury" },
  { to: "/coin", label: "Coin" },
  { to: "/profile", label: "Profile" },
  { to: "/tech", label: "Tech" },
  { to: "/reviews", label: "Reviews" },
  { to: "/agents", label: "Desks" },
  { to: "/ledger", label: "Ledger" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const poll = useFirm((s) => s.poll);
  const status = useFirm((s) => s.status);
  const address = useWallet((s) => s.address);
  const coinLocked = !!address && !isDevWallet(address);

  useEffect(() => {
    void poll();
    const id = window.setInterval(() => void poll(), 12000);
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
        <Link to="/" className="flex shrink-0 items-center gap-2 no-underline">
          <span
            className="grid h-8 w-8 place-items-center rounded-full border border-[var(--color-cyan)]"
            style={{ boxShadow: "0 0 16px color-mix(in srgb, var(--color-cyan) 50%, transparent)" }}
          >
            <span className="h-3 w-3 rounded-full bg-[var(--color-cyan)]" />
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold tracking-[0.22em] text-[var(--color-ink)]">
              JOLSEL FIRM
            </span>
            <span className="label-kicker">Solana mainnet</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto">
          {NAV.map((item) => {
            const on = path === item.to;
            if (item.to === "/coin" && coinLocked) {
              return (
                <span
                  key={item.to}
                  className="cursor-not-allowed rounded-full px-3 py-1.5 text-sm text-[var(--color-muted)] opacity-50"
                  title="Coin desk is locked for this wallet"
                >
                  Coin
                </span>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                className="shrink-0 rounded-full px-3 py-1.5 text-sm no-underline"
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
        <div className="flex shrink-0 items-center gap-2">
          <span className="label-kicker hidden md:inline">
            <span
              className="mr-2 inline-block h-2 w-2 rounded-full"
              style={{
                background: status === "online" ? "var(--color-mint)" : "var(--color-amber)",
                boxShadow: "0 0 8px currentColor",
              }}
            />
            {status === "online" ? "LIVE" : status === "connecting" ? "LINK" : "DEGRADED"}
          </span>
          <ConnectButton />
        </div>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
