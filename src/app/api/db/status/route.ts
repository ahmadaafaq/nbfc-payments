import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/server/supabaseDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const health = await SupabaseDbService.checkHealth();
    return NextResponse.json(health);
  } catch (err: any) {
    return NextResponse.json(
      { connected: false, error: err.message },
      { status: 500 }
    );
  }
}
