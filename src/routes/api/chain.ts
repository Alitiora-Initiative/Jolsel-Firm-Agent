import { createFileRoute } from "@tanstack/react-router";
import { TREASURY_WALLET } from "@/lib/chain/protocol";

const RPCS = ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"];
const SOL_MINT = "So11111111111111111111111111111111111111112";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function okAddress(v: string | null) {
  return !!v && BASE58.test(v);
}

function lamportsOf(result: unknown): number {
  if (typeof result === "number") return result;
  if (result && typeof result === "object" && "value" in result) {
    const value = (result as { value: unknown }).value;
    if (typeof value === "number") return value;
  }
  return 0;
}

async function rpc(method: string, params: unknown[]) {
  let last = "RPC failed";
  for (const url of RPCS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      });
      if (!res.ok) {
        last = `${url} ${res.status}`;
        continue;
      }
      const body = (await res.json()) as { result?: unknown; error?: { message?: string } };
      if (body.error) {
        last = body.error.message || "RPC error";
        continue;
      }
      return body.result;
    } catch (err) {
      last = err instanceof Error ? err.message : "RPC failed";
    }
  }
  throw new Error(last);
}

type ParsedToken = {
  account?: {
    data?: {
      parsed?: {
        info?: {
          mint?: string;
          tokenAmount?: { amount?: string; decimals?: number; uiAmount?: number | null };
        };
      };
    };
  };
};

async function tokensOf(owner: string) {
  const out: { mint: string; amount: string; decimals: number; ui: number }[] = [];
  for (const programId of [TOKEN_PROGRAM, TOKEN_2022]) {
    const result = (await rpc("getTokenAccountsByOwner", [
      owner,
      { programId },
      { encoding: "jsonParsed" },
    ])) as { value?: ParsedToken[] };
    for (const row of result.value ?? []) {
      const info = row.account?.data?.parsed?.info;
      const ui = info?.tokenAmount?.uiAmount;
      if (!info?.mint || !ui) continue;
      out.push({
        mint: info.mint,
        amount: info.tokenAmount?.amount || "0",
        decimals: info.tokenAmount?.decimals ?? 0,
        ui,
      });
    }
  }
  return out.sort((a, b) => b.ui - a.ui).slice(0, 24);
}

async function solPrice() {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${SOL_MINT}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    pairs?: { chainId?: string; priceUsd?: string; liquidity?: { usd?: number } }[];
  };
  const pairs = (body.pairs ?? [])
    .filter((p) => p.chainId === "solana" && p.priceUsd)
    .sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0));
  const n = Number(pairs[0]?.priceUsd);
  return Number.isFinite(n) ? n : null;
}

export const Route = createFileRoute("/api/chain")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet");
        const mint = url.searchParams.get("mint");
        if (wallet && !okAddress(wallet)) {
          return Response.json({ error: "Bad wallet address" }, { status: 400 });
        }
        if (mint && !okAddress(mint)) {
          return Response.json({ error: "Bad mint address" }, { status: 400 });
        }
        try {
          const [treasuryBal, sigs, price, walletBal, walletTokens, mintInfo] = await Promise.all([
            rpc("getBalance", [TREASURY_WALLET]),
            rpc("getSignaturesForAddress", [TREASURY_WALLET, { limit: 12 }]) as Promise<
              { signature: string; blockTime: number | null; err: unknown; memo: string | null }[]
            >,
            solPrice(),
            wallet ? rpc("getBalance", [wallet]) : Promise.resolve(null),
            wallet ? tokensOf(wallet) : Promise.resolve(null),
            mint
              ? (rpc("getAccountInfo", [mint, { encoding: "jsonParsed" }]) as Promise<{
                  value: {
                    data?: { parsed?: { type?: string; info?: { supply?: string; decimals?: number } } };
                  } | null;
                }>)
              : Promise.resolve(null),
          ]);
          const lamports = lamportsOf(treasuryBal);
          const walletSol = walletBal == null ? null : lamportsOf(walletBal);
          const parsed = mintInfo?.value?.data?.parsed;
          const mintOk = parsed?.type === "mint";
          return Response.json({
            ts: Date.now(),
            solPriceUsd: price,
            treasury: {
              address: TREASURY_WALLET,
              lamports,
              sol: lamports / 1_000_000_000,
            },
            signatures: (sigs ?? []).map((s) => ({
              signature: s.signature,
              blockTime: s.blockTime,
              err: !!s.err,
              memo: s.memo,
            })),
            wallet: wallet
              ? { address: wallet, sol: (walletSol ?? 0) / 1_000_000_000, tokens: walletTokens ?? [] }
              : null,
            mint: mint
              ? {
                  address: mint,
                  exists: !!mintOk,
                  supply: mintOk ? parsed?.info?.supply || "0" : "0",
                  decimals: mintOk ? parsed?.info?.decimals ?? 0 : 0,
                }
              : null,
          });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Chain read failed", ts: Date.now() },
            { status: 200 },
          );
        }
      },
    },
  },
});
