import React, { useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { ValidationService } from "../../services/validationService";
import { Payment, Branch, UserProfile } from "../../types";
import { showToast } from "../common/ToastNotification";

interface BulkPaymentUploadTabProps {
  currentBranch: Branch;
  currentUser: UserProfile;
  onNavigate: (view: string, params?: any) => void;
}

interface ParsedDisbursementRow {
  id: string;
  fileId: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  netAmount: number;
  purpose: string;
  errors: string[];
  isDuplicate?: boolean;
}

export const BulkPaymentUploadTab: React.FC<BulkPaymentUploadTabProps> = ({
  currentBranch,
  currentUser,
  onNavigate,
}) => {
  const debitAccounts = StorageService.getDebitAccounts();
  const existingPayments = StorageService.getPayments();
  const [debitAccountNumber, setDebitAccountNumber] = useState(
    debitAccounts[0]?.accountNumber || "10084729104"
  );
  const [parsedRows, setParsedRows] = useState<ParsedDisbursementRow[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const csvHeader = "File_ID,Beneficiary_Name,Account_Number,IFSC,Bank_Name,Amount,Purpose\n";
    const sampleRows = [
      "MGM-LDH-2024-801,Gurpreet Singh Dhillon,50100492817291,HDFC0000034,HDFC Bank Ltd,45000,Vehicle Loan Disbursement\n",
      "MGM-LDH-2024-802,Kulwant Kaur,0296000100918273,PUNB0029600,Punjab National Bank,28000,Gold Loan Disbursement\n",
      "MGM-LDH-2024-803,Amandeep Sharma,38472910482,SBIN0001476,State Bank of India,65000,Commercial Auto Loan\n",
      "MGM-LDH-2024-804,Simranjit Vohra,918020048172615,UTIB0000154,Axis Bank Ltd,35000,Two Wheeler Loan\n",
    ].join("");

    const blob = new Blob([csvHeader + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MGM_Bulk_Disbursement_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Disbursement CSV template downloaded.", "info");
  };

  // Quick load demo batch
  const handleLoadDemoBatch = () => {
    const demoData: Array<{
      fileId: string;
      beneficiaryName: string;
      accountNumber: string;
      ifsc: string;
      bankName: string;
      netAmount: number;
      purpose: string;
    }> = [
      {
        fileId: `MGM-LDH-${Date.now().toString().slice(-3)}1`,
        beneficiaryName: "Gurpreet Singh Dhillon",
        accountNumber: "50100492817291",
        ifsc: "HDFC0000034",
        bankName: "HDFC Bank Ltd",
        netAmount: 45000,
        purpose: "Vehicle Loan Final Disbursement",
      },
      {
        fileId: `MGM-LDH-${Date.now().toString().slice(-3)}2`,
        beneficiaryName: "Kulwant Kaur",
        accountNumber: "0296000100918273",
        ifsc: "PUNB0029600",
        bankName: "Punjab National Bank",
        netAmount: 28000,
        purpose: "Gold Loan Disbursement",
      },
      {
        fileId: `MGM-LDH-${Date.now().toString().slice(-3)}3`,
        beneficiaryName: "Amandeep Sharma",
        accountNumber: "38472910482",
        ifsc: "SBIN0001476",
        bankName: "State Bank of India",
        netAmount: 65000,
        purpose: "Commercial Auto Loan Disbursal",
      },
      {
        fileId: `MGM-LDH-${Date.now().toString().slice(-3)}4`,
        beneficiaryName: "Simranjit Vohra",
        accountNumber: "918020048172615",
        ifsc: "UTIB0000154",
        bankName: "Axis Bank Ltd",
        netAmount: 35000,
        purpose: "Two Wheeler Loan Disbursal",
      },
    ];

    const validatedRows: ParsedDisbursementRow[] = demoData.map((row, idx) => {
      const errs: string[] = [];
      const accCheck = ValidationService.validateAccountNumber(row.accountNumber);
      if (!accCheck.isValid) errs.push(accCheck.message || "Invalid account");

      const ifscCheck = ValidationService.validateIFSC(row.ifsc);
      if (!ifscCheck.isValid) errs.push(ifscCheck.message || "Invalid IFSC");

      if (row.netAmount <= 0) errs.push("Amount must be > ₹0");

      const dup = ValidationService.detectDuplicate(
        {
          beneficiaryName: row.beneficiaryName,
          accountNumber: row.accountNumber,
          netAmount: row.netAmount,
          paymentDate: new Date().toISOString().slice(0, 10),
          fileId: row.fileId,
        },
        existingPayments
      );

      return {
        id: `row-${idx}-${Date.now()}`,
        ...row,
        errors: errs,
        isDuplicate: dup.hasPotentialDuplicate,
      };
    });

    setParsedRows(validatedRows);
    setFileName("MGM_Demo_Disbursement_Batch.csv");
    showToast("Demo disbursement batch loaded with 4 validated entries.", "success");
  };

  // File Upload Parser
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (lines.length <= 1) {
        showToast("Uploaded file contains no data rows.", "warning");
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      const rows: ParsedDisbursementRow[] = [];

      dataLines.forEach((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 5) return;

        const fileId = parts[0] || `MGM-LDH-${Date.now().toString().slice(-4)}-${idx + 1}`;
        const beneficiaryName = parts[1] || `Beneficiary ${idx + 1}`;
        const accountNumber = parts[2] || "";
        const ifsc = (parts[3] || "").toUpperCase();
        const bankName = parts[4] || "Commercial Bank";
        const netAmount = Number(parts[5]) || 0;
        const purpose = parts[6] || "Loan Disbursement";

        const errs: string[] = [];
        if (!beneficiaryName) errs.push("Missing beneficiary name");

        const accCheck = ValidationService.validateAccountNumber(accountNumber);
        if (!accCheck.isValid) errs.push(accCheck.message || "Invalid account number");

        const ifscCheck = ValidationService.validateIFSC(ifsc);
        if (!ifscCheck.isValid) errs.push(ifscCheck.message || "Invalid IFSC");

        if (netAmount <= 0) errs.push("Amount must be greater than 0");

        const dup = ValidationService.detectDuplicate(
          {
            beneficiaryName,
            accountNumber,
            netAmount,
            paymentDate: new Date().toISOString().slice(0, 10),
            fileId,
          },
          existingPayments
        );

        rows.push({
          id: `csv-${Date.now()}-${idx}`,
          fileId,
          beneficiaryName,
          bankName,
          accountNumber,
          ifsc,
          netAmount,
          purpose,
          errors: errs,
          isDuplicate: dup.hasPotentialDuplicate,
        });
      });

      setParsedRows(rows);
      showToast(`Parsed ${rows.length} rows from ${file.name}.`, "info");
    };

    reader.readAsText(file);
  };

  const validRows = parsedRows.filter((r) => r.errors.length === 0);
  const totalAmount = validRows.reduce((sum, r) => sum + r.netAmount, 0);

  const handleSubmitAll = () => {
    if (validRows.length === 0) {
      showToast("No valid rows available to submit.", "warning");
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();
    const paymentDate = now.slice(0, 10);

    for (const row of validRows) {
      const newPaymentId = `PAY-MGM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      const payment: Payment = {
        id: newPaymentId,
        branchId: currentBranch.id,
        branchName: currentBranch.name,
        makerId: currentUser.id,
        makerName: currentUser.name,
        fileId: row.fileId,
        beneficiaryName: row.beneficiaryName,
        bankName: row.bankName,
        accountNumber: row.accountNumber,
        ifsc: row.ifsc,
        method: row.netAmount >= 200000 ? "RTGS" : "NEFT",
        grossAmount: row.netAmount,
        netAmount: row.netAmount,
        currency: "INR",
        paymentDate,
        debitAccountNumber,
        purpose: row.purpose,
        status: "PENDING_CHECKER",
        statusHistory: [
          {
            fromStatus: "DRAFT",
            toStatus: "PENDING_CHECKER",
            timestamp: now,
            changedBy: currentUser.name,
            role: currentUser.role,
          },
        ],
        supportingDocuments: [],
        createdAt: now,
        updatedAt: now,
        auditTrail: [
          {
            id: `audit-${Date.now()}-${newPaymentId}`,
            timestamp: now,
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            action: "PAYMENT_CREATED_BY_MAKER",
            details: `Bulk spreadsheet upload (${fileName || "CSV"}) submitted to Checker Queue for ₹${row.netAmount.toLocaleString("en-IN")}`,
          },
        ],
      };

      StorageService.createPayment(payment);
    }

    setIsSubmitting(false);
    showToast(
      `Successfully queued ${validRows.length} payments totaling ${ValidationService.formatINR(totalAmount)} for Checker approval.`,
      "success",
      "Bulk Disbursement Queued"
    );
    onNavigate("checker-queue");
  };

  const handleRemoveRow = (id: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div id="bulk-payment-upload-tab" className="space-y-5 animate-in fade-in">
      {/* Top Banner and Actions */}
      <div className="p-6 rounded-3xl glass-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Bulk Disbursement File Ingestion
            </h2>
            <p className="text-xs text-white/60 mt-0.5">
              Upload loan disbursement batch files (.csv, .xlsx). Validate IFSC, account structures, and duplicate records before submitting to Checker queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition backdrop-blur-md"
            >
              <Download className="w-3.5 h-3.5 text-purple-300" />
              <span>Download CSV Template</span>
            </button>
            <button
              type="button"
              onClick={handleLoadDemoBatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Load Demo Disbursals</span>
            </button>
          </div>
        </div>

        {/* Source Debit Account Selection */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-white/80 mb-1.5">
              Source Corporate Debit Account <span className="text-rose-400">*</span>
            </label>
            <select
              value={debitAccountNumber}
              onChange={(e) => setDebitAccountNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white font-medium focus:ring-2 focus:ring-purple-500"
            >
              {debitAccounts.map((acc) => (
                <option key={acc.id} value={acc.accountNumber} className="bg-slate-900 text-white">
                  {acc.accountNumber} — {acc.bankName} ({acc.accountName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 mb-1.5">
              Disbursement Batch Origin
            </label>
            <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 flex items-center justify-between">
              <span>{currentBranch.name} ({currentBranch.code})</span>
              <span className="text-[11px] text-purple-300 font-bold">MAKER: {currentUser.name}</span>
            </div>
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        <div className="border-2 border-dashed border-white/20 hover:border-purple-400 rounded-3xl p-6 text-center hover:bg-white/5 transition cursor-pointer relative backdrop-blur-md">
          <input
            type="file"
            accept=".csv,.txt,.xlsx"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Upload className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <div className="text-xs font-bold text-white">
            {fileName ? `Loaded: ${fileName}` : "Drop disbursement CSV / Excel file here or click to browse"}
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            Required columns: File_ID, Beneficiary_Name, Account_Number, IFSC, Bank_Name, Amount, Purpose
          </p>
        </div>
      </div>

      {/* Summary Chips & Submit Button */}
      {parsedRows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-card">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-semibold border border-white/10">
              Total Rows: {parsedRows.length}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valid: {validRows.length}
            </span>
            {parsedRows.length - validRows.length > 0 && (
              <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Invalid: {parsedRows.length - validRows.length}
              </span>
            )}
            <span className="text-white/60">
              Total Value: <strong className="text-emerald-400 font-black text-sm">{ValidationService.formatINR(totalAmount)}</strong>
            </span>
          </div>

          <button
            id="btn-bulk-submit-to-checker"
            type="button"
            onClick={handleSubmitAll}
            disabled={validRows.length === 0 || isSubmitting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {isSubmitting ? "Queueing..." : `Submit ${validRows.length} Payments to Checker`}
            </span>
          </button>
        </div>
      )}

      {/* Parsed Rows Table */}
      {parsedRows.length > 0 && (
        <div className="rounded-3xl glass-card overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 text-xs font-bold text-white/80 uppercase tracking-wider">
            Parsed Disbursals Preview
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
                <tr className="border-b border-white/10 text-white/50 font-bold uppercase text-[10px]">
                  <th className="p-3">Ref / File ID</th>
                  <th className="p-3">Beneficiary</th>
                  <th className="p-3">Account & IFSC</th>
                  <th className="p-3">Bank</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {parsedRows.map((r) => (
                  <tr key={r.id} className="hover:bg-white/5 transition">
                    <td className="p-3 font-mono font-bold text-white">{r.fileId}</td>
                    <td className="p-3 font-semibold text-white">{r.beneficiaryName}</td>
                    <td className="p-3 font-mono text-white/70">
                      <div>{r.accountNumber}</div>
                      <span className="text-[10px] text-white/40">{r.ifsc}</span>
                    </td>
                    <td className="p-3 text-white/70">{r.bankName}</td>
                    <td className="p-3 text-right font-black text-emerald-400">
                      {ValidationService.formatINR(r.netAmount)}
                    </td>
                    <td className="p-3">
                      {r.errors.length === 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1" title={r.errors.join("; ")}>
                          <AlertTriangle className="w-3 h-3" /> {r.errors[0]}
                        </span>
                      )}
                      {r.isDuplicate && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Duplicate
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRemoveRow(r.id)}
                        className="p-1 text-white/40 hover:text-rose-400 rounded-lg hover:bg-white/10 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
