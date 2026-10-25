import { create } from "zustand";

type Injected = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  publicKey?: { toString(): string };
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
};

type WalletState = {
  address: string | null;
  name: string | null;
  connecting: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

function injected(): { provider: Injected; name: string } | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { solana?: Injected; solflare?: Injected };
  if (w.solana?.connect) return { provider: w.solana, name: w.solana.isPhantom ? "Phantom" : "Injected" };
  if (w.solflare?.connect) return { provider: w.solflare, name: "Solflare" };
  return null;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  name: null,
  connecting: false,
  error: "",
  connect: async () => {
    const found = injected();
    if (!found) {
      set({ error: "No Solana wallet in this browser. Install Phantom or Solflare." });
      return;
    }
    set({ connecting: true, error: "" });
    try {
      const res = await found.provider.connect();
      const address = res.publicKey?.toString() || found.provider.publicKey?.toString() || null;
      set({ address, name: found.name, connecting: false });
    } catch (err) {
      set({
        connecting: false,
        error: err instanceof Error ? err.message : "Wallet rejected the connection.",
      });
    }
  },
  disconnect: async () => {
    const found = injected();
    try {
      await found?.provider.disconnect();
    } catch {
      /* already disconnected */
    }
    set({ address: null, name: null, error: "" });
  },
}));
