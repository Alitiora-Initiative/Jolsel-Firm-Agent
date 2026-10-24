import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jolsel Firm | Multi-Agent Solana Trading Firm",
  description:
    "17+ specialized AI agents operating as a unified Solana trading firm — Discovery, Planning, Compliance, Executive & Audit departments.",
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
      <body className="min-h-screen antialiased grid-bg">{children}</body>
    </html>
  );
}
