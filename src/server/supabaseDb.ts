import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const projectRef = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");

export class SupabaseDbService {
  /**
   * Health check for Supabase DB
   */
  static async checkHealth() {
    try {
      const { data, error, count } = await supabaseAdmin
        .from("payments")
        .select("id", { count: "exact", head: true });

      const [branchesRes, usersRes, accountsRes, batchesRes] = await Promise.all([
        supabaseAdmin.from("branches").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("user_profiles").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("debit_accounts").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("batches").select("id", { count: "exact", head: true }),
      ]);

      return {
        connected: !error,
        projectRef,
        projectUrl: SUPABASE_URL,
        tables: {
          payments: count ?? 0,
          branches: branchesRes.count ?? 0,
          userProfiles: usersRes.count ?? 0,
          debitAccounts: accountsRes.count ?? 0,
          batches: batchesRes.count ?? 0,
        },
        error: error ? error.message : null,
      };
    } catch (e: any) {
      return {
        connected: false,
        projectRef,
        projectUrl: SUPABASE_URL,
        tables: {
          payments: 0,
          branches: 0,
          userProfiles: 0,
          debitAccounts: 0,
          batches: 0,
        },
        error: e?.message || "Unknown error",
      };
    }
  }

  /**
   * Seed all initial data if tables are empty
   */
  static async seedInitialData(seedData: {
    branches: any[];
    users: any[];
    debitAccounts: any[];
    payments: any[];
    batches: any[];
    notifications: any[];
  }) {
    try {
      // 1. Seed Branches
      const { data: existingBranches } = await supabaseAdmin
        .from("branches")
        .select("id")
        .limit(1);

      if (!existingBranches || existingBranches.length === 0) {
        const branchesPayload = seedData.branches.map((b) => ({
          id: b.id,
          name: b.name,
          code: b.code,
          state: b.state,
          city: b.city,
          address: b.address,
          manager_name: b.managerName,
          manager_email: b.managerEmail,
          phone: b.phone,
          is_active: b.isActive ?? true,
          created_at: new Date().toISOString(),
        }));
        await supabaseAdmin.from("branches").upsert(branchesPayload);
      }

      // 2. Seed User Profiles
      const { data: existingUsers } = await supabaseAdmin
        .from("user_profiles")
        .select("id")
        .limit(1);

      if (!existingUsers || existingUsers.length === 0) {
        const usersPayload = seedData.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          branch_id: u.branchId,
          branch_name: u.branchName,
          phone: u.phone,
          is_active: u.isActive ?? true,
          daily_limit: u.dailyLimit ?? 5000000,
          created_at: new Date().toISOString(),
        }));
        await supabaseAdmin.from("user_profiles").upsert(usersPayload);
      }

      // 3. Seed Debit Accounts
      const { data: existingAccounts } = await supabaseAdmin
        .from("debit_accounts")
        .select("id")
        .limit(1);

      if (!existingAccounts || existingAccounts.length === 0) {
        const accountsPayload = seedData.debitAccounts.map((a) => ({
          id: a.id,
          bank_name: a.bankName,
          account_number: a.accountNumber,
          account_type: a.accountType,
          ifsc: a.ifsc,
          branch_name: a.branchName,
          balance: a.balance ?? 5000000,
          currency: a.currency ?? "INR",
          is_active: a.isActive ?? true,
          created_at: new Date().toISOString(),
        }));
        await supabaseAdmin.from("debit_accounts").upsert(accountsPayload);
      }

      // 4. Seed Payments
      const { data: existingPayments } = await supabaseAdmin
        .from("payments")
        .select("id")
        .limit(1);

      if (!existingPayments || existingPayments.length === 0) {
        const paymentsPayload = seedData.payments.map((p) => this.mapPaymentToDb(p));
        await supabaseAdmin.from("payments").upsert(paymentsPayload);
      }

      // 5. Seed Batches
      const { data: existingBatches } = await supabaseAdmin
        .from("batches")
        .select("id")
        .limit(1);

      if (!existingBatches || existingBatches.length === 0) {
        const batchesPayload = seedData.batches.map((b) => ({
          id: b.id,
          batch_reference: b.id,
          bank_name: b.bankName || "IDFC FIRST Bank",
          account_number: b.accountNumber || "100458291039",
          total_records: b.totalCount || b.paymentIds?.length || 0,
          total_amount: b.totalAmount || 0,
          status: b.status || "APPROVED",
          created_by: b.createdBy || "Finance Officer",
          created_at: new Date().toISOString(),
          file_type: "H2H_EXCEL",
          payment_ids: b.paymentIds || [],
          raw_data: b,
        }));
        await supabaseAdmin.from("batches").upsert(batchesPayload);
      }

      return true;
    } catch (err: any) {
      console.warn("Supabase seedInitialData warning:", err?.message);
      return false;
    }
  }

  /**
   * Fetch all payments from Supabase
   */
  static async getPayments() {
    try {
      const { data, error } = await supabaseAdmin
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => this.mapPaymentFromDb(row));
    } catch (e: any) {
      console.warn("Error fetching payments from Supabase:", e?.message);
      return [];
    }
  }

  /**
   * Upsert a payment in Supabase
   */
  static async upsertPayment(payment: any) {
    try {
      const dbRow = this.mapPaymentToDb(payment);
      const { data, error } = await supabaseAdmin
        .from("payments")
        .upsert(dbRow)
        .select()
        .single();

      if (error) throw error;
      return this.mapPaymentFromDb(data);
    } catch (e: any) {
      console.warn("Error upserting payment to Supabase:", e?.message);
      return payment;
    }
  }

  /**
   * Delete a payment from Supabase
   */
  static async deletePayment(id: string) {
    try {
      const { error } = await supabaseAdmin.from("payments").delete().eq("id", id);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn("Error deleting payment from Supabase:", e?.message);
      return false;
    }
  }

  /**
   * Fetch all batches from Supabase
   */
  static async getBatches() {
    try {
      const { data, error } = await supabaseAdmin
        .from("batches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => this.mapBatchFromDb(row));
    } catch (e: any) {
      console.warn("Error fetching batches from Supabase:", e?.message);
      return [];
    }
  }

  /**
   * Upsert a batch in Supabase
   */
  static async upsertBatch(batch: any) {
    try {
      const dbRow = {
        id: batch.id,
        batch_reference: batch.id,
        bank_name: batch.bankName || "IDFC FIRST Bank",
        account_number: batch.accountNumber || "100458291039",
        total_records: batch.totalCount || batch.paymentIds?.length || 0,
        total_amount: batch.totalAmount || 0,
        status: batch.status || "APPROVED",
        created_by: batch.createdBy || "Finance Officer",
        created_at: batch.createdAt || new Date().toISOString(),
        approved_by: batch.approvedBy || null,
        approved_at: batch.approvedAt || null,
        file_type: batch.fileType || "H2H_EXCEL",
        payment_ids: batch.paymentIds || [],
        raw_data: batch,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from("batches")
        .upsert(dbRow)
        .select()
        .single();

      if (error) throw error;
      return this.mapBatchFromDb(data);
    } catch (e: any) {
      console.warn("Error upserting batch to Supabase:", e?.message);
      return batch;
    }
  }

  // Mappers
  static mapPaymentToDb(p: any) {
    return {
      id: p.id,
      payment_ref: p.fileId || p.paymentRef || p.id,
      beneficiary_name: p.beneficiaryName,
      account_number: p.accountNumber,
      ifsc: p.ifsc,
      bank_name: p.bankName,
      gross_amount: p.grossAmount || p.disbursalAmount || p.netAmount || 0,
      tds_amount: p.tdsAdjustment || p.tdsAmount || 0,
      net_amount: p.netAmount || p.amount || 0,
      payment_date: p.paymentDate || new Date().toISOString().split("T")[0],
      payment_mode: p.method || p.paymentMode || "NEFT",
      debit_account_id: p.debitAccountId || "ACC-MGM-01",
      debit_account_number: p.debitAccountNumber || "100458291039",
      branch_id: p.branchId || "BR-001",
      branch_name: p.branchName || "Chandigarh Central",
      status: p.status || "SUBMITTED",
      maker_id: p.makerId || "USR-001",
      maker_name: p.makerName || "Rajesh Sharma",
      maker_email: p.makerEmail || "rajesh.sharma@mgmfinance.in",
      maker_timestamp: p.createdAt || new Date().toISOString(),
      checker_id: p.checkerId || null,
      checker_name: p.checkerName || null,
      checker_email: p.checkerEmail || null,
      checker_timestamp: p.approvedAt || null,
      checker_notes: p.rejectionNotes || p.checkerNotes || null,
      batch_id: p.batchId || null,
      remarks: p.remarks || p.purpose || null,
      source_module: p.sourceType || "PAYMENTS_OPS",
      documents: p.documents || p.supportingDocuments || [],
      ai_verification: p.aiVerification || null,
      audit_trail: p.auditTrail || [],
      bank_status: p.bankStatus || null,
      utr_number: p.utrNumber || null,
      raw_data: p,
      updated_at: new Date().toISOString(),
    };
  }

  static mapPaymentFromDb(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      paymentRef: row.payment_ref,
      beneficiaryName: row.beneficiary_name,
      accountNumber: row.account_number,
      ifsc: row.ifsc,
      bankName: row.bank_name,
      amount: Number(row.net_amount),
      grossAmount: Number(row.gross_amount),
      tdsAmount: Number(row.tds_amount),
      netAmount: Number(row.net_amount),
      paymentDate: row.payment_date,
      paymentMode: row.payment_mode,
      debitAccountId: row.debit_account_id,
      debitAccountNumber: row.debit_account_number,
      branchId: row.branch_id,
      branchName: row.branch_name,
      status: row.status,
      makerId: row.maker_id,
      makerName: row.maker_name,
      makerEmail: row.maker_email,
      makerTimestamp: row.maker_timestamp,
      checkerId: row.checker_id,
      checkerName: row.checker_name,
      checkerEmail: row.checker_email,
      checkerTimestamp: row.checker_timestamp,
      checkerNotes: row.checker_notes,
      batchId: row.batch_id,
      remarks: row.remarks,
      sourceModule: row.source_module,
      documents: row.documents || [],
      aiVerification: row.ai_verification || null,
      auditTrail: row.audit_trail || [],
      bankStatus: row.bank_status,
      utrNumber: row.utr_number,
      ...(row.raw_data || {}),
    };
  }

  static mapBatchFromDb(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      batchReference: row.batch_reference,
      bankName: row.bank_name,
      accountNumber: row.account_number,
      totalRecords: row.total_records,
      totalAmount: Number(row.total_amount),
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      fileType: row.file_type,
      paymentIds: row.payment_ids || [],
      ...(row.raw_data || {}),
    };
  }
}
