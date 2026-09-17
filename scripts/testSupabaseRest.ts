import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

console.log("Testing Supabase REST API connection...");
console.log("URL:", SUPABASE_URL);

async function test() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // Try querying a table
  try {
    const { data, error } = await supabase.from("payments").select("*").limit(5);
    console.log("Query payments table:", { data, error });
  } catch (e: any) {
    console.log("Error querying payments:", e.message);
  }
}

test();
