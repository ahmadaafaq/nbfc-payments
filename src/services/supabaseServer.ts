import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const RAW_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const RAW_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  RAW_URL && RAW_KEY && !RAW_URL.includes("placeholder")
);

const SUPABASE_URL = isSupabaseConfigured ? RAW_URL : "https://placeholder.supabase.co";
const SUPABASE_KEY = isSupabaseConfigured ? RAW_KEY : "placeholder-key";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "";

// 1. Supabase JS Client for high-level REST & realtime operations
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 2. Direct Postgres Pool for DDL schema creation and transactions
// Supabase host patterns:
// Direct: db.blbvlsxtqodtdbfpqyap.supabase.co:5432
// Transaction Pooler: aws-0-ap-southeast-1.pooler.supabase.com:6543
const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

const connectionStrings = [
  `postgresql://postgres.${projectRef}:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres.${projectRef}:${encodeURIComponent(DB_PASSWORD)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`,
  `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${projectRef}.supabase.co:5432/postgres`,
  `postgresql://postgres:${encodeURIComponent(DB_PASSWORD)}@db.${projectRef}.supabase.co:6543/postgres`,
];

let activePool: Pool | null = null;

export async function getDbPool(): Promise<Pool | null> {
  if (activePool) return activePool;

  for (const connStr of connectionStrings) {
    try {
      const pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      activePool = pool;
      console.log("Connected to Supabase PostgreSQL via Pool successfully!");
      return activePool;
    } catch (err: any) {
      // Try next
    }
  }

  // Fallback to standard connection
  const pool = new Pool({
    connectionString: connectionStrings[0],
    ssl: { rejectUnauthorized: false },
  });
  activePool = pool;
  return activePool;
}

export const SCHEMA_SQL = `
-- MGM Payment Operations Schema
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  branch_id TEXT,
  branch_name TEXT,
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS debit_accounts (
  id TEXT PRIMARY KEY,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  ifsc TEXT NOT NULL,
  branch TEXT NOT NULL,
  balance NUMERIC DEFAULT 0,
  account_type TEXT DEFAULT 'CURRENT',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  payment_ref TEXT NOT NULL,
  beneficiary_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL,
  tds_amount NUMERIC DEFAULT 0,
  net_amount NUMERIC NOT NULL,
  payment_date TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  debit_account_id TEXT NOT NULL,
  debit_account_number TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  branch_name TEXT NOT NULL,
  status TEXT NOT NULL,
  maker_id TEXT NOT NULL,
  maker_name TEXT NOT NULL,
  maker_email TEXT NOT NULL,
  maker_timestamp TEXT NOT NULL,
  checker_id TEXT,
  checker_name TEXT,
  checker_email TEXT,
  checker_timestamp TEXT,
  checker_notes TEXT,
  batch_id TEXT,
  remarks TEXT,
  source_module TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  ai_verification JSONB,
  audit_trail JSONB DEFAULT '[]'::jsonb,
  bank_status TEXT,
  utr_number TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_batches (
  id TEXT PRIMARY KEY,
  batch_reference TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  total_records INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  approved_by TEXT,
  approved_at TEXT,
  file_type TEXT,
  payment_ids JSONB DEFAULT '[]'::jsonb,
  raw_data JSONB,
  inserted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_exports (
  id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  bank_format TEXT NOT NULL,
  total_records INTEGER NOT NULL,
  total_amount NUMERIC NOT NULL,
  generated_by TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  checksum TEXT,
  status TEXT,
  file_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS in_app_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  user_role TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) & Public access policies for application API
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE debit_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon & authenticated roles full access for application operations
DO $$
BEGIN
  DROP POLICY IF EXISTS "public_all_branches" ON branches;
  CREATE POLICY "public_all_branches" ON branches FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_user_profiles" ON user_profiles;
  CREATE POLICY "public_all_user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_debit_accounts" ON debit_accounts;
  CREATE POLICY "public_all_debit_accounts" ON debit_accounts FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_payments" ON payments;
  CREATE POLICY "public_all_payments" ON payments FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_payment_batches" ON payment_batches;
  CREATE POLICY "public_all_payment_batches" ON payment_batches FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_bank_exports" ON bank_exports;
  CREATE POLICY "public_all_bank_exports" ON bank_exports FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_notifications" ON in_app_notifications;
  CREATE POLICY "public_all_notifications" ON in_app_notifications FOR ALL USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "public_all_audit_logs" ON audit_logs;
  CREATE POLICY "public_all_audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;
`;
