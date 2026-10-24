import {
  Connection,
  PublicKey,
  ParsedAccountData,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";

export const WSOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

export type SplHolding = {
  mint: string;
  amountRaw: string;
  decimals: number;
  uiAmount: number;
  tokenAccount: string;
  programId: string;
};

/** Parse all SPL + Token-2022 balances for a wallet */
export async function getSplHoldings(
  connection: Connection,
  owner: PublicKey
): Promise<SplHolding[]> {
  const holdings: SplHolding[] = [];

  for (const programId of [TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID]) {
    const res = await connection.getParsedTokenAccountsByOwner(owner, {
      programId,
    });
    for (const { pubkey, account } of res.value) {
      const data = account.data as ParsedAccountData;
      const info = data.parsed?.info;
      if (!info) continue;
      const amountRaw = info.tokenAmount?.amount ?? "0";
      const decimals = Number(info.tokenAmount?.decimals ?? 0);
      const uiAmount = Number(info.tokenAmount?.uiAmount ?? 0);
      if (amountRaw === "0" || uiAmount === 0) continue;
      holdings.push({
        mint: info.mint as string,
        amountRaw: String(amountRaw),
        decimals,
        uiAmount,
        tokenAccount: pubkey.toBase58(),
        programId: programId.toBase58(),
      });
    }
  }

  return holdings.sort((a, b) => b.uiAmount - a.uiAmount);
}

export async function getTokenDecimals(
  connection: Connection,
  mint: string
): Promise<number> {
  if (mint === WSOL_MINT) return 9;
  try {
    const mintInfo = await getMint(connection, new PublicKey(mint));
    return mintInfo.decimals;
  } catch {
    try {
      const mintInfo = await getMint(
        connection,
        new PublicKey(mint),
        undefined,
        TOKEN_2022_PROGRAM_ID
      );
      return mintInfo.decimals;
    } catch {
      return 6; // common meme default
    }
  }
}

export function toRawAmount(uiAmount: number, decimals: number): bigint {
  const factor = 10 ** decimals;
  return BigInt(Math.floor(uiAmount * factor + 1e-9));
}

export function fromRawAmount(raw: string | number | bigint, decimals: number): number {
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  return n / 10 ** decimals;
}

export function formatTokenAmount(ui: number, decimals = 6): string {
  if (!isFinite(ui)) return "—";
  if (ui >= 1e9) return `${(ui / 1e9).toFixed(2)}B`;
  if (ui >= 1e6) return `${(ui / 1e6).toFixed(2)}M`;
  if (ui >= 1e3) return `${(ui / 1e3).toFixed(2)}K`;
  if (ui >= 1) return ui.toFixed(Math.min(4, decimals));
  if (ui >= 0.0001) return ui.toFixed(Math.min(6, decimals));
  return ui.toExponential(2);
}

export function getAta(mint: string, owner: PublicKey, token2022 = false): PublicKey {
  return getAssociatedTokenAddressSync(
    new PublicKey(mint),
    owner,
    false,
    token2022 ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
  );
}
