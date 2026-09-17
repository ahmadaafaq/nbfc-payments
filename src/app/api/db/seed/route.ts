import { NextResponse } from "next/server";
import { SupabaseDbService } from "@/server/supabaseDb";
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_DEBIT_ACCOUNTS,
  INITIAL_BATCHES,
  INITIAL_NOTIFICATIONS,
  generateInitialPayments,
} from "@/services/seedData";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const seedPayload = {
      branches: INITIAL_BRANCHES,
      users: INITIAL_USERS,
      debitAccounts: INITIAL_DEBIT_ACCOUNTS,
      payments: generateInitialPayments(),
      batches: INITIAL_BATCHES,
      notifications: INITIAL_NOTIFICATIONS,
    };
    const success = await SupabaseDbService.seedInitialData(seedPayload);
    const status = await SupabaseDbService.checkHealth();
    return NextResponse.json({ success, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
