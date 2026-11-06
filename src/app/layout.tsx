import type { Metadata } from "next";
import { WalletProvider } from "@/providers/WalletProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jolsel Firm | Multi-Agent Solana Trading Firm",
  description:
    "17 specialized agents operating as a unified Solana trading desk: live DexScreener data, on-chain mint checks, Jupiter quotes, and wallet-signed swaps.",
  openGraph: {
    title: "Jolsel Firm",
    description: "Multi-Agent Solana Trading Firm",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased grid-bg">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
