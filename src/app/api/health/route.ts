import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/server/supabaseDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const dbHealth = await SupabaseDbService.checkHealth();
    return NextResponse.json({
      status: "ok",
      app: "MGM Payment Operations",
      time: new Date().toISOString(),
      aiConfigured:
        !!process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
      database: dbHealth,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message,
      },
      { status: 500 }
    );
  }
}
