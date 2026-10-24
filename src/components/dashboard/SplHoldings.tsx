"use client";

import { useCallback, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  type SplHolding,
  getSplHoldings,
  formatTokenAmount,
  WSOL_MINT,
  USDC_MINT,
  USDT_MINT,
} from "@/lib/spl";
import { formatUsd } from "@/lib/dexscreener";

const KNOWN: Record<string, string> = {
  [WSOL_MINT]: "WSOL",
  [USDC_MINT]: "USDC",
  [USDT_MINT]: "USDT",
};

export function SplHoldings({
  onSelectMint,
  symbolMap,
}: {
  onSelectMint?: (mint: string) => void;
  /** optional mint → symbol from open pairs */
  symbolMap?: Record<string, string>;
}) {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [holdings, setHoldings] = useState<SplHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!publicKey) {
      setHoldings([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const list = await getSplHoldings(connection, publicKey);
      setHoldings(list);
    } catch (e: any) {
      setError(e?.message || "Failed to load SPL balances");
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    refresh();
    if (!publicKey) return;
    const id = setInterval(refresh, 20000);
    return () => clearInterval(id);
  }, [refresh, publicKey]);

  if (!connected) {
    return (
      <div className="rounded-xl border border-white/10 p-4 text-sm text-slate-500">
        Connect wallet to read SPL token accounts.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">
          SPL holdings · {holdings.length}
        </span>
        <button
          type="button"
          onClick={refresh}
          className="text-[10px] text-[#14F195] hover:underline"
          disabled={loading}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {holdings.length === 0 && !loading && (
        <div className="rounded-xl border border-white/10 p-4 text-sm text-slate-500">
          No SPL balances (Token Program + Token-2022).
        </div>
      )}
      <div className="max-h-[50vh] space-y-1 overflow-y-auto">
        {holdings.map((h) => {
          const sym =
            symbolMap?.[h.mint] ||
            KNOWN[h.mint] ||
            `${h.mint.slice(0, 4)}…${h.mint.slice(-4)}`;
          return (
            <button
              key={h.tokenAccount}
              type="button"
              onClick={() => onSelectMint?.(h.mint)}
              className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-slate-900/60 px-3 py-2 text-left hover:bg-white/5"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{sym}</div>
                <div className="truncate font-mono text-[10px] text-slate-500">{h.mint}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-xs">{formatTokenAmount(h.uiAmount, h.decimals)}</div>
                <div className="text-[10px] text-slate-500">{h.decimals} dec</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useSplBalance(mint: string | undefined) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [holding, setHolding] = useState<SplHolding | null>(null);

  useEffect(() => {
    if (!publicKey || !mint) {
      setHolding(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const all = await getSplHoldings(connection, publicKey);
        if (!cancelled) setHolding(all.find((h) => h.mint === mint) || null);
      } catch {
        if (!cancelled) setHolding(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connection, publicKey, mint]);

  return holding;
}
