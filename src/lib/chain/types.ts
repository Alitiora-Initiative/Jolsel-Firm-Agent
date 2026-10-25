export type ChainSnapshot = {
  ts: number;
  solPriceUsd: number | null;
  treasury: { address: string; lamports: number; sol: number };
  signatures: { signature: string; blockTime: number | null; err: boolean; memo: string | null }[];
  wallet: {
    address: string;
    sol: number;
    tokens: { mint: string; amount: string; decimals: number; ui: number }[];
  } | null;
  mint: { address: string; exists: boolean; supply: string; decimals: number } | null;
  error?: string;
};
