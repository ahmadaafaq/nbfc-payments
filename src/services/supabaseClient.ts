import { createClient } from "@supabase/supabase-js";

// Read client credentials from Next.js (NEXT_PUBLIC_) or Vite (VITE_) or fallback
const SUPABASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  (typeof (globalThis as any).importMetaEnv !== "undefined" && (globalThis as any).importMetaEnv?.VITE_SUPABASE_URL) ||
  "";

const SUPABASE_ANON_KEY =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_URL.includes("your-project")
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface SupabaseSyncStatus {
  connected: boolean;
  projectUrl: string;
  projectRef: string;
  tables: {
    payments: number;
    branches: number;
    userProfiles: number;
    debitAccounts: number;
    batches: number;
    auditLogs: number;
  };
  lastSyncedAt?: string;
  mode: "CLOUD_SUPABASE" | "OFFLINE_FALLBACK";
}
