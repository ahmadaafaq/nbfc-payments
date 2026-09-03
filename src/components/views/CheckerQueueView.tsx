import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle2,
  ChevronRight,
  Filter,
  UserCheck,
  Eye,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Payment } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface CheckerQueueViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CheckerQueueView: React.FC<CheckerQueueViewProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const currentUser = StorageService.getCurrentUser();
  const currentBranch = StorageService.getCurrentBranch();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMismatchOnly, setFilterMismatchOnly] = useState(false);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayments(StorageService.getPayments());
    });
    return unsub;
  }, []);

  // Filter only PENDING_CHECKER items
  const pendingPayments = payments.filter((p) => p.status === "PENDING_CHECKER");

  const filtered = pendingPayments.filter((p) => {
    if (filterMismatchOnly && p.aiVerification?.overallStatus !== "MISMATCH") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.beneficiaryName.toLowerCase().includes(q);
      const matchAcc = p.accountNumber.includes(q);
      const matchFile = p.fileId?.toLowerCase().includes(q);
      const matchMaker = p.makerName.toLowerCase().includes(q);
      if (!matchName && !matchAcc && !matchFile && !matchMaker) {
        return false;
      }
    }

    return true;
  });

  const totalPendingValue = pendingPayments.reduce((sum, p) => sum + p.netAmount, 0);
  const mismatchCount = pendingPayments.filter(
    (p) => p.aiVerification?.overallStatus === "MISMATCH"
  ).length;

  return (
    <div id="checker-queue-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Checker Approval Queue
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {pendingPayments.length} Pending
            </span>
            <AmbientInfoButton
              id="checker-queue-screen-guide"
              title="Checker Approval Queue"
              subtitle="RBI 4-Eye Independent Verification Pipeline"
              description="The dedicated desk for authorized Checkers. Scrutinizes submissions from Makers against uploaded vouchers, reviews Gemini OCR discrepancy scores, and enforces strict dual-control before releases are queued for bank payment execution."
              roleNote="Checker & Admin Only"
              slaNote="Verification Turnaround SLA: < 15 Mins"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Prioritize Queue",
                  detail: "Review the queue for high-priority or 'AI MISMATCH' items flagged with optical discrepancy alerts.",
                },
                {
                  step: 2,
                  label: "Enter Review Desk",
                  detail: "Click 'Verify & Authorize' to open the dual-pane forensic workspace with voucher viewer and hotkeys.",
                },
                {
                  step: 3,
                  label: "Cross-Examine Voucher",
                  detail: "Verify physical cheque/passbook against system fields (Name, Bank, A/C, IFSC, Amount).",
                },
                {
                  step: 4,
                  label: "Authorize or Return",
                  detail: "Approve to advance to bank CMS export, or return to Maker with detailed remediation remarks.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Segregation of Duties",
                  desc: "Makers are blocked from authorizing payments they submitted, preventing internal fraud.",
                },
                {
                  title: "Optical Mismatch Highlighting",
                  desc: "Visual alerts if Gemini 3.8 Flash detects differences between the voucher scan and entered text.",
                },
                {
                  title: "Batch Readiness",
                  desc: "Approved items automatically appear in the Bank Export Engine for CMS file generation.",
                },
              ]}
              proTips={[
                "Enable the 'AI Mismatches Only' filter toggle to immediately isolate submissions needing extra scrutiny.",
                "High-value payments (> ₹2,00,000) are marked with an urgent tag for prompt RTGS cutoff compliance.",
              ]}
            />
          </div>
          <p className="text-xs text-white/50 mt-1">
            Independent verification desk. Review maker submissions and supporting documents before authorizing disbursement.
          </p>
        </div>

        {/* Checker Role Notice */}
        <div className="flex items-center gap-2.5 p-2.5 px-3.5 rounded-2xl glass-card-subtle text-xs border border-white/10">
          <UserCheck className="w-4 h-4 text-purple-300" />
          <div>
            <span className="text-white/40 text-[10px] block">Logged In Checker:</span>
            <span className="font-bold text-white">{currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-card">
          <div className="text-xs text-white/50 font-medium">Pending Review Count</div>
          <div className="text-2xl font-black text-amber-300 mt-1 tracking-tight">
            {pendingPayments.length}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Across all active branches</div>
        </div>

        <div className="p-5 rounded-2xl glass-card">
          <div className="text-xs text-white/50 font-medium">Total Value Pending Approval</div>
          <div className="text-2xl font-black text-white mt-1 tracking-tight">
            {ValidationService.formatINR(totalPendingValue)}
          </div>
          <div className="text-[11px] text-white/40 mt-1">Awaiting disbursement clearance</div>
        </div>

        <div
          onClick={() => setFilterMismatchOnly(!filterMismatchOnly)}
          className={`p-5 rounded-2xl border cursor-pointer transition ${
            mismatchCount > 0
              ? "bg-rose-500/15 border-rose-500/30 backdrop-blur-xl shadow-lg"
              : "glass-card-interactive"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-300">
              AI Flagged Discrepancies
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-300 mt-1 tracking-tight">
            {mismatchCount}
          </div>
          <div className="text-[11px] text-rose-300/80 font-medium mt-1">
            {filterMismatchOnly ? "Click to show all" : "Click to filter flagged items"}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search beneficiary, account, or maker..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
          />
        </div>

        <div className="flex items-center gap-2">
          {filterMismatchOnly && (
            <button
              onClick={() => setFilterMismatchOnly(false)}
              className="px-3 py-1.5 text-xs text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl font-semibold border border-rose-500/30 transition"
            >
              Reset Discrepancy Filter
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-3xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Reference ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Beneficiary & Account</th>
                <th className="p-3.5">Bank & Branch</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5">Maker</th>
                <th className="p-3.5">AI Check</th>
                <th className="p-3.5 text-center">Checker Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const isMismatch = p.aiVerification?.overallStatus === "MISMATCH";
                const isSelfMaker = p.makerId === currentUser.id;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/5 transition ${
                      isMismatch ? "bg-rose-500/10" : ""
                    }`}
                  >
                    <td className="p-3.5 font-mono font-bold text-white">
                      <div>{p.fileId || p.id}</div>
                      <span className="text-[10px] font-normal text-white/40">
                        {p.branchName}
                      </span>
                    </td>
                    <td className="p-3.5 text-white/70 whitespace-nowrap">
                      {p.paymentDate}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">
                        {p.beneficiaryName}
                      </div>
                      <div className="text-[11px] text-white/50 font-mono">
                        A/C: {ValidationService.maskAccountNumber(p.accountNumber)}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-white/90 font-semibold">
                        {p.ifsc}
                      </div>
                      <div className="text-[10px] text-white/50">{p.bankName}</div>
                    </td>
                    <td className="p-3.5 text-right font-black text-white whitespace-nowrap">
                      <div className="text-sm">{ValidationService.formatINR(p.netAmount)}</div>
                      <span className="text-[10px] font-mono text-white/50">{p.method}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-white/90">
                        {p.makerName}
                      </div>
                      {isSelfMaker && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-500/30 inline-block mt-0.5">
                          Your Submission
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {p.aiVerification ? (
                        <StatusBadge aiStatus={p.aiVerification.overallStatus} />
                      ) : (
                        <span className="text-white/40 text-[11px]">Pending AI</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        id={`inspect-btn-${p.id}`}
                        onClick={() => onNavigate("checker-review", { paymentId: p.id })}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-md mx-auto border ${
                          isMismatch
                            ? "bg-rose-500/80 hover:bg-rose-500 text-white border-rose-400/40"
                            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-white/20 shadow-purple-900/30"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect & Verify</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-white/40">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                    <div className="font-bold text-white">
                      All caught up!
                    </div>
                    <p className="text-xs text-white/50 mt-0.5">
                      No payments currently require checker review.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
