import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { propertyId, investorAddress, tokenAmount, usdcPaid, shareType, txHash } = body;

    if (!propertyId || !investorAddress || !tokenAmount || !usdcPaid || !shareType || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error: insertError } = await supabase.from("investments").insert({
      propertyId,
      investorAddress,
      tokenAmount,
      usdcPaid,
      shareType,
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
        remaining: property.remaining - usdcPaid,
        investor_count: property.investor_count + 1,
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
