import { NextResponse } from "next/server";
import { getTrendingSolana, getLatestProfiles, getBoostedTokens } from "@/lib/dexscreener";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [pairs, profiles, boosts] = await Promise.all([
      getTrendingSolana(),
      getLatestProfiles().catch(() => []),
      getBoostedTokens().catch(() => []),
    ]);
    return NextResponse.json({
      pairs,
      profiles: (profiles || []).filter((p: any) => p.chainId === "solana").slice(0, 20),
      boosts: (boosts || []).filter((p: any) => p.chainId === "solana").slice(0, 20),
      ts: Date.now(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message, pairs: [] }, { status: 500 });
  }
}
