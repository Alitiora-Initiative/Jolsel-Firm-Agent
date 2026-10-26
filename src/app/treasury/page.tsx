"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export default function TreasuryPage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [totalValue, setTotalValue] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreasuryData = async () => {
      if (!publicKey) return;
      
      try {
        // Get SOL balance
        const balance = await connection.getBalance(publicKey);
        setSolBalance(balance / 1e9);
        
        // This would connect to on-chain vault for real data
        // For now showing the connected wallet as treasury
        setTotalValue(balance / 1e9 * 150); // Placeholder calculation
      } catch (error) {
        console.error("Error fetching treasury data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTreasuryData();
    const interval = setInterval(fetchTreasuryData, 5000);
    return () => clearInterval(interval);
  }, [connection, publicKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">Loading treasury data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <a href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#14F195] to-[#9945FF] text-xs font-bold text-slate-950">JF</a>
            <div>
              <div className="text-sm font-semibold">Jolsel Firm Treasury</div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500">On-chain Vault Management</div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1600px] p-6">
        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Total Treasury Value</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-xs text-emerald-400">+12.5% all time</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">SOL Balance</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">
              {solBalance.toFixed(4)} SOL
            </div>
            <div className="mt-1 text-xs text-slate-400">≈ ${(solBalance * 150).toFixed(2)} USD</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Active Positions</div>
            <div className="mt-2 text-3xl font-bold font-mono text-white">
              {positions.length}
            </div>
            <div className="mt-1 text-xs text-slate-400">Trading pairs</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Treasury Performance</h2>
            <div className="aspect-video flex items-center justify-center rounded-lg bg-slate-950/50 border border-white/5">
              <div className="text-center">
                <div className="text-slate-500 text-sm mb-2">Candlestick Chart</div>
                <div className="text-xs text-slate-600">Real-time treasury performance visualization</div>
                <div className="mt-4 text-[10px] text-slate-700">Connect to on-chain vault for live data</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-500/20">1D</button>
              <button className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/10">7D</button>
              <button className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/10">30D</button>
              <button className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/10">All</button>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="mb-4 text-lg font-semibold">Recent Transactions</h2>
            <div className="space-y-2">
              {[
                { type: 'BUY', token: 'BONK', amount: '1,000,000', value: '$150.00', time: '2m ago' },
                { type: 'SELL', token: 'WIF', amount: '500', value: '$75.00', time: '15m ago' },
                { type: 'BUY', token: 'POPCAT', amount: '10,000', value: '$200.00', time: '1h ago' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-slate-950/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${tx.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {tx.type}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{tx.token}</div>
                      <div className="text-[10px] text-slate-500">{tx.amount} tokens</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{tx.value}</div>
                    <div className="text-[10px] text-slate-500">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-6">
          <h2 className="mb-4 text-lg font-semibold">Vault Allocation</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { name: 'SOL', percent: 45, color: 'from-purple-500 to-purple-600' },
              { name: 'USDC', percent: 30, color: 'from-blue-500 to-blue-600' },
              { name: 'Trading Positions', percent: 20, color: 'from-emerald-500 to-emerald-600' },
              { name: 'Other Tokens', percent: 5, color: 'from-orange-500 to-orange-600' },
            ].map((alloc, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{alloc.name}</span>
                  <span className="font-mono">{alloc.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${alloc.color}`} style={{ width: `${alloc.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
