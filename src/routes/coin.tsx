import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { useWallet } from "@/lib/chain/wallet";
import {
  AIRDROP_MIN_TRADES,
  ALLOCATION,
  DEV_SPEND_PLAN,
  DEV_WALLET,
  LAUNCH_MILESTONE_SOL,
  TOKEN_DESCRIPTION,
  TOKEN_NAME,
  TOKEN_SUPPLY,
  isDevWallet,
} from "@/lib/chain/protocol";
import type { ChainSnapshot } from "@/lib/chain/types";

export const Route = createFileRoute("/coin")({ component: CoinPage });

const MINT_KEY = "jolsel-verified-mint";

function CoinPage() {
  const address = useWallet((s) => s.address);
  const dev = isDevWallet(address);
  const [snap, setSnap] = useState<ChainSnapshot | null>(null);
  const [draft, setDraft] = useState("");
  const [mint, setMint] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(MINT_KEY);
    if (saved) setMint(saved);
  }, []);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const res = await fetch("/api/chain");
      const data = (await res.json()) as ChainSnapshot;
      if (!cancel) setSnap(data);
    };
    void load();
    const id = window.setInterval(() => void load(), 25000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, []);

  const verify = async () => {
    setNote("");
    const candidate = draft.trim();
    const res = await fetch(`/api/chain?mint=${encodeURIComponent(candidate)}`);
    const data = (await res.json()) as ChainSnapshot;
    if (!data.mint?.exists) {
      setNote("Mainnet has no mint account at that address. Not saved.");
      return;
    }
    localStorage.setItem(MINT_KEY, candidate);
    setMint(candidate);
    setNote(
      `Mint exists. Decimals ${data.mint.decimals}. Raw supply ${data.mint.supply}. Saved in this browser only — other people stay locked until the mint is shipped in the deployment.`,
    );
  };

  if (!dev) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="label-kicker">Coin</p>
        <h1 className="mt-3 text-4xl font-semibold">Locked</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          {TOKEN_NAME} opens for everyone only after a verified mainnet mint is published. Until
          then this page stays shut. The launch desk is visible solely to {DEV_WALLET.slice(0, 4)}…
          {DEV_WALLET.slice(-4)}.
        </p>
        <div className="mt-6 flex justify-center">
          <ConnectButton />
        </div>
        {address && (
          <p className="mt-4 text-sm text-[var(--color-rose)]">This wallet is not the dev wallet. Controls stay off.</p>
        )}
      </main>
    );
  }

  const sol = snap?.treasury.sol ?? 0;
  const milestone = sol >= LAUNCH_MILESTONE_SOL;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <p className="label-kicker">Dev launch desk · {TOKEN_NAME}</p>
      <h1 className="mt-2 text-4xl font-semibold">Not minted</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">{TOKEN_DESCRIPTION}</p>
      <p className="mt-2 font-mono text-xs text-[var(--color-amber)]">
        Planned supply {TOKEN_SUPPLY.toLocaleString()}. Treasury on mainnet: {snap ? `${sol.toFixed(4)} SOL` : "…"}.
        Milestone {LAUNCH_MILESTONE_SOL.toLocaleString()} SOL is {milestone ? "met" : "not met"}.
      </p>

      <section className="mt-6 grid gap-3 md:grid-cols-2">
        {ALLOCATION.map((row) => (
          <article key={row.bucket} className="hud p-4">
            <h2 className="text-lg font-semibold">{row.bucket}</h2>
            <p className="font-mono text-sm">{row.amount.toLocaleString()}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{row.note}</p>
          </article>
        ))}
      </section>

      {milestone ? (
        <section className="hud mt-3 p-5">
          <h2 className="text-lg font-semibold">How to use the 600 SOL</h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Half of the 1,000 SOL milestone is 500 SOL. The plan adds 100 SOL for the pool, 600 SOL
            in total. Nothing here has been transferred. Sign each step yourself.
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            {DEV_SPEND_PLAN.map((row) => (
              <li key={row.sol}>
                <span className="font-mono text-[var(--color-cyan)]">{row.sol} SOL.</span> {row.use}
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          The 600 SOL spending guide stays hidden until this treasury address actually holds{" "}
          {LAUNCH_MILESTONE_SOL.toLocaleString()} SOL.
        </p>
      )}

      <section className="hud mt-3 p-5">
        <h2 className="text-lg font-semibold">Paste a mint</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Checked with getAccountInfo. A string that is not a mint is rejected.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Mint address"
            className="min-w-0 flex-1 rounded-lg border border-[var(--color-line)] bg-transparent px-3 py-2 font-mono text-xs"
          />
          <button type="button" onClick={() => void verify()} className="rounded-full bg-[var(--color-cyan)] px-4 py-2 text-sm font-semibold text-[var(--color-void)]">
            Verify on mainnet
          </button>
        </div>
        {note && <p className="mt-2 text-sm">{note}</p>}
      </section>

      {mint && (
        <section className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="hud overflow-hidden">
            <iframe
              title="DexScreener"
              src={`https://dexscreener.com/solana/${mint}?embed=1&theme=dark&trades=0&info=0`}
              className="h-[480px] w-full border-0"
            />
          </div>
          <aside className="hud p-4">
            <h2 className="text-lg font-semibold">Swap</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Jupiter hosts the signer. This site does not take the swap.
            </p>
            <a
              className="mt-4 inline-block rounded-full bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-[var(--color-void)] no-underline"
              href={`https://jup.ag/swap/SOL-${mint}`}
              target="_blank"
              rel="noreferrer"
            >
              Open Jupiter
            </a>
            <button type="button" disabled className="mt-3 block rounded-full border border-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]">
              Enroll airdrop
            </button>
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Enrollment needs a vault account and at least {AIRDROP_MIN_TRADES} firm trades recorded
              on-chain. Neither counter exists, so the button stays off even for the dev wallet.
            </p>
          </aside>
        </section>
      )}
    </main>
  );
}
