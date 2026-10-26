"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { type DexPair, formatUsd, formatPct } from "@/lib/dexscreener";
import { SOL } from "@/lib/jupiter";
import { type Position, loadPositions, savePositions, unrealizedPnl } from "@/lib/positions";
import {
  getTokenDecimals,
  toRawAmount,
  fromRawAmount,
  formatTokenAmount,
  USDC_MINT,
} from "@/lib/spl";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { WalletConnectButton } from "@/components/dashboard/WalletConnectButton";
import { SplHoldings, useSplBalance } from "@/components/dashboard/SplHoldings";
import { Token2022Panel } from "@/components/dashboard/Token2022Panel";
import { loadRules, saveRules, toggleManagedMint, type UserRules } from "@/lib/profile";

type FirmEvent = { id: string; at: number; agent: string; message: string; level: "info" | "warn" | "success" | "trade" };
type TradeSide = "buy" | "sell";
type PayWith = "SOL" | "USDC";

export function Terminal() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();
  const wallet = publicKey?.toBase58() || "";

  const [pairs, setPairs] = useState<DexPair[]>([]);
  const [selected, setSelected] = useState<DexPair | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [buySol, setBuySol] = useState("0.05");
  const [sellPct, setSellPct] = useState(100);
  const [side, setSide] = useState<TradeSide>("buy");
  const [payWith, setPayWith] = useState<PayWith>("SOL");
  const [slippage, setSlippage] = useState(100);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [firmOn, setFirmOn] = useState(false);
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [tab, setTab] = useState<"live" | "positions" | "holdings" | "firm" | "manage">("live");
  const [tokenDecimals, setTokenDecimals] = useState(6);
  const [rules, setRules] = useState<UserRules | null>(null);

  const selectedMint = selected?.baseToken.address;
  const splBal = useSplBalance(selectedMint);

  const pushEvent = useCallback((agent: string, message: string, level: FirmEvent["level"] = "info") => {
    setEvents((e) => [{ id: `${Date.now()}-${Math.random()}`, at: Date.now(), agent, message, level }, ...e].slice(0, 80));
  }, []);

  const refreshMarket = useCallback(async () => {
    try {
      const res = await fetch("/api/dex/trending");
      const data = await res.json();
      const list: DexPair[] = data.pairs || [];
      setPairs(list);
      setSelected((s) => {
        if (!s) return list[0] || null;
        return list.find((p) => p.pairAddress === s.pairAddress) || s;
      });
    } catch (e: any) {
      pushEvent("System", `Market feed error: ${e.message}`, "warn");
    } finally {
      setLoading(false);
    }
  }, [pushEvent]);

  useEffect(() => {
    refreshMarket();
    const t = setInterval(refreshMarket, 5 * 60 * 1000); // every 5 mins
    return () => clearInterval(t);
  }, [refreshMarket]);

  useEffect(() => {
    if (!wallet) {
      setPositions([]);
      setSolBalance(null);
      return;
    }
    setPositions(loadPositions(wallet));
    setRules(loadRules(wallet));
    connection.getBalance(publicKey!).then((l) => setSolBalance(l / 1e9));
    const bal = setInterval(() => {
      connection.getBalance(publicKey!).then((l) => setSolBalance(l / 1e9));
    }, 15000);
    return () => clearInterval(bal);
  }, [wallet, connection, publicKey]);

  useEffect(() => {
    if (!selectedMint) return;
    getTokenDecimals(connection, selectedMint).then(setTokenDecimals);
  }, [connection, selectedMint]);

  useEffect(() => {
    if (!firmOn || !pairs.length) return;
    const tick = () => {
      const top = [...pairs]
        .filter((p) => (p.priceChange?.h1 || 0) > 8 && (p.liquidity?.usd || 0) > 20000)
        .slice(0, 3);
      if (!top.length) {
        pushEvent("Bscoter", "No high-momentum pairs cleared liquidity floor.", "info");
        return;
      }
      const pick = top[Math.floor(Math.random() * top.length)];
      const score = Math.min(98, 70 + Math.abs(pick.priceChange?.h1 || 0));
      pushEvent("Analuszer", `${pick.baseToken.symbol} score ${score.toFixed(0)}`, "info");
      if (score >= 80) {
        pushEvent("Verdicter", `Mandate SIGNED for ${pick.baseToken.symbol}`, "trade");
        setSelected(pick);
      } else {
        pushEvent("Judge", `${pick.baseToken.symbol} below gate`, "warn");
      }
    };
    tick();
    const id = setInterval(tick, 45000);
    return () => clearInterval(id);
  }, [firmOn, pairs, pushEvent]);

  const onChartTick = useCallback((pair: DexPair) => {
    setPairs((prev) => prev.map((p) => (p.pairAddress === pair.pairAddress ? pair : p)));
    setSelected((s) => (s?.pairAddress === pair.pairAddress ? pair : s));
  }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dex/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setPairs(data.pairs || []);
      if (data.pairs?.[0]) setSelected(data.pairs[0]);
    } finally {
      setLoading(false);
    }
  };

  const symbolMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const p of pairs) m[p.baseToken.address] = p.baseToken.symbol;
    return m;
  }, [pairs]);

  const markPrice = (mint: string) => {
    const p = pairs.find((x) => x.baseToken.address === mint);
    return p?.priceUsd ? parseFloat(p.priceUsd) : 0;
  };

  const openPositions = positions.filter((p) => p.status === "open");
  const totalCost = openPositions.reduce((s, p) => s + p.costUsd, 0);
  const totalValue = openPositions.reduce(
    (s, p) => s + p.amountTokens * (markPrice(p.mint) || p.entryPriceUsd),
    0
  );
  const totalPnl = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const executeSwap = async () => {
    if (!publicKey || !signTransaction || !selected) {
      setStatus("Connect wallet first.");
      return;
    }

    const outputMint = selected.baseToken.address;
    let inputMint: string;
    let amountRaw: bigint;

    if (side === "buy") {
      const ui = parseFloat(buySol);
      if (!isFinite(ui) || ui <= 0) {
        setStatus("Enter a valid amount.");
        return;
      }
      if (payWith === "SOL") {
        inputMint = SOL;
        amountRaw = toRawAmount(ui, 9);
      } else {
        inputMint = USDC_MINT;
        amountRaw = toRawAmount(ui, 6);
      }
    } else {
      inputMint = outputMint;
      const balRaw = splBal ? BigInt(splBal.amountRaw) : 0n;
      if (balRaw <= 0n) {
        setStatus("No SPL balance for this token.");
        return;
      }
      amountRaw = (balRaw * BigInt(sellPct)) / 100n;
      if (amountRaw <= 0n) {
        setStatus("Sell amount too small.");
        return;
      }
    }

    setBusy(true);
    setStatus("Fetching Jupiter quote (Token / Token-2022)…");
    try {
      const outMint = side === "buy" ? outputMint : SOL;
      const quoteRes = await fetch(
        `/api/jupiter/quote?inputMint=${inputMint}&outputMint=${outMint}&amount=${amountRaw.toString()}&slippageBps=${slippage}`
      );
      const quote = await quoteRes.json();
      if (quote.error) throw new Error(quote.error);

      setStatus("Building swap tx…");
      const swapRes = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteResponse: quote, userPublicKey: publicKey.toBase58() }),
      });
      const swap = await swapRes.json();
      if (swap.error) throw new Error(swap.error);

      const tx = VersionedTransaction.deserialize(Buffer.from(swap.swapTransaction, "base64"));
      setStatus("Approve in wallet (mainnet)…");
      const signed = await signTransaction(tx);
      setStatus("Sending…");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });
      setStatus(`Confirming ${sig.slice(0, 8)}…`);
      await connection.confirmTransaction(sig, "confirmed");

      const entry = selected.priceUsd ? parseFloat(selected.priceUsd) : 0;

      if (side === "buy") {
        const outUi = fromRawAmount(quote.outAmount, tokenDecimals);
        const costUsd = payWith === "USDC" ? parseFloat(buySol) : parseFloat(buySol) * 150;
        const pos: Position = {
          id: sig,
          mint: selected.baseToken.address,
          symbol: selected.baseToken.symbol,
          name: selected.baseToken.name,
          pairAddress: selected.pairAddress,
          entryPriceUsd: entry,
          amountTokens: outUi,
          amountRaw: String(quote.outAmount),
          decimals: tokenDecimals,
          costUsd,
          openedAt: Date.now(),
          side: "long",
          status: "open",
          txSig: sig,
          inputMint,
        };
        const next = [pos, ...positions];
        setPositions(next);
        savePositions(wallet, next);
        pushEvent("Trader", `BUY ${selected.baseToken.symbol} · ${formatTokenAmount(outUi, tokenDecimals)}`, "trade");
      } else {
        const soldUi = fromRawAmount(amountRaw.toString(), tokenDecimals);
        const next = positions.map((p) => {
          if (p.mint !== selected.baseToken.address || p.status !== "open") return p;
          const remain = Math.max(0, p.amountTokens - soldUi);
          if (remain < p.amountTokens * 0.01) {
            return {
              ...p,
              status: "closed" as const,
              closedAt: Date.now(),
              exitPriceUsd: entry,
              realizedPnlUsd: soldUi * entry - p.costUsd * (soldUi / (p.amountTokens || 1)),
            };
          }
          return { ...p, amountTokens: remain };
        });
        setPositions(next);
        savePositions(wallet, next);
        pushEvent("Trader", `SELL ${selected.baseToken.symbol} · ${sellPct}%`, "trade");
      }

      setStatus(`Filled. https://solscan.io/tx/${sig}`);
      connection.getBalance(publicKey).then((l) => setSolBalance(l / 1e9));
    } catch (e: any) {
      setStatus(e?.message || "Swap failed");
      pushEvent("Trader", `Failed: ${e?.message}`, "warn");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#14F195] to-[#9945FF] text-xs font-bold text-slate-950">JF</a>
            <div>
              <div className="text-sm font-semibold">Jolsel Firm Terminal</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Token-2022 extensions · SPL · Jupiter</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFirmOn((v) => !v)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${firmOn ? "bg-[#14F195] text-slate-950" : "border border-white/15 bg-white/5 text-slate-300"}`}>
              {firmOn ? "● Firm LIVE" : "○ Firm OFF"}
            </button>
            {solBalance != null && <span className="hidden font-mono text-xs text-slate-400 sm:inline">{solBalance.toFixed(4)} SOL</span>}
            <WalletConnectButton />
          </div>
        </div>
      </header>

      <div className="border-b border-white/5 bg-slate-900/50">
        <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-4">
          <Stat label="Open positions" value={String(openPositions.length)} />
          <Stat label="Cost basis" value={formatUsd(totalCost)} />
          <Stat label="Mark value" value={formatUsd(totalValue)} />
          <Stat label="Unrealized PnL" value={`${formatUsd(totalPnl)} (${formatPct(totalPct)})`} positive={totalPnl >= 0} />
        </div>
      </div>

      {!connected && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
          Connect wallet to read Token-2022 / SPL balances and trade on mainnet.
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-3">
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Search mint / ticker…" className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#14F195]/50" />
            <button type="button" onClick={search} className="rounded-lg bg-white/10 px-3 text-sm hover:bg-white/15">Go</button>
          </div>
          <div className="flex flex-wrap gap-1 text-xs">
            {(["live", "holdings", "positions", "firm", "manage"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-2.5 py-1 capitalize ${tab === t ? "bg-[#14F195]/20 text-[#14F195]" : "text-slate-400"}`}>{t}</button>
            ))}
          </div>

          {tab === "live" && (
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60">
              {loading && <div className="p-4 text-sm text-slate-500">Loading…</div>}
              {pairs.map((p) => {
                const ch = p.priceChange?.h24 ?? 0;
                const active = selected?.pairAddress === p.pairAddress;
                return (
                  <button key={p.pairAddress} type="button" onClick={() => setSelected(p)} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 text-left hover:bg-white/5 ${active ? "bg-[#14F195]/10" : ""}`}>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.baseToken.symbol}</div>
                      <div className="truncate text-[10px] text-slate-500">{p.baseToken.address.slice(0, 8)}…</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs">{formatUsd(p.priceUsd)}</div>
                      <div className={`font-mono text-[10px] ${ch >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatPct(ch)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === "holdings" && (
            <SplHoldings
              symbolMap={symbolMap}
              onSelectMint={(mint) => {
                const found = pairs.find((p) => p.baseToken.address === mint);
                if (found) setSelected(found);
                else {
                  setQuery(mint);
                  fetch(`/api/dex/search?q=${encodeURIComponent(mint)}`)
                    .then((r) => r.json())
                    .then((d) => {
                      if (d.pairs?.[0]) {
                        setPairs(d.pairs);
                        setSelected(d.pairs[0]);
                        setTab("live");
                      }
                    });
                }
              }}
            />
          )}

          {tab === "positions" && (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto">
              {openPositions.length === 0 && <div className="rounded-xl border border-white/10 p-4 text-sm text-slate-500">No open positions.</div>}
              {openPositions.map((pos) => {
                const mark = markPrice(pos.mint) || pos.entryPriceUsd;
                const { pnl, pct } = unrealizedPnl(pos, mark);
                return (
                  <div key={pos.id} className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">{pos.symbol}</span>
                      <span className={`font-mono text-sm ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatPct(pct)}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                      <span>Qty {formatTokenAmount(pos.amountTokens, pos.decimals ?? 6)}</span>
                      <span>Mark {formatUsd(mark)}</span>
                      <span>Cost {formatUsd(pos.costUsd)}</span>
                      <span>PnL {formatUsd(pnl)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "firm" && (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-2">
              {events.length === 0 && <div className="p-3 text-sm text-slate-500">Enable Firm LIVE.</div>}
              {events.map((ev) => (
                <div key={ev.id} className="border-b border-white/5 px-2 py-2 text-xs">
                  <span className="font-mono text-[#14F195]">{ev.agent}</span>
                  <p className="mt-0.5 text-slate-400">{ev.message}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "manage" && (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="text-xs font-semibold text-[#14F195] mb-2">Firm Manage My Bags</div>
              <p className="text-[11px] text-slate-400 mb-3">Select holdings for the firm to monitor. Rules: SL {rules?.stopLossPct ?? -20}% · TP {rules?.takeProfitPct ?? 80}% · partial {rules?.partialTakePct ?? 40}%</p>
              <SplHoldings
                symbolMap={symbolMap}
                onSelectMint={(mint) => {
                  if (wallet) {
                    const next = toggleManagedMint(wallet, mint);
                    setRules(next);
                    pushEvent("RiskManager", next.managedMints.includes(mint) ? `Now managing ${mint.slice(0,6)}…` : `Stopped managing ${mint.slice(0,6)}…`, "info");
                  }
                }}
              />
              <div className="mt-3 text-[10px] text-slate-500">
                Managed: {rules?.managedMints.length || 0} tokens. Firm will generate scenarios (stop-loss / take-profit alerts) on next ticks. You still sign all swaps.
              </div>
            </div>
          )}
        </aside>

        <section className="lg:col-span-6">
          <LiveChart selected={selected} onTick={onChartTick} />
        </section>

        <aside className="space-y-3 lg:col-span-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 flex gap-1 rounded-lg border border-white/10 p-0.5 text-xs">
              <button type="button" onClick={() => setSide("buy")} className={`flex-1 rounded-md py-1.5 font-semibold ${side === "buy" ? "bg-[#14F195] text-slate-950" : "text-slate-400"}`}>Buy</button>
              <button type="button" onClick={() => setSide("sell")} className={`flex-1 rounded-md py-1.5 font-semibold ${side === "sell" ? "bg-rose-500 text-white" : "text-slate-400"}`}>Sell</button>
            </div>

            {selected && (
              <div className="mb-3 rounded-lg bg-slate-950/80 px-2 py-1.5 text-[11px] text-slate-400">
                <span className="text-white">{selected.baseToken.symbol}</span>
                <span className="mx-1">·</span>
                {tokenDecimals} decimals
                {splBal && (
                  <>
                    <span className="mx-1">·</span>
                    Bal {formatTokenAmount(splBal.uiAmount, tokenDecimals)}
                  </>
                )}
              </div>
            )}

            {side === "buy" ? (
              <>
                <div className="mb-2 flex gap-1 text-xs">
                  <button type="button" onClick={() => setPayWith("SOL")} className={`rounded px-2 py-1 ${payWith === "SOL" ? "bg-white/15" : ""}`}>SOL</button>
                  <button type="button" onClick={() => setPayWith("USDC")} className={`rounded px-2 py-1 ${payWith === "USDC" ? "bg-white/15" : ""}`}>USDC</button>
                </div>
                <input value={buySol} onChange={(e) => setBuySol(e.target.value)} className="mb-2 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-sm outline-none" placeholder="Amount" />
              </>
            ) : (
              <>
                <input type="range" min={1} max={100} value={sellPct} onChange={(e) => setSellPct(Number(e.target.value))} className="mb-1 w-full" />
                <div className="mb-2 text-right text-xs text-slate-400">Sell {sellPct}%</div>
              </>
            )}

            <div className="mb-3 text-xs text-slate-400">Slippage {slippage / 100}%</div>

            <button type="button" disabled={busy || !connected || !selected} onClick={executeSwap} className="w-full rounded-lg bg-gradient-to-r from-[#14F195] to-emerald-400 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50">
              {busy ? "Working…" : side === "buy" ? "Buy with Jupiter" : "Sell with Jupiter"}
            </button>

            {status && <p className="mt-2 text-[11px] text-slate-400 break-all">{status}</p>}
          </div>

          <Token2022Panel mint={selectedMint} />
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`font-mono text-sm font-semibold ${positive === undefined ? "text-white" : positive ? "text-emerald-400" : "text-rose-400"}`}>{value}</div>
    </div>
  );
}
