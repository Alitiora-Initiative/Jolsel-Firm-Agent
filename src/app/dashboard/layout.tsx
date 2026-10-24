import { WalletProvider } from "@/providers/WalletProvider";

export const metadata = {
  title: "Terminal | Jolsel Firm",
  description: "Solana memecoin trading terminal — DexScreener, Jupiter mainnet, firm agents",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
