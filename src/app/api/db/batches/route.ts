import { NextRequest, NextResponse } from "next/server";
import { SupabaseDbService } from "@/server/supabaseDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const batches = await SupabaseDbService.getBatches();
    return NextResponse.json({
      success: true,
      count: batches.length,
      data: batches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const batch = await req.json();
    if (!batch || !batch.id) {
      return NextResponse.json(
        { error: "Valid batch object is required" },
        { status: 400 }
      );
    }
    const saved = await SupabaseDbService.upsertBatch(batch);
    return NextResponse.json({ success: true, data: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
