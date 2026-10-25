/** Dev wallet. Public. All desks treat this address as the operator. */
export const DEV_WALLET = "EDZjEbRAtqyC8z6ta6PYHX161Xynt13tWpd7orKERkbz";

/**
 * Fee destination until a separate treasury program account exists.
 * The live page reads this address on mainnet. It does not invent a balance.
 */
export const TREASURY_WALLET = DEV_WALLET;

export const VAULT_CAP_SOL = 100_000;
export const LAUNCH_MILESTONE_SOL = 1_000;
export const INTEREST_PAUSE_SOL = 200;
export const INTEREST_RESUME_SOL = 400;
export const INTEREST_YEARLY_SOL = 100;
export const INTEREST_MIN_USD = 20;
export const VAULT_OPEN_FEE_USD = 0.1;
export const VAULT_LAUNCH_FEE_USD = 1;
export const PROFIT_TREASURY_BPS = 1_000;
export const AIRDROP_MIN_TRADES = 20;

export const TOKEN_NAME = "JOLSEL FIRM";
export const TOKEN_SUPPLY = 200_000_000;
export const TOKEN_DECIMALS_PLAN = 6;

export const ALLOCATION = [
  { bucket: "Treasury", amount: 100_000_000, note: "6-month cliff, 2-year vest. 25% of this bucket (25,000,000) is the fee buyback-and-burn budget, not a pre-mine burn." },
  { bucket: "Dev", amount: 50_000_000, note: DEV_WALLET },
  { bucket: "Users", amount: 40_000_000, note: "Community allocation. Not minted." },
  { bucket: "Vault airdrop", amount: 10_000_000, note: "4-month cliff, 1-year vest. Vault plus at least 20 firm trades. Not minted." },
] as const;

export const TOKEN_DESCRIPTION =
  "JOLSEL FIRM is the Solana token of the Jolsel trading firm. Seventeen desks read the live memecoin tape and leave every swap unsigned until a wallet signs. Vault depositors are the holders the airdrop is written for. Trading fees are meant to fund the treasury. The mint does not exist until the dev wallet publishes a mainnet mint address that this site can verify on-chain. Supply plan: 200 million. Treasury 100 million (6-month cliff, 2-year vest, 25% of that treasury earmarked for fee buybacks and burns). Dev 50 million. Users 40 million. Vault-holder airdrop 10 million (4-month cliff, 1-year vest).";

/** Spending plan for the 600 SOL earmarked to the dev wallet after the 1,000 SOL milestone. Not a transfer. */
export const DEV_SPEND_PLAN = [
  { sol: 100, use: "Open the JOLSEL FIRM liquidity pool, then lock and burn the LP token. Do this before any discretionary spend." },
  { sol: 150, use: "Leave as SOL on the dev wallet so rent, metadata, and revoke transactions cannot fail for lack of fees." },
  { sol: 80, use: "Mint, metadata, and vesting-account rent, with surplus kept as SOL." },
  { sol: 70, use: "Buyback fuel. Stays as SOL until a burn transaction is signed. Not personal spend." },
  { sol: 200, use: "Untouched reserve for the first week. This is the buffer that keeps the wallet from running short while the pool is locked." },
] as const;

export function isDevWallet(address: string | null | undefined) {
  return !!address && address === DEV_WALLET;
}

export function interestRule(treasurySol: number) {
  if (treasurySol <= INTEREST_PAUSE_SOL) {
    return {
      id: "closed" as const,
      label: "Rule says closed",
      detail: `Treasury is at or under ${INTEREST_PAUSE_SOL} SOL. Jolsel Interest Pay stays shut.`,
    };
  }
  if (treasurySol < INTEREST_RESUME_SOL) {
    return {
      id: "waiting" as const,
      label: "Between the lines",
      detail: `Above ${INTEREST_PAUSE_SOL} SOL but under ${INTEREST_RESUME_SOL} SOL. The rule does not resume payments in this band.`,
    };
  }
  return {
    id: "eligible" as const,
    label: "Rule would allow it",
    detail: `Treasury is at or above ${INTEREST_RESUME_SOL} SOL. Payments still require the interest program on mainnet. None is deployed.`,
  };
}
