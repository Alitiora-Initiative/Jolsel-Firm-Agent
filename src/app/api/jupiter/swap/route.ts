import { NextRequest, NextResponse } from "next/server";
import { getSwapTransaction } from "@/lib/jupiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.quoteResponse || !body.userPublicKey) {
      return NextResponse.json({ error: "missing quoteResponse or userPublicKey" }, { status: 400 });
    }
    const data = await getSwapTransaction({
      quoteResponse: body.quoteResponse,
      userPublicKey: body.userPublicKey,
    });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
