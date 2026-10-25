import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConnectButton, shortAddr } from "@/components/ConnectButton";
import { useWallet } from "@/lib/chain/wallet";
import { isDevWallet } from "@/lib/chain/protocol";
import type { ChainSnapshot } from "@/lib/chain/types";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

function ProfilePage() {
  const address = useWallet((s) => s.address);
  const [snap, setSnap] = useState<ChainSnapshot | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!address) {
      setSnap(null);
      return;
    }
    let cancel = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/chain?wallet=${address}`);
        const data = (await res.json()) as ChainSnapshot;
        if (cancel) return;
        if (data.error) setError(data.error);
        else setError("");
        setSnap(data);
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
  }, [address]);

  const solUsd =
    snap?.wallet && snap.solPriceUsd != null ? snap.wallet.sol * snap.solPriceUsd : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="label-kicker">Profile · mainnet read</p>
      <h1 className="mt-2 text-4xl font-semibold">Your wallet</h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
        Balances come from a Solana mainnet RPC. Token prices that are not SOL are omitted — this
        page will not invent a dollar value for a memecoin it did not price.
      </p>

      <section className="hud mt-6 p-5">
        {!address && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-[var(--color-muted)]">Connect Phantom or Solflare to read this wallet.</p>
            <ConnectButton />
          </div>
        )}
        {address && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="label-kicker">{isDevWallet(address) ? "Dev wallet" : "Connected"}</p>
                <p className="mt-1 font-mono text-sm">{shortAddr(address)}</p>
                <p className="mt-4 font-mono text-4xl">
                  {snap?.wallet ? snap.wallet.sol.toFixed(4) : "…"} SOL
                </p>
                <p className="mt-1 font-mono text-sm text-[var(--color-muted)]">
                  {solUsd != null ? `$${solUsd.toFixed(2)} at $${snap?.solPriceUsd?.toFixed(2)} SOL` : "SOL price pending"}
                </p>
              </div>
              <ConnectButton />
            </div>
            {error && <p className="mt-3 text-sm text-[var(--color-rose)]">{error}</p>}
            <h2 className="label-kicker mt-8">SPL and Token-2022 accounts with a non-zero balance</h2>
            <ul className="mt-3 divide-y divide-[var(--color-line)]">
              {(snap?.wallet?.tokens ?? []).map((t) => (
                <li key={t.mint} className="flex items-center justify-between gap-3 py-2">
                  <span className="font-mono text-xs text-[var(--color-muted)]">{shortAddr(t.mint)}</span>
                  <span className="font-mono text-sm">{t.ui.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </li>
              ))}
              {snap && !snap.wallet?.tokens.length && (
                <li className="py-3 text-sm text-[var(--color-muted)]">No non-zero token accounts on this read.</li>
              )}
            </ul>
            <div className="mt-6 rounded-lg border border-[var(--color-line)] p-3 text-sm text-[var(--color-muted)]">
              Vault holdings: no Jolsel vault program is deployed, so this wallet has no vault
              account to show. A zero here is the chain, not a hidden balance.
            </div>
          </>
        )}
      </section>
    </main>
  );
}
