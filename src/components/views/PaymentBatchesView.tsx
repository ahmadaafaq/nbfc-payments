import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Building2,
  Calendar,
  ChevronRight,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { PaymentBatch, Payment } from "../../types";
import { ValidationService } from "../../services/validationService";
import { BankExportService } from "../../services/bankExportService";
import { showToast } from "../common/ToastNotification";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface PaymentBatchesViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const PaymentBatchesView: React.FC<PaymentBatchesViewProps> = ({ onNavigate }) => {
  const [batches, setBatches] = useState<PaymentBatch[]>(StorageService.getBatches());
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const currentUser = StorageService.getCurrentUser();
  const currentBranch = StorageService.getCurrentBranch();

  // New Batch Modal
  const [showNewBatchModal, setShowNewBatchModal] = useState(false);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);
  const [batchError, setBatchError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setBatches(StorageService.getBatches());
      setPayments(StorageService.getPayments());
    });
    return unsub;
  }, []);

  const approvedUnbatched = payments.filter((p) => p.status === "APPROVED" && !p.batchId);

  const handleCreateBatch = () => {
    if (selectedPaymentIds.length === 0) {
      setBatchError("Please select at least one approved payment for this batch.");
      return;
    }

    setBatchError(null);
    const selectedPayments = payments.filter((p) => selectedPaymentIds.includes(p.id));
    const totalAmt = selectedPayments.reduce((sum, p) => sum + p.netAmount, 0);
    const now = new Date().toISOString();
    const newBatchId = `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;

    const newBatch: PaymentBatch = {
      id: newBatchId,
      branchId: currentBranch.id,
      branchName: currentBranch.name,
      makerId: currentUser.id,
      makerName: currentUser.name,
      totalCount: selectedPayments.length,
      totalAmount: totalAmt,
      status: "APPROVED",
      paymentIds: selectedPaymentIds,
      createdAt: now,
      updatedAt: now,
    };

    StorageService.createBatch(newBatch);

    // Update payments with batchId
    for (const p of selectedPayments) {
      StorageService.updatePayment({
        ...p,
        batchId: newBatchId,
        updatedAt: now,
      });
    }

    showToast(
      `Disbursement batch ${newBatchId} created with ${selectedPayments.length} payments totaling ${ValidationService.formatINR(totalAmt)}.`,
      "success",
      "Batch Created"
    );

    setShowNewBatchModal(false);
    setSelectedPaymentIds([]);
  };

  const handleExportBatchFile = (batch: PaymentBatch) => {
    const batchPayments = payments.filter((p) => batch.paymentIds.includes(p.id));
    if (batchPayments.length === 0) {
      showToast("No active payments found in this batch.", "warning");
      return;
    }

    const { blob, fileName } = BankExportService.generateIDFCFirstExport(batchPayments);
    BankExportService.triggerDownload(blob, fileName);

    // Save bank export record
    StorageService.saveBankExport({
      id: `export-${Date.now()}`,
      fileName,
      bankAdapter: "IDFC_FIRST",
      totalPayments: batchPayments.length,
      totalAmount: batchPayments.reduce((sum, p) => sum + p.netAmount, 0),
      status: "GENERATED",
      generatedBy: currentUser.name,
      generatedAt: new Date().toISOString(),
      paymentIds: batchPayments.map((p) => p.id),
    });

    // Update payments to BANK_FILE_GENERATED
    for (const p of batchPayments) {
      StorageService.updatePayment({
        ...p,
        status: "BANK_FILE_GENERATED",
        bankFileBatchId: fileName,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update batch status
    StorageService.updateBatch({
      ...batch,
      status: "BANK_FILE_GENERATED",
      updatedAt: new Date().toISOString(),
    });

    showToast(
      `Bank upload file '${fileName}' generated for batch ${batch.id}.`,
      "success",
      "Bank File Generated"
    );
  };

  return (
    <div id="payment-batches-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight text-white">
              Payment Batches
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-white/80 border border-white/10">
              {batches.length} Batches
            </span>
            <AmbientInfoButton
              id="payment-batches-screen-guide"
              title="Clearing Batches Management"
              subtitle="Scheduled Clearing Windows & Gross Cutoff Batches"
              description="Aggregates verified and approved disbursements into structured clearing batches aligned with banking partner transmission schedules (Hourly NEFT cutoffs, RTGS gross windows, and End-of-Day settlements)."
              roleNote="Checker & Admin"
              slaNote="Clearing Cutoffs: 11:30, 14:30, 17:30 IST"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Create Batch Container",
                  detail: "Click 'Create New Batch' to view all currently approved payments awaiting clearing assignment.",
                },
                {
                  step: 2,
                  label: "Select Approved Disbursements",
                  detail: "Select individual loans or choose 'Select All' to compute aggregate batch totals and transaction counts.",
                },
                {
                  step: 3,
                  label: "Generate Bank Transmission File",
                  detail: "Click 'Generate Bank Upload' on any batch card to export formatted CSV/TXT with embedded SHA-256 integrity hash.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Batch Integrity Locking",
                  desc: "Once a bank file is generated, payments inside the batch cannot be edited or tampered with.",
                },
                {
                  title: "Aggregated Exposure Metrics",
                  desc: "Real-time visibility into total batch outlay, beneficiary count, and debit account allocation.",
                },
              ]}
              proTips={[
                "Export batches before 17:30 IST to meet same-day RBI RTGS clearing deadlines.",
                "Generated bank files can be tracked under the 'Bank Files' tab for upload acknowledgments.",
              ]}
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Group verified payments into operational disbursement batches for bulk submission to IDFC FIRST Bank CMS.
          </p>
        </div>

        <button
          id="btn-create-new-batch"
          onClick={() => {
            setBatchError(null);
            setSelectedPaymentIds([]);
            setShowNewBatchModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="p-6 rounded-3xl glass-card hover:border-purple-400/40 transition space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>{batch.id}</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  batch.status === "COMPLETED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : batch.status === "PROCESSING"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {batch.status}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Branch:</span>
                <span className="font-medium text-white">{batch.branchName}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Transactions:</span>
                <span className="font-bold text-white">{batch.totalCount} Payments</span>
              </div>
              <div className="flex justify-between text-white/60 items-baseline">
                <span>Total Amount:</span>
                <span className="font-black text-emerald-400 text-base">
                  {ValidationService.formatINR(batch.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-white/40 text-[11px] pt-2 border-t border-white/10">
                <span>Created By:</span>
                <span className="text-white/70">{batch.makerName}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-white/40 font-mono">
                {new Date(batch.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleExportBatchFile(batch)}
                className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bank File</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {batches.length === 0 && (
        <div className="p-12 text-center rounded-3xl glass-card space-y-3">
          <Layers className="w-10 h-10 text-white/30 mx-auto" />
          <div className="text-sm font-bold text-white">No payment batches created yet</div>
          <p className="text-xs text-white/60 max-w-sm mx-auto">
            Group approved payments into batches to streamline bank submissions for {currentBranch.name}.
          </p>
        </div>
      )}

      {/* New Batch Creation Modal */}
      {showNewBatchModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewBatchModal(false);
          }}
        >
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl glass-card border border-white/20 bg-slate-950/95 shadow-2xl p-5 sm:p-6 space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Create Payment Disbursement Batch
                </h3>
              </div>
              <button
                onClick={() => setShowNewBatchModal(false)}
                className="p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/60 leading-relaxed">
              Select approved payments to group into a single batch for {currentBranch.name} branch.
            </p>

            {batchError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{batchError}</span>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-2xl p-2 bg-white/5">
              {approvedUnbatched.map((p) => {
                const isSelected = selectedPaymentIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className="flex items-center justify-between p-2.5 hover:bg-white/10 rounded-xl cursor-pointer text-xs transition"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPaymentIds([...selectedPaymentIds, p.id]);
                          } else {
                            setSelectedPaymentIds(selectedPaymentIds.filter((id) => id !== p.id));
                          }
                        }}
                        className="rounded border-white/30 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-bold text-white">{p.beneficiaryName}</div>
                        <div className="text-[10px] text-white/50 font-mono">
                          {p.fileId || p.id} • {p.bankName}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">
                      {ValidationService.formatINR(p.netAmount)}
                    </span>
                  </label>
                );
              })}

              {approvedUnbatched.length === 0 && (
                <div className="p-6 text-center text-white/40 text-xs">
                  No unbatched approved payments available in {currentBranch.name}.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-white/70">
                Selected: <strong className="text-white">{selectedPaymentIds.length}</strong> Payments
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewBatchModal(false)}
                  className="px-3.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateBatch}
                  disabled={selectedPaymentIds.length === 0}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white shadow-lg shadow-purple-900/30 border border-white/20 transition"
                >
                  Create Batch
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
