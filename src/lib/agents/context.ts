export type AssetClass = "MEME_COIN" | "TOKENIZED_STOCK" | "PERPETUAL";

export interface CorporateContext {
  timestamp: number;
  walletBalanceUSDT: number;
  activeAssetClass: AssetClass;
  scoutedTokens: any[];
  selectedToken: any | null;
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
}

export function createInitialContext(): CorporateContext {
  return {
    timestamp: Date.now(),
    walletBalanceUSDT: 1.8,
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
  };
}
