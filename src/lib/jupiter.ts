const SOL = "So11111111111111111111111111111111111111112";
const JUP_QUOTE = "https://quote-api.jup.ag/v6/quote";
const JUP_SWAP = "https://quote-api.jup.ag/v6/swap";

export { SOL };

export async function getQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
}) {
  const sp = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: String(params.amount),
    slippageBps: String(params.slippageBps ?? 100),
  });
  const res = await fetch(`${JUP_QUOTE}?${sp.toString()}`);
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse: params.quoteResponse,
      userPublicKey: params.userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Jupiter swap failed: ${res.status} ${t}`);
  }
  return res.json();
}
