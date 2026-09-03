import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Building,
  Hash,
  User,
  Info,
  FileSpreadsheet,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { ValidationService } from "../../services/validationService";
import { AIVerificationService } from "../../services/aiVerificationService";
import { generateRealisticVoucherSvg } from "../../services/seedData";
import { Payment, UserProfile, Branch, DebitAccount, AIVerificationResult } from "../../types";
import { showToast } from "../common/ToastNotification";
import { BulkPaymentUploadTab } from "./BulkPaymentUploadTab";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

interface CreatePaymentViewProps {
  onNavigate: (view: string, params?: any) => void;
}

export const CreatePaymentView: React.FC<CreatePaymentViewProps> = ({ onNavigate }) => {
  const currentUser = StorageService.getCurrentUser();
  const currentBranch = StorageService.getCurrentBranch();
  const debitAccounts = StorageService.getDebitAccounts();
  const existingPayments = StorageService.getPayments();

  // Form State
  const [creationMode, setCreationMode] = useState<"single" | "bulk">("single");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = useState(currentBranch.id);
  const [debitAccountNumber, setDebitAccountNumber] = useState(debitAccounts[0]?.accountNumber || "10084729104");
  const [fileId, setFileId] = useState(`MGM-LDH-${Date.now().toString().slice(-4)}`);
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [bankName, setBankName] = useState("State Bank of India");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [method, setMethod] = useState<"NEFT" | "RTGS" | "IMPS" | "IFT">("NEFT");
  const [netAmount, setNetAmount] = useState<string>("");
  const [purpose, setPurpose] = useState("Disbursement towards customer vehicle loan");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [remarks, setRemarks] = useState("");

  // Document & AI State
  const [documentUrl, setDocumentUrl] = useState<string>("");
  const [documentName, setDocumentName] = useState<string>("");
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIVerificationResult | null>(null);

  // Errors & Warnings
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Auto-switch to RTGS if amount >= 200,000
  const handleAmountChange = (val: string) => {
    setNetAmount(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 200000 && method === "NEFT") {
      setMethod("RTGS");
    }
  };

  // IFSC formatting
  const handleIfscChange = (val: string) => {
    const upper = val.toUpperCase().trim();
    setIfsc(upper);
  };

  // Real-time Duplicate Check
  useEffect(() => {
    if (accountNumber && netAmount) {
      const dup = ValidationService.detectDuplicate(
        {
          beneficiaryName,
          accountNumber,
          netAmount: Number(netAmount) || 0,
          paymentDate,
          fileId,
        },
        existingPayments
      );

      if (dup.hasPotentialDuplicate) {
        setDuplicateWarning(
          `Potential duplicate detected with Ref: ${dup.matchingPayment?.fileId || dup.matchingPayment?.id}. Reason: ${dup.matchingReasons.join("; ")}`
        );
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  }, [accountNumber, netAmount, beneficiaryName, paymentDate, fileId, existingPayments]);

  // Load Sample Voucher Helper for testing
  const handleLoadSampleVoucher = (mismatch: boolean = false) => {
    const voucherBeneficiary = mismatch ? "Rajwinder Singh" : "Harpreet Kaur";
    const voucherAcc = "50100239104820";
    const voucherIfsc = "HDFC0000034";
    const voucherBank = "HDFC Bank Ltd";
    const voucherAmt = mismatch ? 3000 : 25000;
    const inputAmt = mismatch ? 30000 : 25000;

    setBeneficiaryName(voucherBeneficiary);
    setAccountNumber(voucherAcc);
    setConfirmAccountNumber(voucherAcc);
    setIfsc(voucherIfsc);
    setBankName(voucherBank);
    setNetAmount(String(inputAmt));
    setPurpose("Customer Loan Disbursement - Gold Loan #91823");

    const svgData = generateRealisticVoucherSvg({
      id: "VCH-SAMPLE-108",
      beneficiary: voucherBeneficiary,
      accountNo: voucherAcc,
      ifsc: voucherIfsc,
      bank: voucherBank,
      amount: voucherAmt,
      date: paymentDate,
      purpose: "Customer Loan Disbursement",
      isMismatchTest: mismatch,
    });

    setDocumentUrl(svgData);
    setDocumentName(mismatch ? "MGM_Voucher_Mismatch_Demo.svg" : "MGM_Approved_Voucher_Demo.svg");
    setAiResult(null);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocumentUrl(ev.target.result as string);
        setAiResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Document Verification
  const handleRunAiVerification = async () => {
    if (!documentUrl) {
      showToast("Please upload or load a document voucher first.", "warning");
      return;
    }

    setIsAiScanning(true);
    try {
      const result = await AIVerificationService.verifyPaymentDocument(
        {
          beneficiaryName,
          accountNumber,
          ifsc,
          bankName,
          netAmount: Number(netAmount) || 0,
          paymentDate,
          remarks: remarks || (netAmount === "30000" && documentName.includes("Mismatch") ? "MISMATCH" : ""),
        },
        documentUrl
      );
      setAiResult(result);
      showToast(
        result.overallStatus === "PASS"
          ? "Document verification successful. All extracted values match."
          : `Discrepancy detected: ${result.summary}`,
        result.overallStatus === "PASS" ? "success" : "warning",
        "AI Verification"
      );
    } catch (err: any) {
      showToast("AI verification encountered an error: " + err.message, "danger", "Verification Error");
    } finally {
      setIsAiScanning(false);
    }
  };

  // Validation before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!beneficiaryName.trim()) {
      newErrors.beneficiaryName = "Beneficiary name is required.";
    }

    const accCheck = ValidationService.validateAccountNumber(accountNumber);
    if (!accCheck.isValid) {
      newErrors.accountNumber = accCheck.message || "Invalid account number.";
    }

    if (accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match. Please re-type carefully.";
    }

    const ifscCheck = ValidationService.validateIFSC(ifsc);
    if (!ifscCheck.isValid) {
      newErrors.ifsc = ifscCheck.message || "Invalid IFSC code.";
    }

    const amt = Number(netAmount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.netAmount = "Please enter a valid amount greater than ₹0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Payment
  const handleSubmit = (asDraft: boolean = false) => {
    if (!asDraft && !validateForm()) {
      return;
    }

    const now = new Date().toISOString();
    const newPaymentId = `PAY-MGM-${Date.now().toString().slice(-6)}`;
    const branch = StorageService.getBranches().find((b) => b.id === branchId) || currentBranch;

    const newPayment: Payment = {
      id: newPaymentId,
      branchId: branch.id,
      branchName: branch.name,
      makerId: currentUser.id,
      makerName: currentUser.name,
      fileId: fileId.trim() || newPaymentId,
      beneficiaryName: beneficiaryName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      ifsc: ifsc.trim().toUpperCase(),
      method,
      grossAmount: Number(netAmount),
      netAmount: Number(netAmount),
      currency: "INR",
      paymentDate,
      debitAccountNumber,
      purpose: purpose.trim(),
      beneficiaryEmail: beneficiaryEmail.trim() || undefined,
      beneficiaryPhone: beneficiaryPhone.trim() || undefined,
      status: asDraft ? "DRAFT" : "PENDING_CHECKER",
      statusHistory: [
        {
          fromStatus: "DRAFT",
          toStatus: asDraft ? "DRAFT" : "PENDING_CHECKER",
          timestamp: now,
          changedBy: currentUser.name,
          role: currentUser.role,
        },
      ],
      supportingDocuments: documentUrl
        ? [
            {
              id: `doc-${Date.now()}`,
              name: documentName || "Payment_Voucher.svg",
              url: documentUrl,
              mimeType: documentUrl.startsWith("data:image/svg") ? "image/svg+xml" : "image/png",
              uploadedAt: now,
              uploadedBy: currentUser.name,
              quality: aiResult?.documentQuality || "GOOD",
            },
          ]
        : [],
      aiVerification: aiResult || undefined,
      remarks: remarks.trim() || undefined,
      createdAt: now,
      updatedAt: now,
      auditTrail: [
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: asDraft ? "PAYMENT_SAVED_DRAFT" : "PAYMENT_CREATED_BY_MAKER",
          details: `${asDraft ? "Saved as draft" : "Submitted to checker queue"} by Maker ${currentUser.name} for ₹${Number(netAmount).toLocaleString("en-IN")}`,
        },
      ],
    };

    StorageService.createPayment(newPayment);

    showToast(
      asDraft
        ? `Payment draft for ₹${Number(netAmount).toLocaleString("en-IN")} saved.`
        : `Payment ${newPayment.fileId} queued for Checker approval.`,
      asDraft ? "info" : "success",
      asDraft ? "Draft Saved" : "Disbursement Queued"
    );

    // Navigate to checker review or payments list
    if (asDraft) {
      onNavigate("payments");
    } else {
      onNavigate("payments");
    }
  };

  return (
    <div id="create-payment-view" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-card">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("payments")}
            className="p-2.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-black tracking-tight text-white">
                Disbursement Entry (Maker View)
              </h1>
              <AmbientInfoButton
                id="create-payment-screen-guide"
                title="Disbursement Entry (Maker View)"
                subtitle="Dual-Control Maker Entry & Document Ingestion Desk"
                description="Allows authorized Makers to initiate loan payouts with rigorous bank validation. Input beneficiary bank coordinates, attach physical proof documents, and run automated AI optical OCR cross-checks before dispatching to the Checker queue."
                roleNote="Maker & Admin"
                slaNote="Maker Draft Cutoff: 17:30 IST"
                buttonLabel="Screen Guide"
                variant="screen"
                size="sm"
                steps={[
                  {
                    step: 1,
                    label: "Beneficiary Details",
                    detail: "Enter Customer File ID, Beneficiary Name, Bank Account Number (double-confirmed), and 11-digit IFSC.",
                  },
                  {
                    step: 2,
                    label: "Attach Voucher Scan",
                    detail: "Upload beneficiary cancelled cheque, passbook scan, or sanction voucher for optical verification.",
                  },
                  {
                    step: 3,
                    label: "AI Cross-Check",
                    detail: "Gemini 3.8 Flash extracts text coordinates from the document and alerts if numbers or names differ.",
                  },
                  {
                    step: 4,
                    label: "Queue for Checker",
                    detail: "Submit to the independent 4-Eye Checker queue for authorization before bank disbursal file generation.",
                  },
                ]}
                keyFeatures={[
                  {
                    title: "Double-Confirmed A/C Input",
                    desc: "Eliminates typographical fat-finger errors before submitting to the ledger.",
                  },
                  {
                    title: "Automated IFSC Validation",
                    desc: "Validates against standard Reserve Bank of India NEFT/RTGS bank routing rules.",
                  },
                  {
                    title: "Single & Bulk Modes",
                    desc: "Seamlessly switch between single manual entry and bulk multi-row spreadsheet uploads.",
                  },
                ]}
                proTips={[
                  "Use 'Load Realistic Demo Voucher' to quickly populate a test scan and simulate the complete AI pipeline.",
                  "Transactions over ₹2,00,000 will automatically recommend RTGS mode for gross real-time settlement.",
                ]}
              />
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Initiate single or bulk loan disbursements for {currentBranch.name} with AI optical verification.
            </p>
          </div>
        </div>

        {/* Mode Toggle Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={() => setCreationMode("single")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              creationMode === "single"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            Single Disbursement
          </button>
          <button
            type="button"
            onClick={() => setCreationMode("bulk")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              creationMode === "bulk"
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md"
                : "text-white/70 hover:text-white"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Bulk Spreadsheet Ingestion</span>
          </button>
        </div>
      </div>

      {creationMode === "bulk" ? (
        <BulkPaymentUploadTab
          currentBranch={currentBranch}
          currentUser={currentUser}
          onNavigate={onNavigate}
        />
      ) : (
        <>
          {/* Quick Testing Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl glass-card text-xs">
            <span className="text-white/60 font-medium">Quick Demo Vouchers:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-load-sample-voucher"
                type="button"
                onClick={() => handleLoadSampleVoucher(false)}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300 font-semibold hover:bg-emerald-500/25 transition backdrop-blur-md"
              >
                Load Sample Voucher (Pass)
              </button>
              <button
                id="btn-load-mismatch-voucher"
                type="button"
                onClick={() => handleLoadSampleVoucher(true)}
                className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/15 text-rose-300 font-semibold hover:bg-rose-500/25 transition backdrop-blur-md"
              >
                Load Mismatch Demo (₹30k vs ₹3k)
              </button>
            </div>
          </div>

      {/* Duplicate Warning Banner */}
      {duplicateWarning && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 backdrop-blur-xl">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-300">Duplicate Payment Warning</div>
            <p className="mt-0.5 leading-relaxed">{duplicateWarning}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, Document & AI Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Fields (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2">
              1. Payment Identification & Source
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Payment Date <span className="text-rose-400">*</span>
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Customer / File ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={fileId}
                  placeholder="e.g. MGM-LDH-2024-001"
                  onChange={(e) => setFileId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white font-mono uppercase focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Debit Account (MGM Bank Source) <span className="text-rose-400">*</span>
              </label>
              <select
                value={debitAccountNumber}
                onChange={(e) => setDebitAccountNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white focus:ring-2 focus:ring-purple-500 font-medium"
              >
                {debitAccounts.map((acc) => (
                  <option key={acc.id} value={acc.accountNumber} className="bg-slate-900 text-white">
                    {acc.accountNumber} — {acc.bankName} ({acc.accountName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Beneficiary Details */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2">
              2. Beneficiary Banking Coordinates
            </h2>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Beneficiary Name (as in Bank Account) <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-beneficiary-name"
                type="text"
                placeholder="Full official name"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                className={`w-full px-3 py-2 text-xs rounded-xl glass-input ${
                  errors.beneficiaryName ? "border-rose-500" : ""
                } text-white focus:ring-2 focus:ring-purple-500 font-semibold`}
              />
              {errors.beneficiaryName && (
                <span className="text-[11px] text-rose-400 mt-1 block">{errors.beneficiaryName}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Beneficiary Account Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-account-number"
                  type="text"
                  placeholder="9 to 18 digits"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl glass-input ${
                    errors.accountNumber ? "border-rose-500" : ""
                  } text-white font-mono focus:ring-2 focus:ring-purple-500`}
                />
                {errors.accountNumber && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.accountNumber}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Confirm Account Number <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-confirm-account-number"
                  type="text"
                  placeholder="Re-enter account number"
                  value={confirmAccountNumber}
                  onChange={(e) => setConfirmAccountNumber(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl glass-input ${
                    errors.confirmAccountNumber ? "border-rose-500" : ""
                  } text-white font-mono focus:ring-2 focus:ring-purple-500`}
                />
                {errors.confirmAccountNumber && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.confirmAccountNumber}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  IFSC Code <span className="text-rose-400">*</span>
                </label>
                <input
                  id="input-ifsc-code"
                  type="text"
                  placeholder="e.g. PUNB0029600"
                  maxLength={11}
                  value={ifsc}
                  onChange={(e) => handleIfscChange(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-xl glass-input ${
                    errors.ifsc ? "border-rose-500" : ""
                  } text-white font-mono uppercase focus:ring-2 focus:ring-purple-500 font-bold`}
                />
                {errors.ifsc && <span className="text-[11px] text-rose-400 mt-1 block">{errors.ifsc}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Beneficiary Bank Name
                </label>
                <input
                  type="text"
                  placeholder="Bank name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Amount & Payment Method */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 border-b border-white/10 pb-2">
              3. Amount & Transfer Classification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Net Amount (₹ INR) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-white/40">₹</span>
                  <input
                    id="input-net-amount"
                    type="number"
                    min="1"
                    placeholder="0.00"
                    value={netAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl glass-input ${
                      errors.netAmount ? "border-rose-500" : ""
                    } text-white font-mono font-black text-sm focus:ring-2 focus:ring-purple-500`}
                  />
                </div>
                {errors.netAmount && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.netAmount}</span>
                )}
                {netAmount && !isNaN(Number(netAmount)) && (
                  <div className="text-[11px] text-purple-300 font-semibold mt-1">
                    {ValidationService.formatINR(Number(netAmount))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="NEFT" className="bg-slate-900 text-white">NEFT (Standard)</option>
                  <option value="RTGS" className="bg-slate-900 text-white">RTGS (&ge; ₹2,00,000)</option>
                  <option value="IMPS" className="bg-slate-900 text-white">IMPS (Instant)</option>
                  <option value="IFT" className="bg-slate-900 text-white">IFT (Internal Transfer)</option>
                </select>
                {Number(netAmount) >= 200000 && method === "NEFT" && (
                  <span className="text-[10px] text-amber-300 block mt-1">
                    Note: RTGS is recommended for amounts &ge; ₹2 Lakhs.
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Purpose / Remarks for Bank CMS
              </label>
              <input
                type="text"
                value={purpose}
                maxLength={50}
                placeholder="Brief purpose (e.g. Loan disbursement)"
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white focus:ring-2 focus:ring-purple-500"
              />
              <span className="text-[10px] text-white/40 mt-1 block">
                Max 50 characters for IDFC FIRST Bank upload file description.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Supporting Document Upload & AI Analysis (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-6 rounded-3xl glass-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Supporting Document (Voucher)
                </h2>
                <AmbientInfoButton
                  id="create-payment-voucher-section-guide"
                  title="Voucher & OCR Cross-Check"
                  subtitle="Primary Audit Proof & Optical Intelligence"
                  description="The attached document (bank passbook, cancelled cheque, or voucher) serves as legal documentary evidence for the Checker. The Gemini AI engine extracts beneficiary coordinates to spot typographical or fraudulent discrepancies."
                  roleNote="Maker & Checker"
                  buttonLabel="AI OCR"
                  variant="section"
                  size="sm"
                  keyFeatures={[
                    {
                      title: "Optical Field Extraction",
                      desc: "Extracts Beneficiary Name, Account Number, IFSC, and Net Amount directly from pixels.",
                    },
                    {
                      title: "Automated Discrepancy Flagging",
                      desc: "Alerts if the bank account number typed into the form does not match the image.",
                    },
                  ]}
                />
              </div>
              {documentUrl && (
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Loaded
                </span>
              )}
            </div>

            {/* Document Preview Area */}
            {documentUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl border border-white/15 overflow-hidden bg-black/30 backdrop-blur-md flex items-center justify-center p-3 min-h-48 max-h-64 shadow-inner">
                  <img
                    src={documentUrl}
                    alt="Payment voucher"
                    className="max-h-60 w-auto object-contain rounded shadow-lg"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span className="truncate max-w-xs">{documentName || "Voucher"}</span>
                  <button
                    onClick={() => {
                      setDocumentUrl("");
                      setDocumentName("");
                      setAiResult(null);
                    }}
                    className="text-rose-400 hover:text-rose-300 hover:underline text-[11px]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-3xl p-6 text-center hover:border-purple-400 hover:bg-white/5 transition cursor-pointer relative backdrop-blur-md">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-white/50 mx-auto mb-2" />
                <div className="text-xs font-bold text-white">
                  Drop voucher here or click to browse
                </div>
                <p className="text-[10px] text-white/40 mt-1">
                  Supported formats: PNG, JPG, SVG, scanned vouchers
                </p>
              </div>
            )}

            {/* AI Document Pre-Check Button */}
            {documentUrl && (
              <button
                id="btn-run-ai-verification"
                type="button"
                onClick={handleRunAiVerification}
                disabled={isAiScanning}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 border border-white/20"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>
                  {isAiScanning ? "Analyzing Document with Gemini AI..." : "Run AI Pre-Check on Voucher"}
                </span>
              </button>
            )}

            {/* AI Pre-Check Result Card */}
            {aiResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in backdrop-blur-xl ${
                  aiResult.overallStatus === "PASS"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-100"
                    : "bg-rose-500/15 border-rose-500/30 text-rose-100 shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-1.5">
                    {aiResult.overallStatus === "PASS" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="text-white">AI Result: {aiResult.overallStatus}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                    {aiResult.matchedFieldsCount}/{aiResult.totalFieldsCount} Fields
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-white/80">{aiResult.summary}</p>
                {aiResult.discrepancies.length > 0 && (
                  <div className="pt-1.5 border-t border-rose-500/30 text-[10px] font-bold text-rose-300">
                    {aiResult.discrepancies.join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submission Action Card */}
          <div className="p-6 rounded-3xl glass-card space-y-3">
            <div className="text-xs text-white/50">
              <span className="font-bold text-white/80">Maker:</span> {currentUser.name} (
              {currentUser.role}) • <span className="font-bold text-white/80">Branch:</span>{" "}
              {currentBranch.name}
            </div>

            <button
              id="btn-submit-to-checker"
              type="button"
              onClick={() => handleSubmit(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Submit for Checker Approval</span>
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="w-full py-2 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-semibold text-xs transition"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
