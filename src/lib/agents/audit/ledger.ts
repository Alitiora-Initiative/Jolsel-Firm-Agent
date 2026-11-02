import type { CorporateContext } from "../context";

export interface RunRecord {
  runId: string;
  at: number;
  symbol: string | null;
  mint: string | null;
  score: number | null;
  direction: string | null;
  action: CorporateContext["action"];
  approved: boolean;
  vetoReason: string;
  positionSizeUsd: number;
  safety: string | null;
}

const MAX_RECORDS = 100;
const records: RunRecord[] = [];

/**
 * Process-local ring buffer. Vercel functions may recycle instances, so this is
 * an operational log, not a durable trade ledger.
 */
export function recordRun(ctx: CorporateContext): RunRecord {
  const record: RunRecord = {
    runId: ctx.runId,
    at: ctx.timestamp,
    symbol: ctx.selectedToken?.symbol ?? null,
    mint: ctx.selectedToken?.mint ?? null,
    score: ctx.indicators?.composite ?? null,
    direction: ctx.selectedToken?.direction ?? null,
    action: ctx.action,
    approved: ctx.executionApproved,
    vetoReason: ctx.vetoReason,
    positionSizeUsd: ctx.targetPositionSizeUsd,
    safety: ctx.safety?.status ?? null,
  };
  records.unshift(record);
  if (records.length > MAX_RECORDS) records.length = MAX_RECORDS;
  return record;
}

export function getLedgerStats() {
  const total = records.length;
  const buys = records.filter((r) => r.action === "BUY").length;
  const vetoes = records.filter((r) => r.action === "VETO").length;
  const standAside = records.filter((r) => r.action === "STAND_ASIDE").length;
  return {
    total,
    buys,
    vetoes,
    standAside,
    approvalRatePct: total ? Math.round((buys / total) * 100) : 0,
    note: "In-memory on this server instance; not a durable or financial ledger.",
  };
}

export function getRecentRuns(limit = 20): RunRecord[] {
  return records.slice(0, Math.max(1, Math.min(100, limit)));
}
