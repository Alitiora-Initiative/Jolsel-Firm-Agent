import { createFileRoute } from "@tanstack/react-router";

const SOL = "So11111111111111111111111111111111111111112";

export const Route = createFileRoute("/api/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const outputMint = url.searchParams.get("mint") || "";
        const lamports = url.searchParams.get("amount") || "50000000";
        if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(outputMint)) {
          return Response.json({ error: "mint required" }, { status: 400 });
        }
        const q = new URL("https://quote-api.jup.ag/v6/quote");
        q.searchParams.set("inputMint", SOL);
        q.searchParams.set("outputMint", outputMint);
        q.searchParams.set("amount", lamports);
        q.searchParams.set("slippageBps", "100");
        try {
          const res = await fetch(q, { headers: { accept: "application/json" } });
          const text = await res.text();
          if (!res.ok) {
            return Response.json(
              { error: `Jupiter ${res.status}`, detail: text.slice(0, 280) },
              { status: 502 },
            );
          }
          const quote = JSON.parse(text) as {
            inAmount?: string;
            outAmount?: string;
            priceImpactPct?: string;
            routePlan?: { swapInfo?: { label?: string } }[];
          };
          const labels = (quote.routePlan ?? [])
            .map((s) => s.swapInfo?.label)
            .filter((x): x is string => !!x);
          return Response.json({
            inAmount: quote.inAmount,
            outAmount: quote.outAmount,
            priceImpactPct: quote.priceImpactPct,
            labels: [...new Set(labels)].slice(0, 4),
            input: "0.05 SOL",
          });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "quote failed" },
            { status: 502 },
          );
        }
      },
    },
  },
});
