import { Connection, PublicKey } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMint,
  getTransferFeeConfig,
  getPermanentDelegate,
  getMetadataPointerState,
  getTransferHook,
  getInterestBearingMintConfigState,
  getMintCloseAuthority,
  getDefaultAccountState,
  unpackMint,
  getExtensionTypes,
} from "@solana/spl-token";

export type TokenProgramKind = "spl-token" | "token-2022" | "unknown";

export type TransferFeeInfo = {
  transferFeeBasisPoints: number;
  maximumFee: string;
  olderTransferFee?: { epoch: string; maximumFee: string; transferFeeBasisPoints: number };
  newerTransferFee?: { epoch: string; maximumFee: string; transferFeeBasisPoints: number };
  transferFeeConfigAuthority: string | null;
  withdrawWithheldAuthority: string | null;
};

export type Token2022Info = {
  mint: string;
  program: TokenProgramKind;
  programId: string;
  decimals: number;
  supply: string;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  isInitialized: boolean;
  extensions: ExtensionType[];
  extensionLabels: string[];
  transferFee: TransferFeeInfo | null;
  permanentDelegate: string | null;
  nonTransferable: boolean;
  transferHookProgramId: string | null;
  metadataPointer: string | null;
  interestBearing: { rate: number; currentRate: number } | null;
  mintCloseAuthority: string | null;
  defaultAccountState: string | null;
  warnings: string[];
};

const EXT_LABEL: Partial<Record<ExtensionType, string>> = {
  [ExtensionType.TransferFeeConfig]: "Transfer Fee",
  [ExtensionType.TransferFeeAmount]: "Transfer Fee Amount",
  [ExtensionType.MintCloseAuthority]: "Mint Close Authority",
  [ExtensionType.ConfidentialTransferMint]: "Confidential Transfer",
  [ExtensionType.DefaultAccountState]: "Default Account State",
  [ExtensionType.ImmutableOwner]: "Immutable Owner",
  [ExtensionType.MemoTransfer]: "Memo Required",
  [ExtensionType.NonTransferable]: "Non-Transferable",
  [ExtensionType.InterestBearingConfig]: "Interest Bearing",
  [ExtensionType.CpiGuard]: "CPI Guard",
  [ExtensionType.PermanentDelegate]: "Permanent Delegate",
  [ExtensionType.TransferHook]: "Transfer Hook",
  [ExtensionType.MetadataPointer]: "Metadata Pointer",
  [ExtensionType.TokenMetadata]: "Token Metadata",
  [ExtensionType.GroupPointer]: "Group Pointer",
  [ExtensionType.GroupMemberPointer]: "Group Member Pointer",
  [ExtensionType.ScaledUiAmountConfig]: "Scaled UI Amount",
  [ExtensionType.PausableConfig]: "Pausable",
};

function labelOf(ext: ExtensionType): string {
  return EXT_LABEL[ext] ?? `Extension(${ext})`;
}

async function tryGetMint(connection: Connection, mint: PublicKey) {
  // Prefer Token-2022 first for memecoins that use extensions
  try {
    const info = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
    return { info, programId: TOKEN_2022_PROGRAM_ID, program: "token-2022" as const };
  } catch {
    /* fall through */
  }
  try {
    const info = await getMint(connection, mint, "confirmed", TOKEN_PROGRAM_ID);
    return { info, programId: TOKEN_PROGRAM_ID, program: "spl-token" as const };
  } catch {
    return null;
  }
}

/**
 * Inspect a mint for Token-2022 extensions relevant to trading risk.
 */
export async function inspectToken2022(
  connection: Connection,
  mintStr: string
): Promise<Token2022Info> {
  const mint = new PublicKey(mintStr);
  const resolved = await tryGetMint(connection, mint);

  if (!resolved) {
    return {
      mint: mintStr,
      program: "unknown",
      programId: "",
      decimals: 0,
      supply: "0",
      mintAuthority: null,
      freezeAuthority: null,
      isInitialized: false,
      extensions: [],
      extensionLabels: [],
      transferFee: null,
      permanentDelegate: null,
      nonTransferable: false,
      transferHookProgramId: null,
      metadataPointer: null,
      interestBearing: null,
      mintCloseAuthority: null,
      defaultAccountState: null,
      warnings: ["Unable to load mint (not found on Token or Token-2022 program)."],
    };
  }

  const { info, programId, program } = resolved;
  const warnings: string[] = [];
  const extensions =
    program === "token-2022" && info.tlvData
      ? getExtensionTypes(info.tlvData)
      : [];

  let transferFee: TransferFeeInfo | null = null;
  let permanentDelegate: string | null = null;
  let nonTransferable = false;
  let transferHookProgramId: string | null = null;
  let metadataPointer: string | null = null;
  let interestBearing: Token2022Info["interestBearing"] = null;
  let mintCloseAuthority: string | null = null;
  let defaultAccountState: string | null = null;

  if (program === "token-2022") {
    try {
      const fee = getTransferFeeConfig(info);
      if (fee) {
        const newer = fee.newerTransferFee;
        transferFee = {
          transferFeeBasisPoints: newer.transferFeeBasisPoints,
          maximumFee: newer.maximumFee.toString(),
          newerTransferFee: {
            epoch: newer.epoch.toString(),
            maximumFee: newer.maximumFee.toString(),
            transferFeeBasisPoints: newer.transferFeeBasisPoints,
          },
          olderTransferFee: {
            epoch: fee.olderTransferFee.epoch.toString(),
            maximumFee: fee.olderTransferFee.maximumFee.toString(),
            transferFeeBasisPoints: fee.olderTransferFee.transferFeeBasisPoints,
          },
          transferFeeConfigAuthority: fee.transferFeeConfigAuthority?.toBase58() ?? null,
          withdrawWithheldAuthority: fee.withdrawWithheldAuthority?.toBase58() ?? null,
        };
        if (newer.transferFeeBasisPoints > 0) {
          warnings.push(
            `Transfer fee ${newer.transferFeeBasisPoints / 100}% on transfers (max fee ${newer.maximumFee.toString()} base units).`
          );
        }
      }
    } catch {
      /* no fee ext */
    }

    try {
      const del = getPermanentDelegate(info);
      if (del?.delegate) {
        permanentDelegate = del.delegate.toBase58();
        warnings.push(`Permanent delegate can move/burn tokens: ${permanentDelegate.slice(0, 8)}…`);
      }
    } catch {
      /* */
    }

    if (extensions.includes(ExtensionType.NonTransferable)) {
      nonTransferable = true;
      warnings.push("Non-transferable (soulbound) — cannot trade on open market.");
    }

    try {
      const hook = getTransferHook(info);
      if (hook?.programId) {
        transferHookProgramId = hook.programId.toBase58();
        warnings.push(`Transfer hook program: ${transferHookProgramId.slice(0, 8)}… (custom CPI on every transfer).`);
      }
    } catch {
      /* */
    }

    try {
      const ptr = getMetadataPointerState(info);
      if (ptr?.metadataAddress) metadataPointer = ptr.metadataAddress.toBase58();
    } catch {
      /* */
    }

    try {
      const ib = getInterestBearingMintConfigState(info);
      if (ib) {
        interestBearing = {
          rate: ib.preUpdateAverageRate,
          currentRate: ib.currentRate,
        };
      }
    } catch {
      /* */
    }

    try {
      const close = getMintCloseAuthority(info);
      if (close?.closeAuthority) mintCloseAuthority = close.closeAuthority.toBase58();
    } catch {
      /* */
    }

    try {
      const das = getDefaultAccountState(info);
      if (das) defaultAccountState = String(das.state);
    } catch {
      /* */
    }
  }

  if (info.freezeAuthority) {
    warnings.push(`Freeze authority active: ${info.freezeAuthority.toBase58().slice(0, 8)}…`);
  }
  if (info.mintAuthority) {
    warnings.push(`Mint authority can inflate supply: ${info.mintAuthority.toBase58().slice(0, 8)}…`);
  }

  return {
    mint: mintStr,
    program,
    programId: programId.toBase58(),
    decimals: info.decimals,
    supply: info.supply.toString(),
    mintAuthority: info.mintAuthority?.toBase58() ?? null,
    freezeAuthority: info.freezeAuthority?.toBase58() ?? null,
    isInitialized: info.isInitialized,
    extensions,
    extensionLabels: extensions.map(labelOf),
    transferFee,
    permanentDelegate,
    nonTransferable,
    transferHookProgramId,
    metadataPointer,
    interestBearing,
    mintCloseAuthority,
    defaultAccountState,
    warnings,
  };
}

/** Estimate transfer fee in base units for a given amount (Token-2022). */
export function estimateTransferFee(
  amount: bigint,
  fee: TransferFeeInfo | null
): bigint {
  if (!fee || fee.transferFeeBasisPoints <= 0) return 0n;
  const bps = BigInt(fee.transferFeeBasisPoints);
  const raw = (amount * bps) / 10000n;
  const max = BigInt(fee.maximumFee);
  return raw > max ? max : raw;
}

export { ExtensionType, TOKEN_2022_PROGRAM_ID };
