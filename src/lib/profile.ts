export type UserRules = {
  stopLossPct: number; // negative, e.g. -20 means sell if down 20%
  takeProfitPct: number; // positive, e.g. 50 means take profit at +50%
  partialTakePct: number; // % of position to sell on TP, e.g. 30
  maxPositionSol: number;
  managedMints: string[]; // mints the user asked the firm to manage
};

const KEY = "jolsel_user_rules_v1";

const DEFAULT_RULES: UserRules = {
  stopLossPct: -20,
  takeProfitPct: 80,
  partialTakePct: 40,
  maxPositionSol: 0.5,
  managedMints: [],
};

export function loadRules(wallet: string): UserRules {
  if (typeof window === "undefined" || !wallet) return { ...DEFAULT_RULES };
  try {
    const raw = localStorage.getItem(`${KEY}:${wallet}`);
    if (!raw) return { ...DEFAULT_RULES };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_RULES, ...parsed };
  } catch {
    return { ...DEFAULT_RULES };
  }
}

export function saveRules(wallet: string, rules: UserRules) {
  if (typeof window === "undefined" || !wallet) return;
  localStorage.setItem(`${KEY}:${wallet}`, JSON.stringify(rules));
}

export function toggleManagedMint(wallet: string, mint: string): UserRules {
  const rules = loadRules(wallet);
  const set = new Set(rules.managedMints);
  if (set.has(mint)) set.delete(mint);
  else set.add(mint);
  rules.managedMints = Array.from(set);
  saveRules(wallet, rules);
  return rules;
}
