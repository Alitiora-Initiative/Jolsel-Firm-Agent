export type LivePair = {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: { address: string; name: string; symbol: string };
  quoteToken: { symbol: string };
  priceUsd: number;
  changeH1: number;
  changeH24: number;
  volumeH24: number;
  liquidityUsd: number;
  buysH1: number;
  sellsH1: number;
  fdv: number;
  url: string;
};

export type EventKind =
  | "scan"
  | "analysis"
  | "opportunity"
  | "risk"
  | "compliance"
  | "veto"
  | "mandate"
  | "route"
  | "audit"
  | "complete";

export type FirmEvent = {
  id: string;
  at: number;
  from: string;
  to: string;
  kind: EventKind;
  message: string;
};

export type Mandate = {
  id: string;
  at: number;
  symbol: string;
  mint: string;
  pairAddress: string;
  side: "LONG" | "VETO";
  score: number;
  priceUsd: number;
  liquidityUsd: number;
  changeH1: number;
  reason: string;
  url: string;
};

export type AgentDef = {
  id: string;
  name: string;
  role: string;
  dept: "discovery" | "planning" | "compliance" | "executive" | "audit";
  icon: string;
};
