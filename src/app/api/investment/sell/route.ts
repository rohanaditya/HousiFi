import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, investorAddress, tokenAmount, usdcReceived, txHash } = body;

    if (!propertyId || !investorAddress || !tokenAmount || !usdcReceived || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ETH_ADDRESS_RE.test(investorAddress)) {
      return NextResponse.json({ error: "Invalid investor address" }, { status: 400 });
    }

    if (!TX_HASH_RE.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    const numericTokenAmount = Number(tokenAmount);
    const numericUsdcReceived = Number(usdcReceived);
    if (!Number.isFinite(numericTokenAmount) || numericTokenAmount <= 0 || numericTokenAmount > 100) {
      return NextResponse.json({ error: "Invalid token amount" }, { status: 400 });
    }
    if (!Number.isFinite(numericUsdcReceived) || numericUsdcReceived <= 0 || numericUsdcReceived > 1_000_000_000) {
      return NextResponse.json({ error: "Invalid USDC amount" }, { status: 400 });
    }

    const { error: updateInvestmentError } = await supabase
      .from("investments")
      .update({
        status: "sold",
        sell_tx_hash: txHash,
        sold_at: new Date().toISOString(),
      })
      .ilike("investor_address", investorAddress)
      .eq("property_id", propertyId)
      .eq("status", "active");

    if (updateInvestmentError) {
      return NextResponse.json({ error: updateInvestmentError.message }, { status: 500 });
    }

    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("remaining, investor_count")
      .eq("id", propertyId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: updatePropertyError } = await supabase
      .from("properties")
      .update({
        remaining: property.remaining + numericTokenAmount,
        investor_count: Math.max((property.investor_count ?? 1) - 1, 0),
      })
      .eq("id", propertyId);

    if (updatePropertyError) {
      return NextResponse.json({ error: updatePropertyError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[investment/sell]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
