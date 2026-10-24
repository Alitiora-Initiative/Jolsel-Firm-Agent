"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { type DexPair, formatUsd, formatPct } from "@/lib/dexscreener";
import { SOL } from "@/lib/jupiter";
import { type Position, loadPositions, savePositions, unrealizedPnl } from "@/lib/positions";
import { LiveChart } from "@/components/dashboard/LiveChart";
import { WalletConnectButton } from "@/components/dashboard/WalletConnectButton";

type FirmEvent = { id: string; at: number; agent: string; message: string; level: "info" | "warn" | "success" | "trade" };

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
  const [slippage, setSlippage] = useState(100);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [firmOn, setFirmOn] = useState(false);
  const [events, setEvents] = useState<FirmEvent[]>([]);
  const [tab, setTab] = useState<"live" | "positions" | "firm">("live");

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
        const updated = list.find((p) => p.pairAddress === s.pairAddress);
        return updated || s;
      });
    } catch (e: any) {
      pushEvent("System", `Market feed error: ${e.message}`, "warn");
    } finally {
      setLoading(false);
    }
  }, [pushEvent]);

  useEffect(() => {
    refreshMarket();
    const t = setInterval(refreshMarket, 20000);
    return () => clearInterval(t);
  }, [refreshMarket]);

  useEffect(() => {
    if (!wallet) {
      setPositions([]);
      setSolBalance(null);
      return;
    }
    setPositions(loadPositions(wallet));
    connection.getBalance(publicKey!).then((lamports) => setSolBalance(lamports / 1e9));
    const bal = setInterval(() => {
      connection.getBalance(publicKey!).then((lamports) => setSolBalance(lamports / 1e9));
    }, 15000);
    return () => clearInterval(bal);
  }, [wallet, connection, publicKey]);

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
      pushEvent("Analuszer", `${pick.baseToken.symbol} score ${score.toFixed(0)} · liq ${formatUsd(pick.liquidity?.usd)}`, "info");
      if (score >= 80) {
        pushEvent("Forecaster", `${pick.baseToken.symbol} WORTH IT — trailing SL 25%`, "success");
        pushEvent("MrGrumpy", "Zero-tolerance scan passed.", "info");
        pushEvent("Verdicter", `Mandate SIGNED for ${pick.baseToken.symbol}. Awaiting wallet.`, "trade");
        setSelected(pick);
        if (connected) pushEvent("Trader", `Ready to execute ${pick.baseToken.symbol}`, "trade");
      } else {
        pushEvent("Judge", `${pick.baseToken.symbol} below gate — no trade.`, "warn");
      }
    };
    tick();
    const id = setInterval(tick, 45000);
    return () => clearInterval(id);
  }, [firmOn, pairs, connected, pushEvent]);

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

  const executeBuy = async () => {
    if (!publicKey || !signTransaction || !selected) {
      setStatus("Connect wallet first.");
      return;
    }
    const solAmt = parseFloat(buySol);
    if (!isFinite(solAmt) || solAmt <= 0) {
      setStatus("Enter a valid SOL amount.");
      return;
    }
    setBusy(true);
    setStatus("Fetching Jupiter mainnet quote…");
    try {
      const lamports = Math.floor(solAmt * 1e9);
      const quoteRes = await fetch(
        `/api/jupiter/quote?inputMint=${SOL}&outputMint=${selected.baseToken.address}&amount=${lamports}&slippageBps=${slippage}`
      );
      const quote = await quoteRes.json();
      if (quote.error) throw new Error(quote.error);
      setStatus("Building swap transaction…");
      const swapRes = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteResponse: quote, userPublicKey: publicKey.toBase58() }),
      });
      const swap = await swapRes.json();
      if (swap.error) throw new Error(swap.error);
      const tx = VersionedTransaction.deserialize(Buffer.from(swap.swapTransaction, "base64"));
      setStatus("Approve in your wallet (mainnet)…");
      const signed = await signTransaction(tx);
      setStatus("Sending transaction…");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
      });
      setStatus(`Confirming ${sig.slice(0, 8)}…`);
      await connection.confirmTransaction(sig, "confirmed");
      const entry = selected.priceUsd ? parseFloat(selected.priceUsd) : 0;
      const pos: Position = {
        id: sig,
        mint: selected.baseToken.address,
        symbol: selected.baseToken.symbol,
        name: selected.baseToken.name,
        pairAddress: selected.pairAddress,
        entryPriceUsd: entry,
        amountTokens: Number(quote.outAmount),
        costUsd: solAmt * 150,
        openedAt: Date.now(),
        side: "long",
        status: "open",
        txSig: sig,
      };
      const next = [pos, ...positions];
      setPositions(next);
      savePositions(wallet, next);
      pushEvent("Trader", `MAINNET FILL ${selected.baseToken.symbol}`, "trade");
      setStatus(`Filled. https://solscan.io/tx/${sig}`);
      connection.getBalance(publicKey).then((l) => setSolBalance(l / 1e9));
    } catch (e: any) {
      setStatus(e?.message || "Swap failed");
      pushEvent("Trader", `Execution failed: ${e?.message}`, "warn");
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
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Solana mainnet · live charts · wallet connect</div>
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
          Connect your Solana wallet to trade on mainnet and track positions.
        </div>
      )}

      <div className="mx-auto grid max-w-[1600px] gap-4 p-4 lg:grid-cols-12">
        <aside className="space-y-3 lg:col-span-3">
          <div className="flex gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder="Search mint / ticker…" className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-[#14F195]/50" />
            <button type="button" onClick={search} className="rounded-lg bg-white/10 px-3 text-sm hover:bg-white/15">Go</button>
          </div>
          <div className="flex gap-1 text-xs">
            {(["live", "positions", "firm"] as const).map((t) => (
              <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-2.5 py-1 capitalize ${tab === t ? "bg-[#14F195]/20 text-[#14F195]" : "text-slate-400"}`}>{t}</button>
            ))}
          </div>

          {tab === "live" && (
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60">
              {loading && <div className="p-4 text-sm text-slate-500">Loading DexScreener…</div>}
              {pairs.map((p) => {
                const ch = p.priceChange?.h24 ?? 0;
                const active = selected?.pairAddress === p.pairAddress;
                return (
                  <button key={p.pairAddress} type="button" onClick={() => setSelected(p)} className={`flex w-full items-center justify-between gap-2 border-b border-white/5 px-3 py-2.5 text-left hover:bg-white/5 ${active ? "bg-[#14F195]/10" : ""}`}>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{p.baseToken.symbol}</div>
                      <div className="truncate text-[10px] text-slate-500">{p.dexId} · liq {formatUsd(p.liquidity?.usd)}</div>
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

          {tab === "positions" && (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto">
              {openPositions.length === 0 && <div className="rounded-xl border border-white/10 p-4 text-sm text-slate-500">No open positions yet.</div>}
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
                      <span>Entry {formatUsd(pos.entryPriceUsd)}</span>
                      <span>Mark {formatUsd(mark)}</span>
                      <span>Cost {formatUsd(pos.costUsd)}</span>
                      <span>PnL {formatUsd(pnl)}</span>
                    </div>
                    {pos.txSig && <a className="mt-2 inline-block text-[10px] text-[#14F195]" href={`https://solscan.io/tx/${pos.txSig}`} target="_blank" rel="noreferrer">Solscan ↗</a>}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "firm" && (
            <div className="max-h-[70vh] space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/60 p-2">
              {events.length === 0 && <div className="p-3 text-sm text-slate-500">Enable Firm LIVE to stream agents.</div>}
              {events.map((ev) => (
                <div key={ev.id} className="border-b border-white/5 px-2 py-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="font-mono text-[#14F195]">{ev.agent}</span>
                    <span className="text-slate-600">{new Date(ev.at).toLocaleTimeString()}</span>
                  </div>
                  <p className={`mt-0.5 ${ev.level === "warn" ? "text-amber-400" : ev.level === "trade" ? "text-white" : "text-slate-400"}`}>{ev.message}</p>
                </div>
              ))}
            </div>
          )}
        </aside>

        <section className="lg:col-span-6">
          <LiveChart selected={selected} onTick={onChartTick} />
        </section>

        <aside className="space-y-3 lg:col-span-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mainnet buy · Jupiter</div>
            {!connected && (
              <div className="mb-3 rounded-lg border border-white/10 bg-slate-950 p-3 text-center">
                <p className="mb-2 text-xs text-slate-400">Wallet required for real swaps</p>
                <div className="flex justify-center"><WalletConnectButton /></div>
              </div>
            )}
            <label className="text-[11px] text-slate-400">Amount (SOL)</label>
            <input value={buySol} onChange={(e) => setBuySol(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-sm outline-none focus:border-[#14F195]/50" />
            <div className="mt-2 flex gap-1">
              {["0.01", "0.05", "0.1", "0.25"].map((v) => (
                <button key={v} type="button" onClick={() => setBuySol(v)} className="flex-1 rounded-md border border-white/10 py-1 text-[11px] text-slate-400 hover:bg-white/5">{v}</button>
              ))}
            </div>
            <label className="mt-3 block text-[11px] text-slate-400">Slippage (bps)</label>
            <input type="number" value={slippage} onChange={(e) => setSlippage(Number(e.target.value) || 100)} className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 font-mono text-sm outline-none" />
            <button type="button" disabled={busy || !selected || !connected} onClick={executeBuy} className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#14F195] to-emerald-400 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40">
              {busy ? "Executing…" : connected ? `Buy ${selected?.baseToken.symbol || "—"}` : "Connect wallet to buy"}
            </button>
            {status && <p className="mt-2 break-all text-[11px] text-slate-400">{status}</p>}
          </div>
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
