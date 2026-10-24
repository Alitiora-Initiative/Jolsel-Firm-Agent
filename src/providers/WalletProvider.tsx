"use client";

import { useMemo, ReactNode } from "react";
import { ConnectionProvider, WalletProvider as SolWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC =
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  process.env.NEXT_PUBLIC_HELIUS_RPC ||
  clusterApiUrl("mainnet-beta");

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );
  return (
    <ConnectionProvider endpoint={RPC} config={{ commitment: "confirmed" }}>
      <SolWalletProvider wallets={wallets} autoConnect onError={(e) => console.error("[wallet]", e)}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolWalletProvider>
    </ConnectionProvider>
  );
}
