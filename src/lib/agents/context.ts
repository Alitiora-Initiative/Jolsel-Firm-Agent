import type { DexPair } from "@/lib/dexscreener";

export type AssetClass = "MEME_COIN" | "TOKENIZED_STOCK" | "PERPETUAL";
/** LONG = buy candidate. SHORT = stand aside / exit signal; this desk is spot-only. */
export type TradeDirection = "LONG" | "SHORT";
export type AgentLevel = "info" | "warn" | "success" | "trade" | "veto";
export type Vote = "YES" | "NO" | "ABSTAIN";

export interface AgentEvent {
  id: string;
  at: number;
  agent: string;
  message: string;
  level: AgentLevel;
}

export interface Indicators {
  /** Signed momentum score in [-100, 100] */
  momentum: number;
  trend: number;
  orderFlow: number;
  liquidityDepth: number;
  volumeQuality: number;
  volatility: number;
  composite: number;
}

export interface TokenCandidate {
  mint: string;
  symbol: string;
  name: string;
  pairAddress: string;
  dexId: string;
  quoteSymbol: string;
  priceUsd: number;
  liquidityUsd: number;
  volumeM5Usd: number;
  volumeH1Usd: number;
  volumeH24Usd: number;
  changeM5: number | null;
  changeH1: number | null;
  changeH6: number | null;
  changeH24: number | null;
  buysH1: number;
  sellsH1: number;
  pairAgeMinutes: number | null;
  score: number;
  direction: TradeDirection;
  indicators: Indicators;
}

export interface SafetyReport {
  mint: string;
  status: "unverified" | "safe" | "warn" | "blocked";
  program: "spl-token" | "token-2022" | "unknown";
  mintAuthority: string | null;
  freezeAuthority: string | null;
  transferFeeBps: number | null;
  permanentDelegate: string | null;
  transferHook: string | null;
  nonTransferable: boolean;
  warnings: string[];
  checkedAt: number | null;
  error?: string;
}

export interface JupiterQuoteSummary {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  priceImpactPct: number;
  slippageBps: number;
  route: string[];
}

export interface BoardVote {
  vote: Vote;
  reason: string;
  weight: number;
}

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
  runId: string;
  timestamp: number;
  pairs: DexPair[];
  candidates: TokenCandidate[];
  selectedToken: TokenCandidate | null;
  indicators: Indicators | null;
  orderFlowScore: number | null;
  /** No social API is configured, so this is always null instead of a fabricated score. */
  socialSentimentScore: null;
  walletBalanceUsd: number;
  walletPublicKey: string | null;
  activeAssetClass: AssetClass;
  scoutedTokens: LivePair[];
  selectedToken: LivePair | null;
  customIndicatorsScore: number;
  socialSentimentScore: number;
  isWorthIt: boolean;
  tradeDirection: TradeDirection;
  expectedMovePct: number;
  roundTripCostPct: number | null;
  reversalProtectionPlan: {
    trailingStopLossPercent: number;
    takeProfitPercent: number;
    partialExitTrigger: string;
  } | null;
  targetPositionSizeUsd: number;
  slippageBps: number;
  priceImpactPct: number | null;
  safety: SafetyReport | null;
  riskVetoTriggered: boolean;
  vetoReason: string;
  boardroomVotes: Record<string, BoardVote>;
  executionApproved: boolean;
  action: "BUY" | "STAND_ASIDE" | "VETO";
  quote: JupiterQuoteSummary | null;
  quoteResponse: unknown | null;
  swapTransaction: string | null;
  events: AgentEvent[];
}

export function createInitialContext(args: {
  pairs: DexPair[];
  walletBalanceUsd?: number;
  walletPublicKey?: string;
  slippageBps?: number;
}): CorporateContext {
  return {
    runId: `run_${Date.now().toString(36)}`,
    timestamp: Date.now(),
    pairs: args.pairs,
    candidates: [],
    selectedToken: null,
    indicators: null,
    orderFlowScore: null,
    socialSentimentScore: null,
    walletBalanceUsd: Math.max(0, args.walletBalanceUsd ?? 0),
    walletPublicKey: args.walletPublicKey ?? null,
    activeAssetClass: "MEME_COIN",
    isWorthIt: false,
    tradeDirection: "LONG",
    expectedMovePct: 0,
    roundTripCostPct: null,
    reversalProtectionPlan: null,
    targetPositionSizeUsd: 0,
    slippageBps: Math.min(300, Math.max(10, args.slippageBps ?? 100)),
    priceImpactPct: null,
    safety: null,
    riskVetoTriggered: false,
    vetoReason: "",
    boardroomVotes: {},
    executionApproved: false,
    learningBias: 0,
    managedMints: [],
    action: "STAND_ASIDE",
    quote: null,
    quoteResponse: null,
    swapTransaction: null,
    events: [],
  };
}
