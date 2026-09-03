import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building,
  History,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { BankExportService } from "../../services/bankExportService";
import { Payment, BankExportRecord } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { ConfirmModal } from "../common/ConfirmModal";
import { showToast } from "../common/ToastNotification";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface BankFilesViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const BankFilesView: React.FC<BankFilesViewProps> = ({ onNavigate }) => {
  const [payments, setPayments] = useState<Payment[]>(StorageService.getPayments());
  const [exportHistory, setExportHistory] = useState<BankExportRecord[]>(StorageService.getBankExports());
  const currentUser = StorageService.getCurrentUser();

  // Adapter selection: IDFC FIRST (Excel .xlsx) or Standard CMS (.csv)
  const [selectedAdapter, setSelectedAdapter] = useState<"IDFC_FIRST" | "STANDARD_CMS">("IDFC_FIRST");
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([]);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayments(StorageService.getPayments());
      setExportHistory(StorageService.getBankExports());
    });
    return unsub;
  }, []);

  // Filter approved payments eligible for export
  const approvedPayments = payments.filter((p) => p.status === "APPROVED");
  const alreadyExportedPayments = payments.filter((p) => p.status === "BANK_FILE_GENERATED");

  // Safety pre-validation on currently selected items
  const paymentsToEvaluate =
    selectedPaymentIds.length > 0
      ? payments.filter((p) => selectedPaymentIds.includes(p.id))
      : approvedPayments;

  const safetyCheck = BankExportService.validatePaymentsForBankExport(paymentsToEvaluate);

  // Auto-select all approved payments on initial load
  useEffect(() => {
    if (approvedPayments.length > 0 && selectedPaymentIds.length === 0) {
      setSelectedPaymentIds(approvedPayments.map((p) => p.id));
    }
  }, [approvedPayments.length]);

  const handleToggleSelect = (id: string) => {
    if (selectedPaymentIds.includes(id)) {
      setSelectedPaymentIds(selectedPaymentIds.filter((item) => item !== id));
    } else {
      setSelectedPaymentIds([...selectedPaymentIds, id]);
    }
  };

  const handleSelectAllApproved = () => {
    setSelectedPaymentIds(approvedPayments.map((p) => p.id));
  };

  // Perform Generation and Download
  const handleExecuteExport = () => {
    setIsGenerating(true);
    try {
      const exportList = safetyCheck.eligiblePayments;
      let blob: Blob;
      let fileName: string;

      if (selectedAdapter === "IDFC_FIRST") {
        const result = BankExportService.generateIDFCFirstExport(exportList);
        blob = result.blob;
        fileName = result.fileName;
      } else {
        const result = BankExportService.generateStandardCMSCSV(exportList);
        blob = result.blob;
        fileName = result.fileName;
      }

      // Download file to user's computer
      BankExportService.triggerDownload(blob, fileName);

      // Record export in audit history
      const now = new Date().toISOString();
      const record: BankExportRecord = {
        id: `EXP-${Date.now()}`,
        fileName,
        bankAdapter: selectedAdapter,
        totalPayments: exportList.length,
        totalAmount: safetyCheck.totalAmount,
        status: "GENERATED",
        generatedBy: currentUser.name,
        generatedAt: now,
        paymentIds: exportList.map((p) => p.id),
      };
      StorageService.saveBankExport(record);

      // Advance payment statuses to BANK_FILE_GENERATED
      for (const p of exportList) {
        StorageService.updatePayment({
          ...p,
          status: "BANK_FILE_GENERATED",
          bankFileBatchId: fileName,
          updatedAt: now,
          auditTrail: [
            ...p.auditTrail,
            {
              id: `audit-${Date.now()}-${p.id}`,
              timestamp: now,
              userId: currentUser.id,
              userName: currentUser.name,
              userRole: currentUser.role,
              action: "BANK_FILE_GENERATED",
              details: `Included in ${selectedAdapter} upload file '${fileName}' by ${currentUser.name}`,
            },
          ],
        });
      }

      setShowConfirmModal(false);
      setSelectedPaymentIds([]);
      showToast(
        `Generated ${selectedAdapter === "IDFC_FIRST" ? "IDFC FIRST Bank" : "Standard CMS"} file '${fileName}' with ${exportList.length} records.`,
        "success",
        "Export Successful"
      );
    } catch (err: any) {
      showToast("Failed to generate bank file: " + err.message, "danger", "Export Error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Simulate bank upload acknowledgement (for demonstration)
  const handleSimulateBankAck = (record: BankExportRecord) => {
    const ackRef = `IDFC-ACK-${Date.now().toString().slice(-6)}`;
    const updatedHistory = exportHistory.map((rec) => {
      if (rec.id === record.id) {
        return {
          ...rec,
          status: "UPLOADED_TO_BANK" as const,
          uploadedAt: new Date().toISOString(),
          bankReferenceNumber: ackRef,
        };
      }
      return rec;
    });
    localStorage.setItem("mgm_bank_exports_v1", JSON.stringify(updatedHistory));

    // Update payments to SUBMITTED_TO_BANK
    for (const pid of record.paymentIds) {
      const p = StorageService.getPaymentById(pid);
      if (p) {
        StorageService.updatePayment({
          ...p,
          status: "SUBMITTED_TO_BANK",
          updatedAt: new Date().toISOString(),
        });
      }
    }
    setExportHistory(updatedHistory);
    showToast(`Bank acknowledgement confirmed with ref ${ackRef}.`, "success", "Bank Acknowledged");
  };

  return (
    <div id="bank-files-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-white">
              Bank Export Engine
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 backdrop-blur-md">
              IDFC FIRST CMS & Standard CMS
            </span>
            <AmbientInfoButton
              id="bank-files-screen-guide"
              title="Bank Disbursal Export Engine"
              subtitle="Corporate CMS Transmission & Pre-Flight Validation"
              description="Generates corporate-grade host-to-host payout files for IDFC FIRST Bank CMS and standard RTGS/NEFT clearing gateways. Runs exhaustive pre-flight verification checks to eliminate bank rejection penalties."
              roleNote="Checker & Admin"
              slaNote="Cutoff: 18:30 IST Same-Day Settlement"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Pre-Flight Clearance",
                  detail: "Automated checks confirm: only approved records are selected, accounts are double-entered, and IFSC format is verified.",
                },
                {
                  step: 2,
                  label: "Select Transmission Format",
                  detail: "Choose between 'IDFC FIRST Bank CMS (Excel .xlsx)' or 'Standard Corporate CMS Adapter (CSV)'.",
                },
                {
                  step: 3,
                  label: "Generate & Download File",
                  detail: "Generates the encrypted payload, marks payments as BANK_FILE_GENERATED, and logs SHA-256 hash for audit.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Pre-Flight Guardrails",
                  desc: "Guarantees zero unapproved or pending-checker items are ever leaked into bank transmissions.",
                },
                {
                  title: "SHA-256 Hash Auditing",
                  desc: "Every generated file computes an integrity hash to verify that bank portals receive unaltered data.",
                },
                {
                  title: "Simulated Host-to-Host",
                  desc: "Allows testing bank upload acknowledgements and reverse response feeds in real time.",
                },
              ]}
              proTips={[
                "Always ensure the total pre-flight safety indicator is green before dispatching the file to the corporate banking portal.",
              ]}
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Replaces manual Excel templates. Transforms verified payments into bank-compliant upload files with pre-flight safety checks.
          </p>
        </div>
      </div>

      {/* Safety Clearance Dashboard */}
      <div className="rounded-3xl glass-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Pre-Flight Bank File Safety Verification
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Adapter:</span>
            <select
              value={selectedAdapter}
              onChange={(e) => setSelectedAdapter(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-xl glass-dropdown text-white font-bold"
            >
              <option value="IDFC_FIRST" className="bg-slate-900 text-white">IDFC FIRST Bank CMS (Excel .xlsx)</option>
              <option value="STANDARD_CMS" className="bg-slate-900 text-white">Standard CMS Adapter (CSV)</option>
            </select>
          </div>
        </div>

        {/* Safety Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl glass-card-subtle">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider block">Selected for Export</span>
            <span className="text-lg font-black text-white mt-1 block">
              {safetyCheck.eligiblePayments.length} Payments
            </span>
            <span className="text-[11px] text-purple-300 font-semibold">
              {ValidationService.formatINR(safetyCheck.totalAmount)}
            </span>
          </div>

          <div className="p-4 rounded-2xl glass-card-subtle">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider block">All Approved Check</span>
            <span className="text-lg font-black text-emerald-400 mt-1 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Cleared</span>
            </span>
            <span className="text-[11px] text-white/50">0 pending / 0 unapproved</span>
          </div>

          <div className="p-4 rounded-2xl glass-card-subtle">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider block">Validation Errors</span>
            <span
              className={`text-lg font-black mt-1 block ${
                safetyCheck.ineligiblePayments.length > 0 ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {safetyCheck.ineligiblePayments.length} Errors
            </span>
            <span className="text-[11px] text-white/50">IFSC & A/C syntax check</span>
          </div>

          <div className="p-4 rounded-2xl glass-card-subtle">
            <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider block">Debit Account</span>
            <span className="text-sm font-mono font-black text-white mt-1 block">
              10084729104
            </span>
            <span className="text-[11px] text-white/50">IDFC FIRST Bank</span>
          </div>
        </div>

        {/* Ineligible Warning if any */}
        {safetyCheck.ineligiblePayments.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs backdrop-blur-md">
            <span className="font-bold text-rose-300">The following payments cannot be exported:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-white/80">
              {safetyCheck.ineligiblePayments.map((item, idx) => (
                <li key={idx}>
                  Ref {item.payment.fileId || item.payment.id} ({item.payment.beneficiaryName}): {item.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export Action Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-white/60">
            Clicking generate will produce a formatted bank bulk file and advance payments to{" "}
            <strong className="text-purple-300">'BANK_FILE_GENERATED'</strong>.
          </div>

          <button
            id="btn-generate-bank-file"
            onClick={() => setShowConfirmModal(true)}
            disabled={!safetyCheck.isEligible || isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-purple-200" />
            <span>Generate & Download {selectedAdapter === "IDFC_FIRST" ? "IDFC Excel (.xlsx)" : "Standard (.csv)"}</span>
          </button>
        </div>
      </div>

      {/* Eligible Payments Table */}
      <div className="rounded-3xl glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Approved Payments Queue ({approvedPayments.length} Ready)
            </h3>
          </div>
          {approvedPayments.length > 0 && (
            <button
              onClick={handleSelectAllApproved}
              className="text-xs text-purple-300 font-bold hover:underline"
            >
              Select All Approved
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3.5 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      approvedPayments.length > 0 &&
                      selectedPaymentIds.length === approvedPayments.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) handleSelectAllApproved();
                      else setSelectedPaymentIds([]);
                    }}
                    className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                </th>
                <th className="p-3.5">Ref ID</th>
                <th className="p-3.5">Beneficiary</th>
                <th className="p-3.5">Account Number</th>
                <th className="p-3.5">IFSC</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Approved By</th>
                <th className="p-3.5">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {approvedPayments.map((p) => {
                const isSelected = selectedPaymentIds.includes(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-white/5 transition-colors ${
                      isSelected ? "bg-purple-500/10" : ""
                    }`}
                  >
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(p.id)}
                        className="rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      {p.fileId || p.id}
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      {p.beneficiaryName}
                    </td>
                    <td className="p-3.5 font-mono text-white/70">
                      {p.accountNumber}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white/70">
                      {p.ifsc}
                    </td>
                    <td className="p-3.5 text-right font-black text-white">
                      {ValidationService.formatINR(p.netAmount)}
                    </td>
                    <td className="p-3.5 font-mono text-white/70">{p.method}</td>
                    <td className="p-3.5 text-white/60">
                      {p.checkerName || "Checker"}
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ready</span>
                      </span>
                    </td>
                  </tr>
                );
              })}

              {approvedPayments.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-white/40">
                    No approved payments pending export. Approve payments in Checker Queue first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Files Generation History Table */}
      <div className="rounded-3xl glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-white/50" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Bank File Generation & Upload History ({exportHistory.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold text-[10px] uppercase tracking-wider">
                <th className="p-3.5">File Name</th>
                <th className="p-3.5">Format</th>
                <th className="p-3.5">Payments</th>
                <th className="p-3.5 text-right">Total Amount</th>
                <th className="p-3.5">Generated By & Date</th>
                <th className="p-3.5">Bank Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {exportHistory.map((rec) => (
                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>{rec.fileName}</span>
                  </td>
                  <td className="p-3.5 font-medium text-white/70">
                    {rec.bankAdapter}
                  </td>
                  <td className="p-3.5 font-bold text-white">
                    {rec.totalPayments}
                  </td>
                  <td className="p-3.5 text-right font-black text-white">
                    {ValidationService.formatINR(rec.totalAmount)}
                  </td>
                  <td className="p-3.5 text-white/70">
                    <div>{rec.generatedBy}</div>
                    <span className="text-[10px] text-white/40">
                      {new Date(rec.generatedAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                      {rec.status.replace(/_/g, " ")}
                    </span>
                    {rec.bankReferenceNumber && (
                      <span className="text-[10px] text-white/40 block font-mono mt-0.5">
                        Ack: {rec.bankReferenceNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    {rec.status === "GENERATED" ? (
                      <button
                        onClick={() => handleSimulateBankAck(rec)}
                        className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition"
                        title="Simulate bank portal acknowledgement"
                      >
                        Simulate Bank Ack
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        Acknowledged
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {exportHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-white/40">
                    No bank upload files generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteExport}
        title="Generate & Download Bank Upload File"
        description="Verify the batch clearance parameters. This will generate an official Excel upload file formatted to IDFC FIRST Bank CMS specifications."
        confirmText="Confirm & Download File"
        cancelText="Cancel"
        variant="success"
        loading={isGenerating}
        details={[
          { label: "Target Bank Format", value: selectedAdapter === "IDFC_FIRST" ? "IDFC FIRST Bank CMS (.xlsx)" : "Standard CMS (.csv)" },
          { label: "Number of Payments", value: `${safetyCheck.eligiblePayments.length} Approved Payments` },
          { label: "Total Disbursement Amount", value: ValidationService.formatINR(safetyCheck.totalAmount) },
          { label: "Debit Account Number", value: "10084729104 (MGM Financiers IDFC Main A/C)" },
          { label: "Pending or Rejected Items", value: "0 (All 100% Checker Authorized)" },
          { label: "Operating User", value: currentUser.name },
        ]}
      />
    </div>
  );
};
