export type AssetClass = "MEME_COIN" | "TOKENIZED_STOCK" | "PERPETUAL";

export interface LivePair {
  symbol: string;
  mint: string;
  priceUsd: number;
  liquidityUsd: number;
  volumeH24: number;
  priceChangeH1: number;
  txnsH1: number;
}

export interface CorporateContext {
  timestamp: number;
  walletBalanceUSDT: number;
  activeAssetClass: AssetClass;
  scoutedTokens: LivePair[];
  selectedToken: LivePair | null;
  customIndicatorsScore: number;
  socialSentimentScore: number;
  isWorthIt: boolean;
  reversalProtectionPlan: any | null;
  riskVetoTriggered: boolean;
  vetoReason: string;
  targetPositionSizeUSDT: number;
  slippageMax: number;
  boardroomVotes: { [agentName: string]: string };
  executionApproved: boolean;
  learningBias: number;
  managedMints: string[];
  events: string[];
}

export function createInitialContext(): CorporateContext {
  return {
    timestamp: Date.now(),
    walletBalanceUSDT: 0,
    activeAssetClass: "MEME_COIN",
    scoutedTokens: [],
    selectedToken: null,
    customIndicatorsScore: 0,
    socialSentimentScore: 0,
    isWorthIt: false,
    reversalProtectionPlan: null,
    riskVetoTriggered: false,
    vetoReason: "",
    targetPositionSizeUSDT: 0,
    slippageMax: 1.5,
    boardroomVotes: {},
    executionApproved: false,
    learningBias: 0,
    managedMints: [],
    events: [],
  };
}
