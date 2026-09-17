import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/server/supabaseDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const payments = await SupabaseDbService.getPayments();
    return NextResponse.json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payment = await req.json();
    if (!payment || !payment.id) {
      return NextResponse.json(
        { error: "Valid payment object is required" },
        { status: 400 }
      );
    }
    const saved = await SupabaseDbService.upsertPayment(payment);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
