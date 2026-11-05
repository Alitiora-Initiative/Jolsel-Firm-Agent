"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getSplHoldings, formatTokenAmount, USDC_MINT, type SplHolding } from "@/lib/spl";
import { loadPositions, type Position } from "@/lib/positions";
import { formatPct, formatUsd } from "@/lib/dexscreener";
import { WalletConnectButton } from "@/components/dashboard/WalletConnectButton";

type TokenMeta = {
  mint: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  pairAddress: string;
  liquidityUsd: number;
  changeH24: number | null;
};

type Fill = {
  key: string;
  at: number;
  kind: "BUY" | "SELL";
  symbol: string;
  amount: number;
  usd: number;
  sig?: string;
};

function short(mint: string) {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export default function TreasuryPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = publicKey?.toBase58() ?? "";

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [solUsd, setSolUsd] = useState<number | null>(null);
  const [holdings, setHoldings] = useState<SplHolding[]>([]);
  const [prices, setPrices] = useState<Record<string, TokenMeta>>({});
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setSolBalance(null);
      setHoldings([]);
      setPositions([]);
      setPrices({});
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    const local = loadPositions(wallet);
    setPositions(local);

    const [balanceRes, holdingsRes, solRes] = await Promise.allSettled([
      connection.getBalance(publicKey),
      getSplHoldings(connection, publicKey),
      fetch("/api/price/sol", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)),
    ]);

    if (balanceRes.status === "fulfilled") {
      setSolBalance(balanceRes.value / 1e9);
    }
    const held = holdingsRes.status === "fulfilled" ? holdingsRes.value : [];
    setHoldings(held);

    if (solRes.status === "fulfilled" && solRes.value?.usd) {
      setSolUsd(Number(solRes.value.usd));
    }

    const open = local.filter((p) => p.status === "open");
    const mints = Array.from(
      new Set([...held.map((h) => h.mint), ...open.map((p) => p.mint), USDC_MINT])
    );

    if (mints.length) {
      try {
        const res = await fetch(`/api/dex/tokens?mints=${encodeURIComponent(mints.join(","))}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setPrices(data.tokens || {});
        } else {
          setError("Token price feed unavailable; values show as unpriced.");
        }
      } catch {
        setError("Token price feed unavailable; values show as unpriced.");
      }
    }

    if (balanceRes.status === "rejected" || holdingsRes.status === "rejected") {
      setError("Solana RPC unavailable; balances may be stale.");
    }

    setUpdatedAt(Date.now());
    setLoading(false);
  }, [connection, publicKey, wallet]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 15_000);
    return () => clearInterval(id);
  }, [refresh]);

  const openPositions = useMemo(() => positions.filter((p) => p.status === "open"), [positions]);
  const closedPositions = useMemo(() => positions.filter((p) => p.status === "closed"), [positions]);

  const holdingRows = useMemo(() => {
    const rows = holdings.map((h) => {
      const meta = prices[h.mint];
      const price = meta?.priceUsd ?? (h.mint === USDC_MINT ? 1 : null);
      return {
        mint: h.mint,
        symbol: meta?.symbol ?? short(h.mint),
        amount: h.uiAmount,
        decimals: h.decimals,
        price,
        value: price != null ? h.uiAmount * price : null,
        change: meta?.changeH24 ?? null,
        isToken2022: h.isToken2022,
      };
    });
    return rows.sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  }, [holdings, prices]);

  const solValue = solBalance != null && solUsd != null ? solBalance * solUsd : null;
  const tokenValue = holdingRows.reduce((s, r) => s + (r.value ?? 0), 0);
  const totalValue = (solValue ?? 0) + tokenValue;
  const unpriced = holdingRows.filter((r) => r.value == null).length;

  const realizedPnl = closedPositions.reduce((s, p) => s + (p.realizedPnlUsd ?? 0), 0);
  const openCost = openPositions.reduce((s, p) => s + p.costUsd, 0);
  const openValue = openPositions.reduce((s, p) => {
    const mark = prices[p.mint]?.priceUsd;
    return s + (mark != null ? p.amountTokens * mark : 0);
  }, 0);
  const openPnl = openValue - openCost;

  const allocation = useMemo(() => {
    const rows: Array<{ name: string; value: number }> = [];
    if (solValue != null && solValue > 0) rows.push({ name: "SOL", value: solValue });
    for (const row of holdingRows) {
      if (row.value != null && row.value > 0) rows.push({ name: row.symbol, value: row.value });
    }
    const sum = rows.reduce((s, r) => s + r.value, 0);
    return rows
      .map((r) => ({ ...r, pct: sum > 0 ? (r.value / sum) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [holdingRows, solValue]);

  const fills = useMemo<Fill[]>(() => {
    const out: Fill[] = [];
    for (const p of positions) {
      out.push({
        key: `${p.id}-buy`,
        at: p.openedAt,
        kind: "BUY",
        symbol: p.symbol,
        amount: p.amountTokens,
        usd: p.costUsd,
        sig: p.txSig,
      });
      if (p.status === "closed" && p.closedAt) {
        out.push({
          key: `${p.id}-sell`,
          at: p.closedAt,
          kind: "SELL",
          symbol: p.symbol,
          amount: p.amountTokens,
          usd: p.costUsd + (p.realizedPnlUsd ?? 0),
          sig: p.txSig,
        });
      }
    }
    return out.sort((a, b) => b.at - a.at).slice(0, 10);
  }, [positions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#14F195] to-[#9945FF] text-xs font-bold text-slate-950"
            >
              JF
            </a>
            <div>
              <div className="text-sm font-semibold">Jolsel Firm Treasury</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                Connected wallet · live marks
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              Terminal
            </a>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-6">
        {!wallet && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Connect a wallet to read its real SOL and SPL / Token-2022 balances and live USD marks.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Wallet value</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">
              {solUsd == null && solBalance != null
                ? "Unpriced"
                : formatUsd(totalValue)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : "Waiting for live feeds"}
              {unpriced > 0 ? ` · ${unpriced} token${unpriced === 1 ? "" : "s"} unpriced` : ""}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">SOL balance</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">
              {solBalance == null ? "—" : `${solBalance.toFixed(4)} SOL`}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              {solUsd == null ? "Live SOL/USD unavailable" : `${formatUsd(solUsd)} per SOL`}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Open positions</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">{openPositions.length}</div>
            <div className="mt-1 text-xs text-slate-400">
              Cost {formatUsd(openCost)} · Mark {formatUsd(openValue)}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Recorded PnL</div>
            <div
              className={`mt-2 text-3xl font-bold font-mono ${
                realizedPnl + openPnl >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatUsd(realizedPnl + openPnl)}
            </div>
            <div className="mt-1 text-xs text-slate-400">
              Realized {formatUsd(realizedPnl)} · Open {formatUsd(openPnl)}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Holdings</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">
                    SOL
                  </span>
                  <div>
                    <div className="text-sm font-medium">Solana</div>
                    <div className="text-[10px] text-slate-500">
                      {solBalance == null ? "No balance" : `${solBalance.toFixed(6)} SOL`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">{solValue == null ? "—" : formatUsd(solValue)}</div>
                  <div className="text-[10px] text-slate-500">native</div>
                </div>
              </div>

              {holdingRows.map((row) => (
                <div
                  key={row.mint}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-slate-300">
                      {row.symbol.slice(0, 3)}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {row.symbol}
                        {row.isToken2022 && <span className="ml-1 text-[10px] text-violet-300">T22</span>}
                      </div>
                      <div className="truncate text-[10px] text-slate-500">
                        {formatTokenAmount(row.amount, row.decimals)} · {short(row.mint)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{row.value == null ? "unpriced" : formatUsd(row.value)}</div>
                    <div
                      className={`text-[10px] ${
                        row.change == null ? "text-slate-500" : row.change >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {row.change == null ? "no 24h mark" : `${formatPct(row.change)} 24h`}
                    </div>
                  </div>
                </div>
              ))}

              {wallet && !holdings.length && (
                <div className="rounded-lg border border-white/5 px-4 py-6 text-center text-sm text-slate-500">
                  No SPL or Token-2022 balances in this wallet.
                </div>
              )}
              {!wallet && (
                <div className="rounded-lg border border-white/5 px-4 py-6 text-center text-sm text-slate-500">
                  Connect a wallet to load holdings.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Recorded fills</h2>
            <div className="space-y-2">
              {fills.map((fill) => (
                <div
                  key={fill.key}
                  className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-1 text-[10px] font-bold ${
                        fill.kind === "BUY"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {fill.kind}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{fill.symbol}</div>
                      <div className="text-[10px] text-slate-500">
                        {formatTokenAmount(fill.amount)} tokens · {new Date(fill.at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{formatUsd(fill.usd)}</div>
                    {fill.sig && (
                      <a
                        href={`https://solscan.io/tx/${fill.sig}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-slate-500 hover:text-slate-300"
                      >
                        {fill.sig.slice(0, 8)}…
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {!fills.length && (
                <div className="rounded-lg border border-white/5 px-4 py-6 text-center text-sm text-slate-500">
                  No fills recorded yet. Trades executed from the Terminal are stored in this browser.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold">Wallet allocation</h2>
          {allocation.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {allocation.map((alloc, i) => (
                <div key={`${alloc.name}-${i}`} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{alloc.name}</span>
                    <span className="font-mono">{alloc.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${alloc.pct}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">{formatUsd(alloc.value)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No priced balances to allocate yet. Connect a funded wallet or wait for the live price feed.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Values are computed from the connected wallet&apos;s on-chain balances and live Jupiter /
          DexScreener marks. Fills and cost basis are stored locally in this browser by the Terminal.
          The on-chain vault program under <code className="text-slate-400">programs/jolsel-vault</code> is
          not deployed by this dashboard; this page never signs or moves funds.
        </p>
      </div>
    </div>
  );
}
