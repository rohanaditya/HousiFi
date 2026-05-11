import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/;
const VALID_SHARE_TYPES = new Set(["major", "minor"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, investorAddress, tokenAmount, usdcPaid, shareType, txHash } = body;

    if (!propertyId || !investorAddress || !tokenAmount || !usdcPaid || !shareType || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!ETH_ADDRESS_RE.test(investorAddress)) {
      return NextResponse.json({ error: "Invalid investor address" }, { status: 400 });
    }

    if (!TX_HASH_RE.test(txHash)) {
      return NextResponse.json({ error: "Invalid transaction hash" }, { status: 400 });
    }

    if (!VALID_SHARE_TYPES.has(shareType)) {
      return NextResponse.json({ error: "Invalid share type" }, { status: 400 });
    }

    const numericTokenAmount = Number(tokenAmount);
    const numericUsdcPaid = Number(usdcPaid);
    if (!Number.isFinite(numericTokenAmount) || numericTokenAmount <= 0 || numericTokenAmount > 100) {
      return NextResponse.json({ error: "Invalid token amount" }, { status: 400 });
    }
    if (!Number.isFinite(numericUsdcPaid) || numericUsdcPaid <= 0 || numericUsdcPaid > 1_000_000_000) {
      return NextResponse.json({ error: "Invalid USDC amount" }, { status: 400 });
    }

    const { error: insertError } = await supabase.from("investments").insert({
      property_id: propertyId,
      investor_address: investorAddress.toLowerCase(),
      token_amount: numericTokenAmount,
      usdc_paid: numericUsdcPaid,
      share_type: shareType,
      buy_tx_hash: txHash,
      status: "active",
    });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("remaining, investor_count")
      .eq("id", propertyId)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: updateError } = await supabase
      .from("properties")
      .update({
        remaining: property.remaining - numericTokenAmount,
        investor_count: (property.investor_count ?? 0) + 1,
      })
      .eq("id", propertyId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[investment/buy]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
