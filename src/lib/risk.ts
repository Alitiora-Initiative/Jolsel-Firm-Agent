export type RiskCheckInput = {
  liveMode: boolean;
  currentDrawdownPct: number;
  dailyLossPct: number;
  positionSizePct: number;
  walletBalanceUsd: number;
  executionApprovedByUser: boolean;
};

export const defaultRiskLimits = {
  maxDrawdownPct: 12,
  maxDailyLossPct: 8,
  maxPositionSizePct: 25,
  minimumWalletBalanceUsd: 25,
};

export function evaluateRisk(input: RiskCheckInput): {
  ok: boolean;
  reason: string | null;
  limits: typeof defaultRiskLimits;
} {
  const {
    liveMode,
    currentDrawdownPct,
    dailyLossPct,
    positionSizePct,
    walletBalanceUsd,
    executionApprovedByUser,
  } = input;

  if (!executionApprovedByUser) {
    return {
      ok: false,
      reason: "Execution requires explicit user approval before any trade can be proposed or sent.",
      limits: defaultRiskLimits,
    };
  }

  if (walletBalanceUsd < defaultRiskLimits.minimumWalletBalanceUsd) {
    return {
      ok: false,
      reason: `Wallet balance is too low to safely trade. Minimum required: $${defaultRiskLimits.minimumWalletBalanceUsd}.`,
      limits: defaultRiskLimits,
    };
  }

  if (currentDrawdownPct > defaultRiskLimits.maxDrawdownPct) {
    return {
      ok: false,
      reason: `Current drawdown ${currentDrawdownPct}% exceeds the maximum allowed ${defaultRiskLimits.maxDrawdownPct}%.`,
      limits: defaultRiskLimits,
    };
  }

  if (dailyLossPct > defaultRiskLimits.maxDailyLossPct) {
    return {
      ok: false,
      reason: `Daily loss ${dailyLossPct}% exceeds the maximum allowed ${defaultRiskLimits.maxDailyLossPct}%.`,
      limits: defaultRiskLimits,
    };
  }

  if (positionSizePct > defaultRiskLimits.maxPositionSizePct) {
    return {
      ok: false,
      reason: `Position size ${positionSizePct}% exceeds the maximum allowed ${defaultRiskLimits.maxPositionSizePct}%.`,
      limits: defaultRiskLimits,
    };
  }

  if (!liveMode) {
    return {
      ok: true,
      reason: "Demo mode is enabled. Risk check passed, but no live execution is allowed.",
      limits: defaultRiskLimits,
    };
  }

  return {
    ok: true,
    reason: null,
    limits: defaultRiskLimits,
  };
}
