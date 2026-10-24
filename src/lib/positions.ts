export type Position = {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  pairAddress?: string;
  entryPriceUsd: number;
  amountTokens: number;
  costUsd: number;
  openedAt: number;
  side: "long";
  status: "open" | "closed";
  exitPriceUsd?: number;
  closedAt?: number;
  realizedPnlUsd?: number;
  txSig?: string;
};

const KEY = "jolsel_positions_v1";

export function loadPositions(wallet: string): Position[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${KEY}:${wallet}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePositions(wallet: string, positions: Position[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${KEY}:${wallet}`, JSON.stringify(positions));
}

export function unrealizedPnl(pos: Position, markPriceUsd: number) {
  const value = pos.amountTokens * markPriceUsd;
  const pnl = value - pos.costUsd;
  const pct = pos.costUsd > 0 ? (pnl / pos.costUsd) * 100 : 0;
  return { value, pnl, pct };
}
