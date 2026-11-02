"use client";

import { useEffect, useState } from "react";
import { type DexPair, formatUsd, formatPct } from "@/lib/dexscreener";

type Source = "dexscreener" | "birdeye";

export function LiveChart({
  selected,
  onTick,
}: {
  selected: DexPair | null;
  onTick?: (pair: DexPair) => void;
}) {
  const [source, setSource] = useState<Source>("dexscreener");
  const [live, setLive] = useState<DexPair | null>(selected);
  const [tickAt, setTickAt] = useState<number>(0);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    setLive(selected);
  }, [selected?.pairAddress]);

  // Real-time price poll every 4s for selected pair
  useEffect(() => {
    if (!selected?.pairAddress) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/dex/pair?chain=solana&pair=${encodeURIComponent(selected.pairAddress)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (!cancelled && data.pair) {
          setLive(data.pair);
          setTickAt(Date.now());
          setPulse(true);
          setTimeout(() => setPulse(false), 400);
          onTick?.(data.pair);
        }
      } catch {
        /* ignore transient */
      }
    };
    poll();
    const id = setInterval(poll, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [selected?.pairAddress, onTick]);

  const pair = live || selected;
  const dexUrl = pair
    ? `https://dexscreener.com/solana/${pair.pairAddress}?embed=1&theme=dark&trades=1&info=0&chartLeftToolbar=0&chartDefaultOnPeriod=15m`
    : null;
  // Birdeye embed chart (public)
  const birdeyeEmbed = pair
    ? `https://birdeye.so/tv-widget/${pair.baseToken.address}?chain=solana&viewMode=pair&chartInterval=15&chartType=Candle&chartLeftToolbar=show&theme=dark`
    : null;

  const ch = pair?.priceChange?.m5 ?? pair?.priceChange?.h1 ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            {pair ? `${pair.baseToken.symbol} / ${pair.quoteToken.symbol}` : "Select a pair"}
          </h2>
          {pair && (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
              <span
                className={`font-mono text-base font-semibold transition ${pulse ? "text-[#14F195]" : "text-white"}`}
              >
                {formatUsd(pair.priceUsd)}
              </span>
              <span className={`font-mono ${ch >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatPct(ch)} <span className="text-slate-500">5m/1h</span>
              </span>
              <span className="text-slate-500">Vol 24h {formatUsd(pair.volume?.h24)}</span>
              <span className="text-slate-500">Liq {formatUsd(pair.liquidity?.usd)}</span>
              {tickAt > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#14F195]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#14F195]" />
                  live · {new Date(tickAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-slate-900/80 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSource("dexscreener")}
            className={`rounded-md px-2.5 py-1 ${source === "dexscreener" ? "bg-[#14F195]/20 text-[#14F195]" : "text-slate-400"}`}
          >
            DexScreener
          </button>
          <button
            type="button"
            onClick={() => setSource("birdeye")}
            className={`rounded-md px-2.5 py-1 ${source === "birdeye" ? "bg-[#14F195]/20 text-[#14F195]" : "text-slate-400"}`}
          >
            Birdeye
          </button>
          {pair && (
            <a
              href={source === "birdeye" ? `https://birdeye.so/token/${pair.baseToken.address}?chain=solana` : pair.url}
              target="_blank"
              rel="noreferrer"
              className="ml-1 rounded-md border border-white/10 px-2 py-1 text-slate-400 hover:bg-white/5"
            >
              Open ↗
            </a>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-black" style={{ height: 520 }}>
        {!pair && (
          <div className="flex h-full items-center justify-center text-slate-600">Select a token to load live chart</div>
        )}
        {pair && source === "dexscreener" && dexUrl && (
          <iframe
            key={`dex-${pair.pairAddress}`}
            title="DexScreener live chart"
            src={dexUrl}
            className="h-full w-full border-0"
            allow="clipboard-write"
          />
        )}
        {pair && source === "birdeye" && birdeyeEmbed && (
          <iframe
            key={`be-${pair.baseToken.address}`}
            title="Birdeye live chart"
            src={birdeyeEmbed}
            className="h-full w-full border-0"
            allow="clipboard-write"
          />
        )}
      </div>
    </div>
  );
}
