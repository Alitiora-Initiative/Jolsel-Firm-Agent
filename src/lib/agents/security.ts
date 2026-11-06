import { Connection, PublicKey } from "@solana/web3.js";
import { inspectToken2022 } from "@/lib/token2022";
import type { SafetyReport } from "./context";

/**
 * Solana RPC for on-chain mint safety reads. The firm desk is self-custody, so
 * reads target Solana mainnet. A dedicated mainnet RPC (Helius etc.) is preferred
 * via SOLANA_RPC_MAINNET or SOLANA_RPC_URL (server-only); the public mainnet-beta
 * endpoint is the fallback. No API key or query string is logged.
 */
const RPC =
  process.env.SOLANA_RPC_MAINNET ||
  process.env.SOLANA_RPC_URL ||
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  "https://api.mainnet-beta.solana.com";

const CACHE_TTL_MS = 5 * 60_000;
const cache = new Map<string, SafetyReport>();

function connection(): Connection {
  return new Connection(RPC, "confirmed");
}

function isPublicKey(value: string): boolean {
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Real on-chain mint inspection. If the RPC cannot answer, the result is
 * "unverified" — never a fabricated "safe".
 */
export async function inspectMintSafety(mint: string): Promise<SafetyReport> {
  const cached = cache.get(mint);
  if (cached && cached.checkedAt && Date.now() - cached.checkedAt < CACHE_TTL_MS) {
    return cached;
  }

  const base: SafetyReport = {
    mint,
    status: "unverified",
    program: "unknown",
    mintAuthority: null,
    freezeAuthority: null,
    transferFeeBps: null,
    permanentDelegate: null,
    transferHook: null,
    nonTransferable: false,
    warnings: [],
    checkedAt: null,
  };

  if (!isPublicKey(mint)) {
    return { ...base, status: "blocked", warnings: ["Mint address is not a valid Solana public key."], checkedAt: Date.now() };
  }

  try {
    const info = await inspectToken2022(connection(), mint);
    const warnings = [...info.warnings];
    const blocked =
      info.nonTransferable ||
      Boolean(info.permanentDelegate) ||
      Boolean(info.transferHookProgramId) ||
      Boolean(info.freezeAuthority) ||
      Boolean(info.mintAuthority);

    if (info.mintAuthority) warnings.push("Mint authority is still active (supply can be inflated).");
    if (info.freezeAuthority) warnings.push("Freeze authority is still active (accounts can be frozen).");
    if (info.transferFee && info.transferFee.transferFeeBasisPoints > 0) {
      warnings.push(`Token-2022 transfer fee: ${info.transferFee.transferFeeBasisPoints / 100}%.`);
    }

    const status: SafetyReport["status"] =
      blocked && (info.nonTransferable || info.permanentDelegate || info.transferHookProgramId || info.freezeAuthority)
        ? "blocked"
        : blocked
          ? "warn"
          : info.program === "unknown"
            ? "unverified"
            : "safe";

    const report: SafetyReport = {
      mint,
      status,
      program: info.program,
      mintAuthority: info.mintAuthority,
      freezeAuthority: info.freezeAuthority,
      transferFeeBps: info.transferFee?.transferFeeBasisPoints ?? null,
      permanentDelegate: info.permanentDelegate,
      transferHook: info.transferHookProgramId,
      nonTransferable: info.nonTransferable,
      warnings,
      checkedAt: Date.now(),
    };
    cache.set(mint, report);
    return report;
  } catch (e: any) {
    return {
      ...base,
      status: "unverified",
      warnings: [`On-chain safety check unavailable: ${e?.message ?? "RPC error"}`],
      checkedAt: Date.now(),
    };
  }
}
