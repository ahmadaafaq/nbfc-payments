import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Building2,
  ChevronRight,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Payment, PaymentStatus } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";

interface DashboardViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const currentUser = StorageService.getCurrentUser();
  const currentBranch = StorageService.getCurrentBranch();

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayments(StorageService.getPayments());
    });
    return unsub;
  }, []);

  // Filter payments by current branch or all
  const branchPayments = payments.filter((p) => p.branchId === currentBranch.id || !p.branchId);

  // Metrics calculations
  const totalCount = branchPayments.length;
  const totalValue = branchPayments.reduce((sum, p) => sum + p.netAmount, 0);

  const pendingChecker = branchPayments.filter((p) => p.status === "PENDING_CHECKER");
  const pendingCheckerCount = pendingChecker.length;
  const pendingCheckerValue = pendingChecker.reduce((sum, p) => sum + p.netAmount, 0);

  const approved = branchPayments.filter(
    (p) => p.status === "APPROVED" || p.status === "BANK_FILE_GENERATED"
  );
  const approvedCount = approved.length;
  const approvedValue = approved.reduce((sum, p) => sum + p.netAmount, 0);

  const successful = branchPayments.filter((p) => p.status === "SUCCESSFUL");
  const successfulValue = successful.reduce((sum, p) => sum + p.netAmount, 0);

  const rejected = branchPayments.filter((p) => p.status === "REJECTED" || p.status === "FAILED");
  const rejectedCount = rejected.length;

  const aiMismatches = branchPayments.filter(
    (p) => p.aiVerification?.overallStatus === "MISMATCH" || p.remarks?.includes("MISMATCH")
  );

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-card relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 tracking-wide">
              {currentBranch.name.toUpperCase()} BRANCH
            </span>
            <span className="text-xs text-white/50">Live Operations</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1.5 text-white">
            Payment Operations Center
          </h1>
          <p className="text-xs text-white/60 mt-1 max-w-2xl leading-relaxed">
            MGM Financiers Pvt Limited Centralized Disbursement & Maker-Checker Verification Desk.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          {(currentUser.role === "MAKER" || currentUser.role === "ADMIN") && (
            <button
              id="dashboard-create-payment-btn"
              onClick={() => onNavigate("create-payment")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Payment</span>
            </button>
          )}

          {(currentUser.role === "CHECKER" || currentUser.role === "ADMIN") && (
            <button
              id="dashboard-checker-queue-btn"
              onClick={() => onNavigate("checker-queue")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 shadow-sm transition active:scale-95 backdrop-blur-md"
            >
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Checker Queue ({pendingCheckerCount})</span>
            </button>
          )}

          <button
            id="dashboard-export-bank-btn"
            onClick={() => onNavigate("bank-files")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium border border-white/10 transition backdrop-blur-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Bank Export</span>
          </button>
        </div>
      </div>

      {/* AI Alert Banner (If mismatch detected in branch) */}
      {aiMismatches.length > 0 && (
        <div
          id="dashboard-ai-alert"
          onClick={() => onNavigate("checker-queue")}
          className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 backdrop-blur-xl cursor-pointer hover:bg-rose-500/20 transition text-white shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>AI Detected Discrepancy in Pending Queue</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  {aiMismatches.length} Flagged
                </span>
              </div>
              <p className="text-[11px] text-white/70 mt-0.5">
                Voucher amount does not match entered payment amount on record (e.g. entered ₹30,000 vs document ₹3,000). Inspect in Checker Queue.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Payments */}
        <div
          onClick={() => onNavigate("payments")}
          className="p-5 rounded-2xl glass-card-interactive cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Total Volume</span>
            <div className="p-2 rounded-xl bg-white/10 text-purple-300 border border-white/10">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white tracking-tight">
            {ValidationService.formatINR(totalValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
            <span>{totalCount} Total Transactions</span>
            <span className="text-purple-300 font-semibold">{currentBranch.code}</span>
          </div>
        </div>

        {/* Card 2: Pending Checker Review */}
        <div
          onClick={() => onNavigate("checker-queue")}
          className="p-5 rounded-2xl glass-card-interactive cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Pending Checker</span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-300 tracking-tight">
            {pendingCheckerCount} <span className="text-xs font-normal text-white/50">records</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
            <span>{ValidationService.formatINR(pendingCheckerValue)}</span>
            <span className="text-amber-400 font-semibold">Requires Action</span>
          </div>
        </div>

        {/* Card 3: Approved & Ready for Bank */}
        <div
          onClick={() => onNavigate("bank-files")}
          className="p-5 rounded-2xl glass-card-interactive cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Approved for Bank</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-300 tracking-tight">
            {approvedCount} <span className="text-xs font-normal text-white/50">ready</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
            <span>{ValidationService.formatINR(approvedValue)}</span>
            <span className="text-emerald-400 font-semibold">Ready to Export</span>
          </div>
        </div>

        {/* Card 4: Disbursed / Settled */}
        <div
          onClick={() => onNavigate("reconciliation")}
          className="p-5 rounded-2xl glass-card-interactive cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-white/60">Disbursed (Success)</span>
            <div className="p-2 rounded-xl bg-white/10 text-blue-300 border border-white/10">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-white tracking-tight">
            {ValidationService.formatINR(successfulValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
            <span>{successful.length} Confirmed by Bank</span>
            <span className="text-white/40">UTR Matched</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Checker Queue Priority + Operational Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Checker Queue */}
        <div className="lg:col-span-2 rounded-3xl glass-card p-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Checker Verification Queue</span>
                {pendingCheckerCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingCheckerCount} pending
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-white/50 mt-0.5">
                Independent verification required before inclusion in bank disbursement file.
              </p>
            </div>
            <button
              onClick={() => onNavigate("checker-queue")}
              className="text-xs font-semibold text-purple-300 hover:text-purple-200 hover:underline flex items-center gap-1 transition"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {pendingChecker.slice(0, 4).map((p) => {
              const isMismatch = p.aiVerification?.overallStatus === "MISMATCH";
              return (
                <div
                  key={p.id}
                  onClick={() => onNavigate("checker-review", { paymentId: p.id })}
                  className="py-3.5 px-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 cursor-pointer transition border border-transparent hover:border-white/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {p.fileId || p.id}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-white/10 text-white/70 border border-white/10">
                        {p.method}
                      </span>
                      {isMismatch ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          AI MISMATCH
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          AI Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {p.beneficiaryName}
                    </div>
                    <div className="text-[11px] text-white/50 flex items-center gap-2">
                      <span>{p.bankName}</span>
                      <span>•</span>
                      <span>A/C: {ValidationService.maskAccountNumber(p.accountNumber)}</span>
                      <span>•</span>
                      <span>Maker: {p.makerName}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-sm font-black text-white">
                      {ValidationService.formatINR(p.netAmount)}
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold inline-flex items-center gap-1 mt-1">
                      Inspect & Verify <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}

            {pendingChecker.length === 0 && (
              <div className="py-8 text-center text-white/40 text-xs">
                No pending payments in the checker queue for {currentBranch.name}.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Operational Rules & Quick Bank Summary */}
        <div className="space-y-4">
          {/* Bank Export Readiness Card */}
          <div className="rounded-3xl glass-card p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>Bank File Engine</span>
              </span>
              <span className="text-[10px] font-mono text-white/40">IDFC FIRST CMS</span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Eligible for Export:</span>
                <span className="font-bold text-emerald-300">
                  {approvedCount} Payments
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Total Export Value:</span>
                <span className="font-bold text-white">
                  {ValidationService.formatINR(approvedValue)}
                </span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Debit Account:</span>
                <span className="font-mono text-[11px] text-white/80">
                  10084729104
                </span>
              </div>
            </div>

            <button
              onClick={() => onNavigate("bank-files")}
              disabled={approvedCount === 0}
              className="mt-5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-900/30 border border-white/20"
            >
              Generate IDFC FIRST Upload File
            </button>
          </div>

          {/* Maker-Checker Compliance Checklist */}
          <div className="rounded-3xl glass-card-subtle p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Compliance Guardrails</span>
            </div>
            <ul className="space-y-2 text-[11px] text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">✓</span>
                <span>Maker cannot approve their own submission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">✓</span>
                <span>AI verifies 4 key document fields (Name, A/C, IFSC, Amount)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">✓</span>
                <span>Real-time duplicate detection on Account & File ID</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">✓</span>
                <span>Immutable timestamped audit trail on every action</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
