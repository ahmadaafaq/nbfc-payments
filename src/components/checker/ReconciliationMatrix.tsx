import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Hash,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Landmark,
  FileCheck2,
  ArrowRightLeft,
  Sparkles,
  Info,
} from "lucide-react";
import { Payment, AIVerificationResult } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { BoundingBoxField } from "./DocumentInspectionDeck";

interface ReconciliationMatrixProps {
  payment: Payment;
  aiResult?: AIVerificationResult;
  activeField: BoundingBoxField;
  onHoverField: (field: BoundingBoxField) => void;
  onReRunAi: () => void;
  isAiRunning: boolean;
  currentDocName?: string;
  documentType?: "CHEQUE" | "VOUCHER" | "SANCTION_NOTE" | "GENERIC";
}

export const ReconciliationMatrix: React.FC<ReconciliationMatrixProps> = ({
  payment,
  aiResult,
  activeField,
  onHoverField,
  onReRunAi,
  isAiRunning,
  currentDocName,
  documentType,
}) => {
  const [showIfscDetails, setShowIfscDetails] = useState(true);
  const [showDebitPoolDetails, setShowDebitPoolDetails] = useState(false);

  const fields = aiResult?.fields;
  const isMismatch = aiResult?.overallStatus === "MISMATCH";
  const effectiveDocType = aiResult?.documentType || documentType || "VOUCHER";
  const docLabel =
    effectiveDocType === "CHEQUE"
      ? "Cheque Leaf (CTS-2010)"
      : effectiveDocType === "SANCTION_NOTE"
      ? "Loan Sanction Note"
      : "Disbursal Voucher";

  // Bank Directory Lookup via IFSC (uses extracted IFSC if valid, or payment IFSC)
  const docIfsc = fields?.ifsc?.extracted || payment.ifsc;
  const ifscInfo = ValidationService.lookupIFSC(docIfsc);

  // Amount in Words
  const enteredAmountWords = ValidationService.numberToIndianWords(payment.netAmount);
  const voucherAmount =
    fields?.amount?.extracted !== undefined && fields?.amount?.extracted !== null
      ? Number(fields.amount.extracted)
      : payment.netAmount;
  const voucherAmountWords = ValidationService.numberToIndianWords(voucherAmount);

  // Character Diff for Account Number
  const voucherAccStr = fields?.accountNumber?.extracted
    ? String(fields.accountNumber.extracted)
    : payment.accountNumber;
  const accCharDiff = ValidationService.compareStringsDigitByDigit(payment.accountNumber, voucherAccStr);

  const isAmtMatched = fields?.amount ? fields.amount.matched : Number(voucherAmount) === Number(payment.netAmount);
  const isAccMatched = fields?.accountNumber ? fields.accountNumber.matched : voucherAccStr === payment.accountNumber;
  const isPayeeMatched = fields?.beneficiary ? fields.beneficiary.matched : (fields?.beneficiary?.extracted || payment.beneficiaryName) === payment.beneficiaryName;
  const isIfscMatched = fields?.ifsc ? fields.ifsc.matched : true;

  const docBeneficiary = fields?.beneficiary?.extracted || payment.beneficiaryName;
  const docBankName = fields?.bankName?.extracted || (effectiveDocType === "CHEQUE" ? "HDFC Bank Ltd." : payment.bankName);

  return (
    <div id="reconciliation-matrix" className="space-y-4">
      {/* 1. Overall AI Assessment Banner */}
      {aiResult ? (
        <div
          className={`p-4 rounded-3xl border text-xs space-y-2.5 backdrop-blur-xl transition-all shadow-sm ${
            aiResult.overallStatus === "PASS"
              ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-100"
              : "bg-rose-500/15 border-rose-500/40 text-rose-100"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
            <div className="flex items-center gap-2">
              {aiResult.overallStatus === "PASS" ? (
                <div className="p-1 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-1 rounded-xl bg-rose-500/25 text-rose-400 animate-pulse">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-sm font-black tracking-tight text-white block">
                  {aiResult.overallStatus === "PASS"
                    ? `Clearance Passed • ${docLabel} Reconciled`
                    : `DISCREPANCY ALERT • ${docLabel} Attention Required`}
                </span>
                <span className="text-[10px] text-white/60 font-normal">
                  {aiResult.overallStatus === "PASS"
                    ? `Extracted data from ${currentDocName || docLabel} strictly reconciles with maker entry.`
                    : "Immediate checker intervention required before dual-signoff authorization."}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <StatusBadge confidence={aiResult.overallConfidence} size="sm" />
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-white font-bold border border-white/15">
                {aiResult.matchedFieldsCount}/{aiResult.totalFieldsCount} Matched
              </span>
            </div>
          </div>

          <p className="text-[11px] leading-relaxed font-medium text-white/85 bg-black/20 p-2.5 rounded-2xl border border-white/10">
            {aiResult.summary}
          </p>

          {aiResult.discrepancies.length > 0 && (
            <div className="pt-2 border-t border-rose-500/30 space-y-1">
              <span className="font-bold text-[11px] text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Detected Attention Points:</span>
              </span>
              <ul className="list-disc list-inside text-[11px] space-y-1 text-rose-200 pl-1">
                {aiResult.discrepancies.map((d, i) => (
                  <li key={i} className="font-semibold">{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-3xl glass-card border border-white/10 text-xs flex items-center justify-between text-white/70">
          <span>AI verification not yet executed for this document.</span>
          <button
            onClick={onReRunAi}
            disabled={isAiRunning}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            {isAiRunning ? "Scanning..." : "Run AI Verification"}
          </button>
        </div>
      )}

      {/* 2. Side-by-Side 3-Way Reconciliation Table */}
      <div className="rounded-3xl glass-card overflow-hidden border border-white/15 shadow-xl">
        <div className="p-3.5 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              3-Way Optical Reconciliation Matrix
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Live {docLabel}
            </span>
          </div>
          <span className="text-[10px] text-white/50 font-mono">
            Spotlight sync active • Hover row to highlight instrument
          </span>
        </div>

        <div className="divide-y divide-white/10 text-xs">
          {/* CRITICAL FIELD 1: Net Amount */}
          <div
            id="row-compare-amount"
            onMouseEnter={() => onHoverField("amount")}
            onMouseLeave={() => onHoverField(null)}
            className={`p-4 transition-all duration-150 ${
              activeField === "amount"
                ? "bg-purple-600/25 ring-1 ring-purple-400"
                : !isAmtMatched
                ? "bg-rose-500/15"
                : "hover:bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white">Net Amount (₹)</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    CRITICAL
                  </span>
                </div>
                <span className="text-[10px] text-white/50 block mt-0.5">Disbursal figure</span>
              </div>

              {/* Maker Record */}
              <div className="col-span-4">
                <span className="font-black text-sm text-white block">
                  {ValidationService.formatINR(payment.netAmount)}
                </span>
                <span className="text-[10px] text-purple-200 leading-tight block mt-0.5 font-semibold">
                  {enteredAmountWords}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">Entered by Maker (LMS)</span>
              </div>

              {/* Document Extracted */}
              <div className="col-span-4">
                <span
                  className={`font-black text-sm block ${
                    !isAmtMatched ? "text-rose-400" : "text-white"
                  }`}
                >
                  {voucherAmount !== undefined && voucherAmount !== null
                    ? ValidationService.formatINR(voucherAmount)
                    : "—"}
                </span>
                <span
                  className={`text-[10px] leading-tight block mt-0.5 font-semibold ${
                    !isAmtMatched ? "text-rose-300" : "text-purple-200"
                  }`}
                >
                  {voucherAmountWords}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">
                  Extracted from {docLabel}
                </span>
              </div>

              {/* Match Indicator */}
              <div className="col-span-1 text-right pt-1">
                {isAmtMatched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 ml-auto animate-pulse" />
                )}
              </div>
            </div>

            {/* Mismatch Alert Box */}
            {!isAmtMatched && (
              <div className="mt-3 p-3 rounded-2xl bg-rose-500/25 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-center justify-between">
                <div>
                  <span className="text-white font-bold">Variance Detected: </span>
                  Entered ₹{payment.netAmount.toLocaleString("en-IN")} vs {docLabel} ₹
                  {Number(voucherAmount).toLocaleString("en-IN")}
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[11px] font-black">
                  Diff: ₹{Math.abs(payment.netAmount - (Number(voucherAmount) || 0)).toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>

          {/* CRITICAL FIELD 2: Account Number (with Digit-by-Digit Diff) */}
          <div
            id="row-compare-account"
            onMouseEnter={() => onHoverField("accountNumber")}
            onMouseLeave={() => onHoverField(null)}
            className={`p-4 transition-all duration-150 ${
              activeField === "accountNumber"
                ? "bg-purple-600/25 ring-1 ring-purple-400"
                : !isAccMatched
                ? "bg-rose-500/15"
                : "hover:bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white">Bank Account</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    MANDATORY
                  </span>
                </div>
                <span className="text-[10px] text-white/50 block mt-0.5">Beneficiary credit A/C</span>
              </div>

              {/* Maker Record */}
              <div className="col-span-4">
                <span className="font-mono font-black text-sm tracking-wider text-white block">
                  {payment.accountNumber}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">Entered by Maker (LMS)</span>
              </div>

              {/* Document Extracted */}
              <div className="col-span-4">
                <span className={`font-mono font-black text-sm tracking-wider block ${!isAccMatched ? "text-rose-400" : "text-white"}`}>
                  {voucherAccStr || "—"}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">
                  Extracted from {docLabel}
                </span>
              </div>

              {/* Match Indicator */}
              <div className="col-span-1 text-right pt-1">
                {isAccMatched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 ml-auto" />
                )}
              </div>
            </div>

            {/* Visual Digit-by-Digit Diff (Monospace inspection) */}
            <div className="mt-2.5 p-2 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-white/50 text-[10px] font-semibold">Digit Match Inspection:</span>
              <div className="flex items-center gap-0.5 font-mono">
                {accCharDiff.map((item, idx) => (
                  <span
                    key={idx}
                    className={`px-1 py-0.5 rounded text-[10px] font-black ${
                      item.match
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-rose-500/40 text-rose-200 ring-1 ring-rose-400"
                    }`}
                  >
                    {item.char}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* FIELD 3: Beneficiary Name */}
          <div
            id="row-compare-beneficiary"
            onMouseEnter={() => onHoverField("beneficiary")}
            onMouseLeave={() => onHoverField(null)}
            className={`p-4 transition-all duration-150 ${
              activeField === "beneficiary"
                ? "bg-purple-600/25 ring-1 ring-purple-400"
                : !isPayeeMatched
                ? "bg-rose-500/15"
                : "hover:bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-3">
                <span className="font-bold text-white block">Beneficiary Name</span>
                <span className="text-[10px] text-white/50 block mt-0.5">Payee KYC Identity</span>
              </div>

              <div className="col-span-4">
                <span className="font-bold text-white block">{payment.beneficiaryName}</span>
                <span className="text-[9px] text-white/40 block mt-1">Entered by Maker (LMS)</span>
              </div>

              <div className="col-span-4">
                <span className={`font-bold block ${!isPayeeMatched ? "text-rose-400" : "text-white/90"}`}>
                  {docBeneficiary || "—"}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">
                  Extracted from {docLabel}
                </span>
              </div>

              <div className="col-span-1 text-right pt-1">
                {isPayeeMatched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 ml-auto" />
                )}
              </div>
            </div>
          </div>

          {/* FIELD 4: IFSC Code & Bank Name (With Built-in RBI Directory Decoder) */}
          <div
            id="row-compare-ifsc"
            onMouseEnter={() => onHoverField("ifsc")}
            onMouseLeave={() => onHoverField(null)}
            className={`p-4 transition-all duration-150 ${
              activeField === "ifsc" ? "bg-purple-600/25 ring-1 ring-purple-400" : "hover:bg-white/5"
            }`}
          >
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-3">
                <span className="font-bold text-white block">IFSC &amp; Bank</span>
                <span className="text-[10px] text-white/50 block mt-0.5">Clearing Gateway</span>
              </div>

              <div className="col-span-4 font-mono">
                <span className="font-black text-emerald-300 block">{payment.ifsc}</span>
                <span className="text-[11px] font-sans text-white/80 block mt-0.5 font-semibold">
                  {payment.bankName}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">Entered by Maker (LMS)</span>
              </div>

              <div className="col-span-4 font-mono">
                <span className="font-black text-emerald-300 block">{docIfsc || "—"}</span>
                <span className="text-[11px] font-sans text-white/80 block mt-0.5 font-semibold">
                  {docBankName}
                </span>
                <span className="text-[9px] text-white/40 block mt-1">
                  Extracted from {docLabel}
                </span>
              </div>

              <div className="col-span-1 text-right pt-1">
                {isIfscMatched ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 ml-auto" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400 ml-auto" />
                )}
              </div>
            </div>

            {/* Integrated Live RBI Clearing Directory Box */}
            <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>RBI Central Directory Verification ({docIfsc})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIfscDetails(!showIfscDetails)}
                  className="text-white/50 hover:text-white text-[10px] flex items-center gap-0.5 font-semibold transition-colors"
                >
                  <span>{showIfscDetails ? "Collapse" : "Expand Details"}</span>
                  {showIfscDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {showIfscDetails && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-white/40 block text-[10px]">Bank Entity:</span>
                    <span className="font-semibold text-white truncate block">{ifscInfo.bank}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Branch Office:</span>
                    <span className="font-semibold text-white truncate block">{ifscInfo.branch}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">City &amp; State:</span>
                    <span className="font-semibold text-white">{ifscInfo.city}, {ifscInfo.state}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Settlement Rails:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                        RTGS ✓
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                        NEFT ✓
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Integrated Source Debit Account Balance Check */}
      <div className="p-4 rounded-3xl glass-card-subtle border border-white/10 space-y-2.5 shadow-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white">
              Source Disbursal Pool Liquidity Check
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Sufficient Liquidity
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div>
            <span className="text-white/40 block text-[10px]">Debit Account:</span>
            <span className="font-semibold text-white block truncate">
              {payment.debitAccountName || "IDFC Main Disbursal A/C"}
            </span>
            <span className="font-mono text-white/50 text-[10px]">
              {payment.debitAccountNumber || "10084729104"}
            </span>
          </div>

          <div>
            <span className="text-white/40 block text-[10px]">Pool Available Balance:</span>
            <span className="font-black text-emerald-400 text-sm block">
              ₹4,85,00,000
            </span>
            <span className="text-[10px] text-white/50">Post-payout: ₹4,84,97,000</span>
          </div>

          <div>
            <span className="text-white/40 block text-[10px]">Disbursement Purpose:</span>
            <span className="font-medium text-white/80 block line-clamp-2">
              {payment.purpose}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
