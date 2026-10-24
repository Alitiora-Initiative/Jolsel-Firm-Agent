export type Position = {
  id: string;
  mint: string;
  symbol: string;
  name: string;
  pairAddress?: string;
  entryPriceUsd: number;
  /** Human-readable token amount (respects decimals) */
  amountTokens: number;
  /** Raw integer amount as string (SPL base units) */
  amountRaw?: string;
  decimals?: number;
  costUsd: number;
  openedAt: number;
  side: "long";
  status: "open" | "closed";
  exitPriceUsd?: number;
  closedAt?: number;
  realizedPnlUsd?: number;
  txSig?: string;
  /** Buy paid with SOL or USDC etc */
  inputMint?: string;
};

const KEY = "jolsel_positions_v2";

export function loadPositions(wallet: string): Position[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${KEY}:${wallet}`);
    if (raw) return JSON.parse(raw);
    // migrate v1
    const v1 = localStorage.getItem(`jolsel_positions_v1:${wallet}`);
    return v1 ? JSON.parse(v1) : [];
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
