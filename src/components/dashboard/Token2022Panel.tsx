"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { inspectToken2022, type Token2022Info } from "@/lib/token2022";

export function Token2022Panel({ mint }: { mint: string | undefined }) {
  const { connection } = useConnection();
  const [info, setInfo] = useState<Token2022Info | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mint) {
      setInfo(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    inspectToken2022(connection, mint)
      .then((i) => {
        if (!cancelled) setInfo(i);
      })
      .catch(() => {
        if (!cancelled) setInfo(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [connection, mint]);

  if (!mint) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/70 p-4 text-xs">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Token-2022 extensions
        </span>
        {loading && <span className="text-slate-600">Scanning…</span>}
        {info && !loading && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              info.program === "token-2022"
                ? "bg-violet-500/20 text-violet-300"
                : info.program === "spl-token"
                  ? "bg-slate-500/20 text-slate-400"
                  : "bg-rose-500/20 text-rose-300"
            }`}
          >
            {info.program === "token-2022"
              ? "Token-2022"
              : info.program === "spl-token"
                ? "Classic SPL"
                : "Unknown"}
          </span>
        )}
      </div>

      {info && (
        <>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-slate-400">
            <span>Decimals</span>
            <span className="font-mono text-right text-white">{info.decimals}</span>
            <span>Supply</span>
            <span className="truncate font-mono text-right text-white">{info.supply}</span>
            {info.mintAuthority && (
              <>
                <span>Mint auth</span>
                <span className="truncate font-mono text-right text-amber-300">
                  {info.mintAuthority.slice(0, 4)}…{info.mintAuthority.slice(-4)}
                </span>
              </>
            )}
            {info.freezeAuthority && (
              <>
                <span>Freeze auth</span>
                <span className="truncate font-mono text-right text-amber-300">
                  {info.freezeAuthority.slice(0, 4)}…{info.freezeAuthority.slice(-4)}
                </span>
              </>
            )}
          </div>

          {info.extensionLabels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {info.extensionLabels.map((l) => (
                <span
                  key={l}
                  className="rounded-md border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-200"
                >
                  {l}
                </span>
              ))}
            </div>
          )}

          {info.program === "spl-token" && (
            <p className="mt-2 text-slate-500">No Token-2022 extensions on this mint.</p>
          )}

          {info.transferFee && (
            <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-amber-100">
              <div className="font-semibold text-amber-300">Transfer fee</div>
              <div className="mt-1 font-mono">
                {info.transferFee.transferFeeBasisPoints / 100}% · max {" "}
                {info.transferFee.maximumFee} base units
              </div>
            </div>
          )}

          {info.permanentDelegate && (
            <div className="mt-2 text-amber-300">
              Permanent delegate:{" "}
              <span className="font-mono">
                {info.permanentDelegate.slice(0, 6)}…{info.permanentDelegate.slice(-4)}
              </span>
            </div>
          )}

          {info.transferHookProgramId && (
            <div className="mt-2 text-violet-300">
              Transfer hook:{" "}
              <span className="font-mono">
                {info.transferHookProgramId.slice(0, 6)}…
                {info.transferHookProgramId.slice(-4)}
              </span>
            </div>
          )}

          {info.nonTransferable && (
            <div className="mt-2 font-semibold text-rose-400">Non-transferable — cannot sell</div>
          )}

          {info.interestBearing && (
            <div className="mt-2 text-slate-300">
              Interest-bearing · rate {info.interestBearing.currentRate}
            </div>
          )}

          {info.warnings.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-white/5 pt-2 text-[11px] text-amber-200/90">
              {info.warnings.map((w, i) => (
                <li key={i}>⚠ {w}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
