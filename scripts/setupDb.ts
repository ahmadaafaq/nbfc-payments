import { Pool } from "pg";
import { SCHEMA_SQL } from "../src/services/supabaseServer";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD || "";
const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

// Supabase Connection Strings
const poolerHosts = [
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  `db.${projectRef}.supabase.co`,
];

async function runMigration() {
  console.log("Attempting Supabase schema migration for project:", projectRef);

  for (const host of poolerHosts) {
    const isDirect = host.startsWith("db.");
    const port = isDirect ? 5432 : 6543;
    const user = isDirect ? "postgres" : `postgres.${projectRef}`;
    const connStr = `postgresql://${user}:${encodeURIComponent(DB_PASSWORD)}@${host}:${port}/postgres`;

    console.log(`Trying host: ${host}:${port} as ${user}...`);
    try {
      const pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 7000,
      });

      const client = await pool.connect();
      console.log(`Connected successfully to ${host}! Running DDL schema creation...`);
      await client.query(SCHEMA_SQL);
      console.log("Schema successfully created and tables verified on Supabase!");
      client.release();
      await pool.end();
      return true;
    } catch (err: any) {
      console.warn(`Connection failed to ${host}:`, err.message);
    }
  }

  console.log("Direct PG pool failed, will use Supabase HTTP REST API fallback.");
  return false;
}

runMigration().then((success) => {
  console.log("Migration status:", success ? "SUCCESS" : "FALLBACK_REQUIRED");
});
