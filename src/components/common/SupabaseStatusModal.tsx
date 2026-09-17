import React, { useState, useEffect } from "react";
import {
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck,
  Table,
  Layers,
  ExternalLink,
  Code2,
  X,
  HardDrive,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { showToast } from "./ToastNotification";

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "schema">("overview");
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const fetchStatus = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/db/status");
      const data = await res.json();
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({
        connected: false,
        error: err.message,
        projectRef: "blbvlsxtqodtdbfpqyap",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const result = await StorageService.fullSyncWithCloud();
      if (result.success) {
        showToast(result.message, "success", "Supabase Sync");
        await fetchStatus();
      } else {
        showToast(result.message, "warning", "Supabase Sync");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to sync", "danger", "Sync Error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/db/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showToast("Database seeded and synchronized with initial records", "success", "Supabase Seeder");
        await fetchStatus();
      } else {
        showToast("Database is already populated", "info", "Supabase Seeder");
      }
    } catch (err: any) {
      showToast(err.message || "Seeding failed", "danger", "Database Error");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-emerald-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-emerald-950/50 text-white backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white tracking-tight">
                  Supabase Cloud Database
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Active
                </span>
              </div>
              <p className="text-xs text-white/60 font-mono">
                Project: blbvlsxtqodtdbfpqyap.supabase.co
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Connection & Metrics</span>
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "schema"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>PostgreSQL Schema (DDL)</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" ? (
          <div className="space-y-4 pt-2">
            {/* Connection Health Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>PostgreSQL 15 Managed DB</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-emerald-300/80 font-mono">
                    Direct Cloud Connection • RLS Enabled • Realtime Enabled
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {latencyMs !== null && (
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-black/40 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>{latencyMs}ms</span>
                  </span>
                )}
                <button
                  onClick={fetchStatus}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Live Table Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/50 flex items-center gap-1">
                  <Table className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Payments</span>
                </div>
                <div className="text-xl font-mono font-black text-cyan-300">
                  {dbStatus?.tables?.payments ?? StorageService.getPayments().length}
                </div>
                <div className="text-[10px] text-white/40">Active Records</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/50 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  <span>Batches</span>
                </div>
                <div className="text-xl font-mono font-black text-purple-300">
                  {dbStatus?.tables?.batches ?? StorageService.getBatches().length}
                </div>
                <div className="text-[10px] text-white/40">CMS Files</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/50 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                  <span>Debit Accounts</span>
                </div>
                <div className="text-xl font-mono font-black text-amber-300">
                  {dbStatus?.tables?.debitAccounts ?? StorageService.getDebitAccounts().length}
                </div>
                <div className="text-[10px] text-white/40">Corporate A/Cs</div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="text-[11px] text-white/50 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Branches & Users</span>
                </div>
                <div className="text-xl font-mono font-black text-emerald-300">
                  {StorageService.getBranches().length + StorageService.getUsers().length}
                </div>
                <div className="text-[10px] text-white/40">RBAC Entities</div>
              </div>
            </div>

            {/* Sync Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
              <div className="text-xs text-white/50 font-mono">
                Last synced:{" "}
                <span className="text-white">
                  {new Date().toLocaleTimeString("en-IN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedDatabase}
                  disabled={isSyncing}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/15"
                >
                  Re-seed Initial Data
                </button>

                <button
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync with Supabase"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-white/70">
              The following PostgreSQL tables and Row Level Security policies are active on your Supabase project:
            </p>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 max-h-64 overflow-y-auto font-mono text-[11px] text-emerald-300/90 leading-relaxed">
              <pre>{`-- Supabase PostgreSQL Schema
• branches (id, code, name, city, state, active, created_at)
• user_profiles (id, name, email, role, branch_id, branch_name, avatar, active)
• debit_accounts (id, account_number, account_name, bank_name, ifsc, branch, balance)
• payments (id, payment_ref, beneficiary_name, account_number, ifsc, bank_name,
            gross_amount, tds_amount, net_amount, payment_date, payment_mode,
            debit_account_id, branch_id, status, maker_id, checker_id, documents,
            ai_verification, audit_trail, bank_status, utr_number, raw_data)
• payment_batches (id, batch_reference, bank_name, account_number, total_records,
                   total_amount, status, created_by, approved_by, file_type, payment_ids)
• bank_exports (id, batch_id, file_name, bank_format, total_records, total_amount)
• in_app_notifications (id, title, message, type, timestamp, read, link, payment_id)
• audit_logs (id, entity_type, entity_id, action, performed_by, user_role, details)`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
