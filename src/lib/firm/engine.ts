import { AGENTS } from "./agents";
import type { FirmEvent, LivePair, Mandate } from "./types";

export type CycleResult = {
  events: FirmEvent[];
  mandate: Mandate | null;
  score: number;
  selected: LivePair | null;
  veto: boolean;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/** Score a real DexScreener pair. No invented prices. */
export function scorePair(p: LivePair): number {
  let s = 42;
  if (p.liquidityUsd >= 20_000) s += 12;
  if (p.liquidityUsd >= 80_000) s += 8;
  if (p.volumeH24 >= 40_000) s += 8;
  if (p.volumeH24 >= 250_000) s += 6;
  const tx = p.buysH1 + p.sellsH1;
  if (tx >= 40) s += 8;
  if (tx >= 150) s += 6;
  const ratio = tx > 0 ? p.buysH1 / tx : 0.5;
  if (ratio >= 0.55 && ratio <= 0.78) s += 8;
  if (p.changeH1 >= 4 && p.changeH1 <= 45) s += 14;
  else if (p.changeH1 > 45 && p.changeH1 <= 90) s += 6;
  else if (p.changeH1 > 120) s -= 12;
  else if (p.changeH1 < -8) s -= 10;
  if (p.fdv > 0 && p.liquidityUsd > 0 && p.fdv / p.liquidityUsd > 400 && p.liquidityUsd < 40_000) {
    s -= 14;
  }
  return clamp(Math.round(s), 0, 98);
}

function ev(
  cycle: number,
  n: number,
  from: string,
  to: string,
  kind: FirmEvent["kind"],
  message: string,
): FirmEvent {
  return {
    id: `${cycle}-${n}-${from}`,
    at: Date.now(),
    from,
    to,
    kind,
    message,
  };
}

const usd = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(1)}k`
      : `$${n.toFixed(0)}`;

/**
 * One pass of the Jolsel firm over the live Solana pair tape.
 * Mandates are unsigned — nothing here broadcasts a transaction.
 */
export function runCycle(pairs: LivePair[], cycle: number): CycleResult {
  const events: FirmEvent[] = [];
  let i = 0;
  const push = (
    from: string,
    to: string,
    kind: FirmEvent["kind"],
    message: string,
  ) => {
    events.push(ev(cycle, i++, from, to, kind, message));
  };

  if (!pairs.length) {
    push("bscoter", "analuszer", "scan", "DexScreener Solana tape returned no pairs this cycle.");
    push("teacher", "bscoter", "complete", "Pipeline held. Waiting on the mainnet feed.");
    return { events, mandate: null, score: 0, selected: null, veto: true };
  }

  const ranked = [...pairs].sort((a, b) => scorePair(b) - scorePair(a));
  const top = ranked[0]!;
  const score = scorePair(top);
  const tx = top.buysH1 + top.sellsH1;

  push(
    "bscoter",
    "cryptoGuru",
    "scan",
    `Scanned ${pairs.length} Solana pairs. Lead ${top.baseToken.symbol} on ${top.dexId}.`,
  );
  push(
    "cryptoGuru",
    "analuszer",
    "analysis",
    `${top.baseToken.symbol} 1h flow ${top.buysH1} buys / ${top.sellsH1} sells (${tx} tx).`,
  );
  push(
    "analuszer",
    "forecaster",
    score >= 80 ? "opportunity" : "analysis",
    `${top.baseToken.symbol} precision ${score}. Liq ${usd(top.liquidityUsd)} · 1h ${top.changeH1.toFixed(1)}%.`,
  );

  let veto = false;
  let vetoReason = "";

  if (score < 80) {
    push(
      "forecaster",
      "judge",
      "risk",
      `${top.baseToken.symbol} below the 80 gate. No mandate.`,
    );
    veto = true;
    vetoReason = `Score ${score} under the Analuszer gate.`;
  } else {
    const worth = top.changeH1 > -5 && top.liquidityUsd >= 15_000;
    push(
      "forecaster",
      "longTerm",
      worth ? "opportunity" : "risk",
      worth
        ? `${top.baseToken.symbol} worth a look. Trail idea 25% if a wallet later signs.`
        : `${top.baseToken.symbol} path rejected on momentum or liquidity.`,
    );
    push(
      "longTerm",
      "shortTerm",
      "analysis",
      "Desk stays on MEME_COIN while the book is an unsigned Solana tape.",
    );
    push(
      "shortTerm",
      "overthinker",
      "analysis",
      `Scale-in not armed. Spot only, full size waits on a signed Jupiter swap.`,
    );

    const thin = top.liquidityUsd < 15_000;
    const crash = top.changeH1 <= -25;
    const blowoff = top.changeH1 >= 140;
    const stretched = top.fdv > 0 && top.liquidityUsd > 0 && top.fdv / top.liquidityUsd > 500;

    push(
      "overthinker",
      "reviewer",
      thin || crash ? "risk" : "compliance",
      thin
        ? `Tail risk: liquidity only ${usd(top.liquidityUsd)}.`
        : crash
          ? `Tail risk: 1h print ${top.changeH1.toFixed(1)}%.`
          : "No cascade flag on the public tape.",
    );
    push(
      "reviewer",
      "mrGrumpy",
      stretched ? "risk" : "compliance",
      stretched
        ? `FDV/liquidity stretched (${Math.round(top.fdv / top.liquidityUsd)}×). Not a contract audit.`
        : `Pool ${top.dexId} ${usd(top.liquidityUsd)} visible. Not a mint-authority audit.`,
    );

    if (thin) {
      veto = true;
      vetoReason = "MR_GRUMPY: liquidity under the $15k floor.";
    } else if (crash) {
      veto = true;
      vetoReason = "MR_GRUMPY: 1h drawdown past −25%.";
    } else if (blowoff) {
      veto = true;
      vetoReason = "MR_GRUMPY: 1h extension past +140%.";
    }

    push(
      "mrGrumpy",
      "risk",
      veto ? "veto" : "compliance",
      veto ? vetoReason : "Zero-tolerance scan passed on public metrics.",
    );
    push(
      "risk",
      veto ? "keeper" : "broker",
      veto ? "veto" : "compliance",
      veto
        ? "Survival floor holds. No route requested."
        : "No wallet balance on this desk — size stays a quote, not a fill.",
    );

    if (!veto && worth) {
      push("broker", "judge", "opportunity", `${top.baseToken.symbol} momentum cleared. Asking the chamber.`);
      push("judge", "verdicter", "mandate", `Votes conform. Score ${score} on live tape.`);
      push(
        "verdicter",
        "trader",
        "mandate",
        `Mandate signed for ${top.baseToken.symbol}. Still unsigned — no transaction sent.`,
      );
      push(
        "trader",
        "keeper",
        "route",
        `Jupiter route prepared for ${top.baseToken.symbol} (${top.baseToken.address.slice(0, 4)}…${top.baseToken.address.slice(-4)}).`,
      );
    } else if (!veto && !worth) {
      veto = true;
      vetoReason = "Forecaster: path not worth the route.";
      push("judge", "keeper", "veto", vetoReason);
    }
  }

  push("keeper", "reviewer2", "audit", `Cycle #${cycle} logged. Lead ${top.baseToken.symbol} @ $${top.priceUsd < 0.01 ? top.priceUsd.toExponential(2) : top.priceUsd.toPrecision(4)}.`);
  push(
    "reviewer2",
    "teacher",
    "audit",
    veto ? "Cycle closed without a mandate." : "Mandate recorded. Fill requires a wallet signature.",
  );
  push("teacher", "bscoter", "complete", `Pipeline #${cycle} complete. ${AGENTS.length} desks reported.`);

  const mandate: Mandate | null = veto
    ? {
        id: `v-${cycle}-${top.pairAddress}`,
        at: Date.now(),
        symbol: top.baseToken.symbol,
        mint: top.baseToken.address,
        pairAddress: top.pairAddress,
        side: "VETO",
        score,
        priceUsd: top.priceUsd,
        liquidityUsd: top.liquidityUsd,
        changeH1: top.changeH1,
        reason: vetoReason || "Held.",
        url: top.url,
      }
    : {
        id: `m-${cycle}-${top.pairAddress}`,
        at: Date.now(),
        symbol: top.baseToken.symbol,
        mint: top.baseToken.address,
        pairAddress: top.pairAddress,
        side: "LONG",
        score,
        priceUsd: top.priceUsd,
        liquidityUsd: top.liquidityUsd,
        changeH1: top.changeH1,
        reason: `Unsigned long mandate. Score ${score}. You must sign on Jupiter.`,
        url: top.url,
      };

  return { events, mandate, score, selected: top, veto };
}
