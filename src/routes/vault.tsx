import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/chain/wallet";
import {
  AIRDROP_MIN_TRADES,
  INTEREST_MIN_USD,
  INTEREST_YEARLY_SOL,
  LAUNCH_MILESTONE_SOL,
  PROFIT_TREASURY_BPS,
  VAULT_CAP_SOL,
  VAULT_LAUNCH_FEE_USD,
  VAULT_OPEN_FEE_USD,
  interestRule,
} from "@/lib/chain/protocol";
import type { ChainSnapshot } from "@/lib/chain/types";

export const Route = createFileRoute("/vault")({ component: VaultPage });

function VaultPage() {
  const address = useWallet((s) => s.address);
  const [snap, setSnap] = useState<ChainSnapshot | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const q = address ? `?wallet=${address}` : "";
      const res = await fetch(`/api/chain${q}`);
      const data = (await res.json()) as ChainSnapshot;
      if (!cancel) setSnap(data);
    };
    void load();
    const id = window.setInterval(() => void load(), 20000);
    return () => {
      cancel = true;
      window.clearInterval(id);
    };
  }, [address]);

  const price = snap?.solPriceUsd ?? null;
  const feeSol = price ? VAULT_OPEN_FEE_USD / price : null;
  const rule = snap ? interestRule(snap.treasury.sol) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="label-kicker">Vault · mainnet</p>
      <h1 className="mt-2 text-4xl font-semibold">Jolsel vault</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
        The written vault takes a deposit into a program account, issues that wallet a vault slot,
        and lets the firm propose trades against the deposited balance. You would still sign.
        Profits would return to the same account. Ten percent of each realized profit would be
        marked for the treasury. Rent from closed trade accounts would return to the vault, not
        to the firm.
      </p>

      <section className="hud mt-6 p-5">
        <h2 className="text-lg font-semibold">Deposit is off</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          There is no deployed program id. This button cannot move SOL. Sending the open fee to
          a personal wallet and calling it a vault would be false, so that transfer is not built.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 rounded-full bg-[var(--color-line)] px-4 py-2 text-sm text-[var(--color-muted)]"
        >
          Create vault slot
        </button>
        <dl className="mt-5 grid grid-cols-2 gap-y-2 font-mono text-xs">
          <dt className="text-[var(--color-muted)]">Capacity cap</dt>
          <dd className="text-right">{VAULT_CAP_SOL.toLocaleString()} SOL</dd>
          <dt className="text-[var(--color-muted)]">Open fee (written)</dt>
          <dd className="text-right">
            ${VAULT_OPEN_FEE_USD.toFixed(2)}
            {feeSol != null ? ` · ${feeSol.toFixed(6)} SOL` : ""}
          </dd>
          <dt className="text-[var(--color-muted)]">Fee at launch (written)</dt>
          <dd className="text-right">${VAULT_LAUNCH_FEE_USD.toFixed(2)}</dd>
          <dt className="text-[var(--color-muted)]">Your SOL</dt>
          <dd className="text-right">{address && snap?.wallet ? snap.wallet.sol.toFixed(4) : "connect wallet"}</dd>
          <dt className="text-[var(--color-muted)]">Pool filled</dt>
          <dd className="text-right">0 — no program accounts</dd>
          <dt className="text-[var(--color-muted)]">Profit to treasury</dt>
          <dd className="text-right">{PROFIT_TREASURY_BPS / 100}%</dd>
        </dl>
      </section>

      <section className="hud mt-3 p-5">
        <h2 className="text-lg font-semibold">Jolsel Interest Pay</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Separate from the JOLSEL FIRM coin. The rule sets aside {INTEREST_YEARLY_SOL} SOL from
          treasury once a year, buys stables or tokenized assets on the open market, and pays a
          randomized weekly amount only to vaults that have held at least ${INTEREST_MIN_USD} for
          seven days. Drop under ${INTEREST_MIN_USD} and that vault id goes on a red list until
          the baseline is held again for a week. The yearly {INTEREST_YEARLY_SOL} SOL is the whole
          budget so it is not spent before the year ends. If treasury is at or under 200 SOL the
          program closes. It stays closed until treasury is back above 400 SOL.
        </p>
        <p className="mt-3 font-mono text-xs text-[var(--color-amber)]">
          {snap && rule
            ? `Live treasury ${snap.treasury.sol.toFixed(4)} SOL. ${rule.label}. ${rule.detail}`
            : "Reading treasury…"}
        </p>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          No interest account exists, so nobody is paid and nobody is red-listed. Airdrop
          enrollment (vault plus {AIRDROP_MIN_TRADES} firm trades) is on the coin page and is also
          off until a mint and a trade counter exist. Launch milestone for the coin is{" "}
          {LAUNCH_MILESTONE_SOL.toLocaleString()} SOL in treasury.{" "}
          <Link to="/treasury" className="text-[var(--color-cyan)]">
            Treasury chart
          </Link>
        </p>
      </section>
    </main>
  );
}
