import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  CheckSquare,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  ArrowUpDown,
  FileCheck,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Payment, PaymentStatus, UserRole } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { BankExportService } from "../../services/bankExportService";
import { showToast } from "../common/ToastNotification";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface PaymentsListViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const PaymentsListView: React.FC<PaymentsListViewProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const [branches] = useState(StorageService.getBranches());
  const currentUser = StorageService.getCurrentUser();
  const currentBranch = StorageService.getCurrentBranch();

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [branchFilter, setBranchFilter] = useState<string>(currentBranch.id);
  const [methodFilter, setMethodFilter] = useState<string>("ALL");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayments(StorageService.getPayments());
    });
    return unsub;
  }, []);

  // Filtered Payments
  const filtered = payments.filter((p) => {
    // Branch filter
    if (branchFilter !== "ALL" && p.branchId && p.branchId !== branchFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== "ALL" && p.status !== statusFilter) {
      return false;
    }

    // Method filter
    if (methodFilter !== "ALL" && p.method !== methodFilter) {
      return false;
    }

    // Search query: Beneficiary name, account number, File ID, or ID
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = p.beneficiaryName.toLowerCase().includes(q);
      const matchAcc = p.accountNumber.includes(q);
      const matchFile = p.fileId?.toLowerCase().includes(q);
      const matchId = p.id.toLowerCase().includes(q);
      const matchBank = p.bankName.toLowerCase().includes(q);
      if (!matchName && !matchAcc && !matchFile && !matchId && !matchBank) {
        return false;
      }
    }

    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedPayments = payments.filter((p) => selectedIds.includes(p.id));
  const selectedApproved = selectedPayments.filter((p) => p.status === "APPROVED");

  const handleExportBankFile = () => {
    if (selectedApproved.length === 0) {
      showToast("Please select at least one APPROVED payment to generate a bank file.", "warning");
      return;
    }
    const { blob, fileName } = BankExportService.generateIDFCFirstExport(selectedApproved);
    BankExportService.triggerDownload(blob, fileName);

    // Save record of export
    StorageService.saveBankExport({
      id: `export-${Date.now()}`,
      fileName,
      bankAdapter: "IDFC_FIRST",
      totalPayments: selectedApproved.length,
      totalAmount: selectedApproved.reduce((sum, p) => sum + p.netAmount, 0),
      status: "GENERATED",
      generatedBy: currentUser.name,
      generatedAt: new Date().toISOString(),
      paymentIds: selectedApproved.map((p) => p.id),
    });

    // Update status to BANK_FILE_GENERATED
    for (const p of selectedApproved) {
      StorageService.updatePayment({
        ...p,
        status: "BANK_FILE_GENERATED",
        bankFileBatchId: fileName,
        updatedAt: new Date().toISOString(),
      });
    }

    showToast(`Bank file '${fileName}' successfully generated with ${selectedApproved.length} payments.`, "success", "Bank File Exported");
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const { blob, fileName } = BankExportService.generateStandardCMSCSV(filtered);
    BankExportService.triggerDownload(blob, fileName);
  };

  return (
    <div id="payments-list-view" className="space-y-5 animate-in fade-in duration-200 text-white">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Payments Ledger
            </h1>
            <AmbientInfoButton
              id="payments-ledger-guide-btn"
              title="Disbursement Ledger & Status Lifecycle"
              subtitle="Master Transaction Journal & Dual-Control Tracking"
              description="The centralized registry for all loan disbursement transactions across MGM Financiers branches. Tracks payments through their complete lifecycle: Draft -> Pending Checker -> Approved -> Bank File Generated -> Successful (Settled via UTR)."
              roleNote="Maker, Checker & Admin"
              slaNote="Real-time Synchronization"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Locate & Filter Payments",
                  detail: "Filter transactions by Branch, Status (Pending, Approved, Settled), or Payment Rail (NEFT/RTGS/IMPS).",
                },
                {
                  step: 2,
                  label: "Multi-Selection Actions",
                  detail: "Checkboxes enable bulk operations: group approved payments into a Clearing Batch or generate an instant Bank File.",
                },
                {
                  step: 3,
                  label: "Deep Inspection",
                  detail: "Click the view icon on any row to open the complete Maker-Checker timeline, AI verification report, and documentary scans.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Multi-Parameter Search",
                  desc: "Search instantly across File ID, Beneficiary Name, Bank Account Number, or settlement UTR.",
                },
                {
                  title: "Bulk Disbursal Actions",
                  desc: "Select multiple APPROVED records to dispatch them directly to bank files or clearing batches.",
                },
                {
                  title: "Statutory Export",
                  desc: "Export the full filtered ledger to CSV for reconciliation, internal audit, and compliance filings.",
                },
              ]}
              proTips={[
                "Select several 'Approved' payments to unlock the 'Generate Bank Disbursal File' bulk action button.",
                "Check the AI status pill: green represents verified match; red indicates OCR discrepancy between voucher and entered form.",
              ]}
            />
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Internal normalized disbursement records, AI verification states, and payment statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold backdrop-blur-md transition"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            <span>Export Table</span>
          </button>

          {(currentUser.role === "MAKER" || currentUser.role === "ADMIN") && (
            <button
              id="create-payment-top-btn"
              onClick={() => onNavigate("create-payment")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-5 rounded-3xl glass-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
            <input
              id="payments-search-input"
              type="text"
              placeholder="Search beneficiary, account, File ID, or bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white placeholder:text-white/40 focus:outline-hidden focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              id="status-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
              <option value="PENDING_CHECKER" className="bg-slate-900 text-white">Pending Checker</option>
              <option value="APPROVED" className="bg-slate-900 text-white">Approved (Ready for Bank)</option>
              <option value="BANK_FILE_GENERATED" className="bg-slate-900 text-white">Bank File Generated</option>
              <option value="SUCCESSFUL" className="bg-slate-900 text-white">Disbursed (Successful)</option>
              <option value="REJECTED" className="bg-slate-900 text-white">Rejected</option>
              <option value="DRAFT" className="bg-slate-900 text-white">Draft</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <select
              id="branch-filter-select"
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select
              id="method-filter-select"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white focus:outline-hidden focus:ring-2 focus:ring-purple-400 font-medium"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Payment Types</option>
              <option value="NEFT" className="bg-slate-900 text-white">NEFT</option>
              <option value="RTGS" className="bg-slate-900 text-white">RTGS (&ge; ₹2,00,000)</option>
              <option value="IMPS" className="bg-slate-900 text-white">IMPS</option>
              <option value="IFT" className="bg-slate-900 text-white">IFT (Internal Transfer)</option>
            </select>
          </div>
        </div>

        {/* Selected Items Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10 animate-in fade-in">
            <div className="text-xs font-semibold text-white/80">
              <span className="font-bold text-purple-300">{selectedIds.length}</span> payment(s) selected{" "}
              {selectedApproved.length > 0 && (
                <span className="text-emerald-300">
                  ({selectedApproved.length} approved for bank)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="bulk-export-bank-btn"
                onClick={handleExportBankFile}
                disabled={selectedApproved.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-lg border border-white/20"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export IDFC FIRST Upload ({selectedApproved.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Payments Table */}
      <div className="rounded-3xl glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table id="payments-table" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={handleSelectAll}
                    className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="p-3.5">Ref / File ID</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Beneficiary & Account</th>
                <th className="p-3.5">IFSC / Bank</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">AI Verification</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => {
                const isSelected = selectedIds.includes(p.id);

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/5 transition ${
                      isSelected ? "bg-purple-500/10" : ""
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      <div>{p.fileId || p.id}</div>
                      <span className="text-[10px] font-normal text-white/40 block">
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
                      {ValidationService.formatINR(p.netAmount)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-white/10 text-white/80 border border-white/10">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {p.aiVerification ? (
                        <StatusBadge aiStatus={p.aiVerification.overallStatus} />
                      ) : (
                        <span className="text-[11px] text-white/40">No Document</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {p.status === "PENDING_CHECKER" ? (
                        <button
                          id={`review-btn-${p.id}`}
                          onClick={() => onNavigate("checker-review", { paymentId: p.id })}
                          className="px-3 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 font-bold text-xs transition border border-purple-400/30 inline-flex items-center gap-1 backdrop-blur-sm"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onNavigate("checker-review", { paymentId: p.id })}
                          className="px-3 py-1 rounded-xl hover:bg-white/10 text-white/60 hover:text-white text-xs font-semibold transition inline-flex items-center gap-1 border border-transparent hover:border-white/10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-10 text-center text-white/40">
                    No payment records found matching the active filters.
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
