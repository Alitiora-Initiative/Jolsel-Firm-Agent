import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { runFirmCycle } from "@/lib/agents/engine";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const hits = new Map<string, { at: number; count: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.at > WINDOW_MS) {
    hits.set(ip, { at: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function validPublicKey(value: unknown): value is string {
  if (typeof value !== "string" || value.length < 32 || value.length > 44) return false;
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

function parseInput(raw: any) {
  const mint = raw?.mint;
  const walletPublicKey = raw?.walletPublicKey;
  const balance = Number(raw?.walletBalanceUsd ?? 0);
  const slippage = Number(raw?.slippageBps ?? 100);

  if (mint !== undefined && !validPublicKey(mint)) {
    throw new Error("mint must be a valid Solana public key");
  }
  if (walletPublicKey !== undefined && !validPublicKey(walletPublicKey)) {
    throw new Error("walletPublicKey must be a valid Solana public key");
  }
  if (!Number.isFinite(balance) || balance < 0 || balance > 1_000_000_000) {
    throw new Error("walletBalanceUsd must be a finite number between 0 and 1e9");
  }
  if (!Number.isFinite(slippage) || slippage < 10 || slippage > 300) {
    throw new Error("slippageBps must be between 10 and 300");
  }

  return {
    mint: mint as string | undefined,
    walletPublicKey: walletPublicKey as string | undefined,
    walletBalanceUsd: balance,
    slippageBps: Math.round(slippage),
  };
}

async function handle(req: NextRequest, raw: any) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many firm runs. Retry in a minute." }, { status: 429 });
  }

  try {
    const input = parseInput(raw);
    const result = await runFirmCycle(input);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "firm run failed" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return handle(req, {
    mint: sp.get("mint") ?? undefined,
    walletPublicKey: sp.get("walletPublicKey") ?? undefined,
    walletBalanceUsd: sp.get("walletBalanceUsd") ?? 0,
    slippageBps: sp.get("slippageBps") ?? 100,
  });
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  return handle(req, body);
}
