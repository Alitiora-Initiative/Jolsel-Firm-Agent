const SOL = "So11111111111111111111111111111111111111112";
// Use Jupiter Lite API (more reliable in constrained environments)
const JUP_QUOTE = "https://lite-api.jup.ag/swap/v1/quote";
const JUP_SWAP = "https://lite-api.jup.ag/swap/v1/swap";

export { SOL };

export type JupiterQuoteLike = {
  inputMint?: string;
  outputMint?: string;
  inAmount?: string;
  outAmount?: string;
  otherAmountThreshold?: string;
  priceImpactPct?: string | number;
  slippageBps?: number;
  routePlan?: Array<{ swapInfo?: { label?: string } }>;
};

export function summarizeQuote(raw: JupiterQuoteLike, slippageBps = 100) {
  const impact = Number(raw.priceImpactPct ?? 0);
  return {
    inputMint: raw.inputMint ?? "",
    outputMint: raw.outputMint ?? "",
    inAmount: raw.inAmount ?? "0",
    outAmount: raw.outAmount ?? "0",
    otherAmountThreshold: raw.otherAmountThreshold ?? "0",
    priceImpactPct: Number.isFinite(impact) ? Math.round(impact * 10000) / 10000 : 0,
    slippageBps,
    route: (raw.routePlan ?? [])
      .map((step) => step.swapInfo?.label)
      .filter((label): label is string => Boolean(label)),
  };
}

export async function getQuote(params: {
  inputMint: string;
  outputMint: string;
  /** Raw amount in smallest units (lamports / SPL base units) */
  amount: number | string;
  slippageBps?: number;
}) {
  const sp = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: String(params.amount),
    slippageBps: String(params.slippageBps ?? 100),
  });
  const res = await fetch(`${JUP_QUOTE}?${sp.toString()}`, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Jupiter quote failed: ${res.status} ${t}`);
  }
  return res.json();
}

export async function getSwapTransaction(params: {
  quoteResponse: any;
  userPublicKey: string;
}) {
  const res = await fetch(JUP_SWAP, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Jupiter swap failed: ${res.status} ${t}`);
  }
  return res.json();
}
