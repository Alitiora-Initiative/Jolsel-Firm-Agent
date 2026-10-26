export type LearningRecord = {
  agent: string;
  token: string;
  score: number;
  outcome?: "win" | "loss" | "pending";
  pnlPct?: number;
  ts: number;
};

const KEY = "jolsel_agent_learning_v1";

export function loadLearning(): LearningRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLearning(records: LearningRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(records.slice(0, 500))); // keep last 500
}

export function recordDecision(agent: string, token: string, score: number) {
  const records = loadLearning();
  records.unshift({ agent, token, score, outcome: "pending", ts: Date.now() });
  saveLearning(records);
}

export function recordOutcome(token: string, pnlPct: number) {
  const records = loadLearning();
  for (const r of records) {
    if (r.token === token && r.outcome === "pending") {
      r.outcome = pnlPct >= 0 ? "win" : "loss";
      r.pnlPct = pnlPct;
    }
  }
  saveLearning(records);
}

export function getAgentWinRate(agent: string): number {
  const records = loadLearning().filter((r) => r.agent === agent && r.outcome && r.outcome !== "pending");
  if (!records.length) return 0.5;
  const wins = records.filter((r) => r.outcome === "win").length;
  return wins / records.length;
}

export function getAdjustedScoreBias(agent: string): number {
  const wr = getAgentWinRate(agent);
  // Bias: if win rate > 55% boost scores a bit, if < 45% penalize
  return (wr - 0.5) * 20;
}
