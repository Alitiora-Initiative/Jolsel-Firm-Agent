"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

function short(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function WalletConnectButton() {
  const { publicKey, connected, connecting, disconnect, wallet } = useWallet();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (!connected) setMenu(false);
  }, [connected]);

  const copy = useCallback(async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [publicKey]);

  if (!connected) {
    return (
      <button
        type="button"
        disabled={connecting}
        onClick={() => setVisible(true)}
        className="inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-r from-[#14F195] to-emerald-400 px-4 text-xs font-bold text-slate-950 shadow-lg shadow-[#14F195]/20 transition hover:opacity-90 disabled:opacity-60"
      >
        {connecting ? (
          "Connecting…"
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenu((m) => !m)}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-[#14F195]/40 bg-[#14F195]/10 px-3 text-xs font-medium text-[#14F195]"
      >
        <span className="h-2 w-2 rounded-full bg-[#14F195] animate-pulse" />
        {wallet?.adapter.name}
        <span className="font-mono text-white">{publicKey ? short(publicKey.toBase58()) : ""}</span>
      </button>
      {menu && (
        <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl">
          <button type="button" onClick={copy} className="block w-full px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5">
            {copied ? "Copied" : "Copy address"}
          </button>
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="block w-full px-3 py-2.5 text-left text-xs text-slate-300 hover:bg-white/5"
          >
            Change wallet
          </button>
          <button
            type="button"
            onClick={() => {
              void disconnect();
              setMenu(false);
            }}
            className="block w-full border-t border-white/5 px-3 py-2.5 text-left text-xs text-rose-400 hover:bg-white/5"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
