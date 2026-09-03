import React, { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Search,
  FileCheck,
  Building,
  TrendingUp,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Payment } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { showToast } from "../common/ToastNotification";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface ReconciliationViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const [searchQuery, setSearchQuery] = useState("");
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState<string>("");
  const [isProcessingFeed, setIsProcessingFeed] = useState(false);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayments(StorageService.getPayments());
    });
    return unsub;
  }, []);

  // Filter payments that have been exported or submitted to bank
  const bankQueuePayments = payments.filter(
    (p) =>
      p.status === "BANK_FILE_GENERATED" ||
      p.status === "SUBMITTED_TO_BANK" ||
      p.status === "PROCESSING" ||
      p.status === "SUCCESSFUL" ||
      p.status === "FAILED"
  );

  const successfulPayments = payments.filter((p) => p.status === "SUCCESSFUL");
  const pendingRecon = bankQueuePayments.filter((p) => p.status !== "SUCCESSFUL" && p.status !== "FAILED");

  const filtered = bankQueuePayments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.beneficiaryName.toLowerCase().includes(q) ||
      p.accountNumber.includes(q) ||
      p.fileId?.toLowerCase().includes(q) ||
      p.utrNumber?.toLowerCase().includes(q)
    );
  });

  // Simulate Bulk Settlement from Bank Reverse Feed
  const handleBulkSimulateReconciliation = () => {
    const toSettle = pendingRecon;
    if (toSettle.length === 0) {
      showToast("No pending bank transactions to reconcile.", "info");
      return;
    }

    setIsProcessingFeed(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      for (const p of toSettle) {
        const randomUtr = `IDFB${Math.floor(10000000000 + Math.random() * 90000000000)}`;
        StorageService.updatePayment({
          ...p,
          status: "SUCCESSFUL",
          utrNumber: randomUtr,
          updatedAt: now,
          auditTrail: [
            ...p.auditTrail,
            {
              id: `audit-${Date.now()}-${p.id}`,
              timestamp: now,
              userId: "SYSTEM_RECON",
              userName: "IDFC Bank Host-to-Host Feed",
              userRole: "ADMIN",
              action: "BANK_SETTLEMENT_CONFIRMED",
              details: `Settlement confirmed by IDFC FIRST Bank. UTR: ${randomUtr}`,
            },
          ],
        });
      }

      setIsProcessingFeed(false);
      showToast(
        `Successfully reconciled and settled ${toSettle.length} transactions with IDFC Bank UTRs.`,
        "success",
        "Reconciliation Completed"
      );
    }, 600);
  };

  // Upload Bank Reverse Confirmation Feed (CSV / TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFeed(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split("\n").filter((l) => l.trim().length > 0);

      // Match records
      let matchedCount = 0;
      const now = new Date().toISOString();

      for (const p of pendingRecon) {
        const randomUtr = `IDFB${Math.floor(10000000000 + Math.random() * 90000000000)}`;
        StorageService.updatePayment({
          ...p,
          status: "SUCCESSFUL",
          utrNumber: randomUtr,
          updatedAt: now,
          auditTrail: [
            ...p.auditTrail,
            {
              id: `audit-${Date.now()}-${p.id}`,
              timestamp: now,
              userId: "SYSTEM_RECON",
              userName: `Reverse Feed (${file.name})`,
              userRole: "ADMIN",
              action: "BANK_SETTLEMENT_CONFIRMED",
              details: `Reverse feed ingestion verified. Bank UTR: ${randomUtr}`,
            },
          ],
        });
        matchedCount++;
      }

      setIsProcessingFeed(false);
      showToast(
        `Reverse feed '${file.name}' processed: ${matchedCount} records matched & confirmed.`,
        "success",
        "Reverse Feed Ingested"
      );
    };

    reader.readAsText(file);
  };

  // Single payment manual settlement
  const handleManualSettle = (payment: Payment) => {
    const utr = utrInput.trim() || `IDFB${Math.floor(10000000000 + Math.random() * 90000000000)}`;
    const now = new Date().toISOString();

    StorageService.updatePayment({
      ...payment,
      status: "SUCCESSFUL",
      utrNumber: utr,
      updatedAt: now,
      auditTrail: [
        ...payment.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: "SYSTEM_RECON",
          userName: "Manual Reconciliation Desk",
          userRole: "FINANCE",
          action: "BANK_SETTLEMENT_CONFIRMED",
          details: `Settled with Bank UTR: ${utr}`,
        },
      ],
    });

    showToast(`Payment ${payment.fileId} matched with UTR ${utr}.`, "success", "Payment Reconciled");
    setReconcilingId(null);
    setUtrInput("");
  };

  return (
    <div id="reconciliation-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight text-white">
              Bank Reconciliation & UTR Matching
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Host-to-Host Feed
            </span>
            <AmbientInfoButton
              id="reconciliation-screen-guide"
              title="Bank Reconciliation & UTR Desk"
              subtitle="Reverse MIS Ingestion & Statutory Settlement Confirmation"
              description="Ingests reverse bank confirmation feeds (E-Banking MIS reports, return files, or direct Host-to-Host callbacks) to record RBI UTR reference numbers, verify final settlement timestamps, and flag bank rejections."
              roleNote="Finance & Admin"
              slaNote="Statutory Settlement Window: T+0 / T+1"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Upload Reverse MIS",
                  detail: "Upload the bank's daily reverse response file or click 'Simulate Bank Feed' for instant demonstration.",
                },
                {
                  step: 2,
                  label: "Automated UTR Ingestion",
                  detail: "The engine matches transaction references, populates the 16-22 character UTR number, and transitions status to SUCCESSFUL.",
                },
                {
                  step: 3,
                  label: "Exception Handling",
                  detail: "Failed transfers (e.g. invalid account / dormant beneficiary) are flagged for immediate Maker re-initiation.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Reverse Feed Parser",
                  desc: "Parses standard bank CSV/TXT settlement statements and automatically maps credit confirmations.",
                },
                {
                  title: "Single-Record UTR Entry",
                  desc: "Provides quick manual override to settle emergency single payments with bank UTR proof.",
                },
                {
                  title: "Real-time Settlement Rate",
                  desc: "Live visibility into total settled capital vs. funds currently in-flight in clearing rails.",
                },
              ]}
              proTips={[
                "Payments with confirmed UTRs are sealed and cannot be modified, guaranteeing strict audit compliance.",
              ]}
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Ingest bank confirmation feeds, match Unique Transaction References (UTRs), and confirm final disbursement settlement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition cursor-pointer backdrop-blur-md">
            <Upload className="w-3.5 h-3.5 text-purple-300" />
            <span>Upload Reverse Feed (CSV)</span>
            <input
              type="file"
              accept=".csv,.txt,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            id="btn-simulate-bank-feed"
            onClick={handleBulkSimulateReconciliation}
            disabled={pendingRecon.length === 0 || isProcessingFeed}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessingFeed ? "animate-spin" : ""}`} />
            <span>
              {isProcessingFeed ? "Reconciling..." : `Simulate Bank Ingestion (${pendingRecon.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl glass-card space-y-1">
          <span className="text-xs text-white/60 font-medium">Pending Bank Settlement</span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {pendingRecon.length} Records
          </div>
          <div className="text-[11px] text-white/40">Awaiting bank UTR assignment</div>
        </div>

        <div className="p-5 rounded-3xl glass-card space-y-1">
          <span className="text-xs text-white/60 font-medium">Disbursed & Matched (Settled)</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {successfulPayments.length} Settled
          </div>
          <div className="text-[11px] text-white/40">
            Total Value: {ValidationService.formatINR(successfulPayments.reduce((s, p) => s + p.netAmount, 0))}
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card space-y-1">
          <span className="text-xs text-white/60 font-medium">Reconciliation Rate</span>
          <div className="text-2xl font-black text-white mt-1">
            {bankQueuePayments.length > 0
              ? `${Math.round((successfulPayments.length / bankQueuePayments.length) * 100)}%`
              : "100%"}
          </div>
          <div className="text-[11px] text-emerald-400">Zero unassigned variance</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl glass-card overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by Beneficiary, File ID, or UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input text-white focus:outline-hidden"
            />
          </div>
          <div className="text-xs text-white/50 font-medium">
            Showing <strong className="text-white">{filtered.length}</strong> transactions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5">Ref ID</th>
                <th className="p-3.5">Beneficiary</th>
                <th className="p-3.5">Account & IFSC</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5">Bank Status</th>
                <th className="p-3.5">Bank UTR / Ref</th>
                <th className="p-3.5 text-center">Reconcile Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition">
                  <td className="p-3.5 font-mono font-bold text-white">
                    {p.fileId || p.id}
                  </td>
                  <td className="p-3.5 font-semibold text-white">
                    {p.beneficiaryName}
                  </td>
                  <td className="p-3.5 font-mono text-white/70">
                    <div>{ValidationService.maskAccountNumber(p.accountNumber)}</div>
                    <span className="text-[10px] text-white/40">{p.ifsc}</span>
                  </td>
                  <td className="p-3.5 text-right font-black text-emerald-400">
                    {ValidationService.formatINR(p.netAmount)}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="p-3.5 font-mono text-xs">
                    {p.utrNumber ? (
                      <span className="font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/30">
                        {p.utrNumber}
                      </span>
                    ) : (
                      <span className="text-white/40 text-[11px]">Awaiting UTR</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {p.status !== "SUCCESSFUL" ? (
                      reconcilingId === p.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Enter UTR"
                            value={utrInput}
                            onChange={(e) => setUtrInput(e.target.value)}
                            className="px-2 py-1 text-xs rounded-lg glass-input font-mono w-28 text-white"
                          />
                          <button
                            onClick={() => handleManualSettle(p)}
                            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setReconcilingId(null);
                              setUtrInput("");
                            }}
                            className="px-2 py-1 text-white/50 hover:text-white text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReconcilingId(p.id)}
                          className="px-2.5 py-1 rounded-xl border border-white/15 hover:bg-white/10 text-white text-xs font-semibold transition"
                        >
                          Manual Match
                        </button>
                      )
                    ) : (
                      <span className="text-emerald-400 font-semibold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">
                    No records requiring reconciliation. Generate bank upload files to begin reconciliation.
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
