import type { AgentDef } from "./types";

/** The 17 desks from the Jolsel multi-agent firm. Order is orbital order. */
export const AGENTS: AgentDef[] = [
  { id: "bscoter", name: "Bscoter", role: "Scouts liquid pairs", dept: "discovery", icon: "radar" },
  { id: "cryptoGuru", name: "Crypto Guru", role: "Crowd velocity", dept: "discovery", icon: "waves" },
  { id: "analuszer", name: "Analuszer", role: "Precision score", dept: "discovery", icon: "chart" },
  { id: "forecaster", name: "Forecaster", role: "Worth-it paths", dept: "planning", icon: "trend" },
  { id: "longTerm", name: "Long-Term Planner", role: "Asset-class router", dept: "planning", icon: "compass" },
  { id: "shortTerm", name: "Short-Term Planner", role: "Scale-in steps", dept: "planning", icon: "timer" },
  { id: "overthinker", name: "Overthinker", role: "Tail-risk map", dept: "compliance", icon: "brain" },
  { id: "reviewer", name: "Reviewer", role: "Pool structure", dept: "compliance", icon: "search" },
  { id: "mrGrumpy", name: "Mr Grumpy", role: "Zero-tolerance gate", dept: "compliance", icon: "alert" },
  { id: "risk", name: "Risk Manager", role: "Survival floor", dept: "compliance", icon: "shield" },
  { id: "broker", name: "Broker", role: "Momentum route", dept: "executive", icon: "zap" },
  { id: "judge", name: "Judge", role: "Vote aggregate", dept: "executive", icon: "scale" },
  { id: "verdicter", name: "Verdicter", role: "Signs mandate", dept: "executive", icon: "badge" },
  { id: "trader", name: "Trader", role: "Unsigned Jupiter route", dept: "executive", icon: "swap" },
  { id: "keeper", name: "Record Keeper", role: "Cycle ledger", dept: "audit", icon: "db" },
  { id: "reviewer2", name: "Record Reviewer", role: "Cycle quality", dept: "audit", icon: "file" },
  { id: "teacher", name: "Teacher", role: "Pipeline close", dept: "audit", icon: "grad" },
];

export const DEPT_COLOR: Record<AgentDef["dept"], string> = {
  discovery: "var(--color-cyan)",
  planning: "var(--color-violet)",
  compliance: "var(--color-amber)",
  executive: "var(--color-mint)",
  audit: "var(--color-ember)",
};
