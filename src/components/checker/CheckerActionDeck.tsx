import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  CornerUpLeft,
  AlertTriangle,
  ShieldAlert,
  ClipboardCheck,
  Keyboard,
  Clock,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { Payment, UserProfile } from "../../types";
import { StorageService } from "../../services/storageService";
import { ValidationService } from "../../services/validationService";

interface CheckerActionDeckProps {
  payment: Payment;
  currentUser: UserProfile;
  onOpenApproveModal: () => void;
  onOpenRejectModal: () => void;
  onOpenSendBackModal: () => void;
  isMakerCheckerConflict: boolean;
  hasDiscrepancy: boolean;
}

export const CheckerActionDeck: React.FC<CheckerActionDeckProps> = ({
  payment,
  currentUser,
  onOpenApproveModal,
  onOpenRejectModal,
  onOpenSendBackModal,
  isMakerCheckerConflict,
  hasDiscrepancy,
}) => {
  // Attestation Checklist items
  const [checks, setChecks] = useState({
    beneficiaryKyc: false,
    accountIfsc: false,
    amountWordsFigures: false,
    stampSignature: false,
  });

  const allChecked =
    checks.beneficiaryKyc &&
    checks.accountIfsc &&
    checks.amountWordsFigures &&
    checks.stampSignature;

  const handleAttestAll = () => {
    setChecks({
      beneficiaryKyc: true,
      accountIfsc: true,
      amountWordsFigures: true,
      stampSignature: true,
    });
  };

  // Duplicate Check against existing ledger
  const existingPayments = StorageService.getPayments();
  const dupResult = ValidationService.detectDuplicate(
    {
      beneficiaryName: payment.beneficiaryName,
      accountNumber: payment.accountNumber,
      netAmount: payment.netAmount,
      paymentDate: payment.paymentDate,
      fileId: payment.fileId,
      currentPaymentId: payment.id,
    },
    existingPayments
  );

  // Non-pending status rendering
  if (payment.status !== "PENDING_CHECKER") {
    return (
      <div id="checker-action-deck" className="space-y-4 text-white">
        <div className="p-5 rounded-3xl glass-card border border-white/15 space-y-3">
          <div className="flex items-center gap-3">
            {payment.status === "APPROVED" && (
              <>
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Payment Authorized for Disbursement</h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Authorized by {payment.checkerName || "Checker"} • Ready for CMS bank batching and file export.
                  </p>
                </div>
              </>
            )}

            {payment.status === "BANK_FILE_GENERATED" && (
              <>
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Bank Export File Generated</h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    File: <span className="font-mono text-purple-300 font-bold">{payment.bankFileBatchId || "IDFC_CMS_BATCH"}</span> • Awaiting bank settlement feed.
                  </p>
                </div>
              </>
            )}

            {payment.status === "SUCCESSFUL" && (
              <>
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Disbursement Settled & Reconciled</h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Confirmed with Bank UTR: <span className="font-mono font-bold text-emerald-300">{payment.utrNumber || "IDFB00482910"}</span>
                  </p>
                </div>
              </>
            )}

            {payment.status === "REJECTED" && (
              <>
                <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Payment Rejected</h4>
                  <p className="text-xs text-rose-200 mt-0.5">
                    Reason: {payment.rejectionReason || "Verification failed"} • {payment.rejectionNotes}
                  </p>
                </div>
              </>
            )}

            {payment.status === "DRAFT" && (
              <>
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <CornerUpLeft className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Returned to Maker</h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Maker {payment.makerName} has been notified to correct and resubmit supporting documentation.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="checker-action-deck" className="space-y-4 text-slate-900 dark:text-white">
      {/* 1. Segregation of Duties & Duplicate Risk Alerts (if applicable) */}
      {isMakerCheckerConflict && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-3 backdrop-blur-xl">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Segregation of Duties Enforced (RBI NBFC Compliance):</span> You
            submitted this payment as Maker ({payment.makerName}). An independent checker must
            authorize this transaction.
          </div>
        </div>
      )}

      {dupResult.hasPotentialDuplicate && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">Potential Duplicate Alert: </span>
            {dupResult.matchingReasons.join(" • ")}
          </div>
        </div>
      )}

      {/* 2. Side-by-Side Lower Deck: Actions & Hotkeys on Left, Mandatory Attestation on Right */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        {/* LEFT COLUMN: Hotkeys and Primary Action Clearance Buttons */}
        <div
          id="checker-decision-actions-card"
          className="xl:col-span-5 p-4 rounded-3xl glass-card border border-white/15 flex flex-col justify-between gap-4 shadow-xl"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Checker Clearance Actions
                </span>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-400/30">
                Decision Terminal
              </span>
            </div>

            {/* Hotkeys Cheat Sheet */}
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] text-white/60 font-semibold">
                <Keyboard className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Hotkeys:</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-purple-300 font-bold shadow-2xs whitespace-nowrap">
                  [A] Approve
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-amber-300 font-bold shadow-2xs whitespace-nowrap">
                  [S] Return
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-rose-300 font-bold shadow-2xs whitespace-nowrap">
                  [R] Reject
                </kbd>
              </div>
            </div>
          </div>

          {/* Action Buttons Stack */}
          <div className="space-y-2 pt-1">
            {/* Main Primary Button: Approve Clearance */}
            <button
              id="btn-approve-payment"
              type="button"
              onClick={onOpenApproveModal}
              disabled={isMakerCheckerConflict}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-bold shadow-md border transition flex items-center justify-center gap-2 active:scale-98 whitespace-nowrap ${
                isMakerCheckerConflict
                  ? "opacity-40 cursor-not-allowed bg-slate-800 border-white/10 text-white/50"
                  : hasDiscrepancy
                  ? "bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-amber-900/30"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-white/20 text-white shadow-purple-900/30"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="truncate">
                {hasDiscrepancy ? "Authorize with Note" : "Approve Payment Clearance"}
              </span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono font-semibold ml-1">
                A
              </kbd>
            </button>

            {/* Secondary Buttons Row: Send Back & Reject */}
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-send-back-maker"
                type="button"
                onClick={onOpenSendBackModal}
                className="py-2.5 px-3 rounded-2xl border border-amber-500/30 bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 whitespace-nowrap shadow-xs"
              >
                <CornerUpLeft className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">Send Back</span>
                <kbd className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono">S</kbd>
              </button>

              <button
                id="btn-reject-payment"
                type="button"
                onClick={onOpenRejectModal}
                className="py-2.5 px-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 whitespace-nowrap shadow-xs"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">Reject</span>
                <kbd className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono">R</kbd>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mandatory Checker Attestation (RBI NBFC Audit Trail) */}
        <div
          id="checker-attestation-card"
          className="xl:col-span-7 p-4 rounded-3xl glass-card border border-white/15 space-y-3 shadow-xl flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Mandatory Checker Attestation (RBI NBFC Audit Trail)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAttestAll}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition"
              >
                Attest All Checkpoints
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-start gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5">
                <input
                  type="checkbox"
                  checked={checks.beneficiaryKyc}
                  onChange={(e) => setChecks({ ...checks, beneficiaryKyc: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-white block text-[11px]">
                    Beneficiary &amp; Purpose Match
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    KYC and loan agreement verified
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5">
                <input
                  type="checkbox"
                  checked={checks.accountIfsc}
                  onChange={(e) => setChecks({ ...checks, accountIfsc: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-white block text-[11px]">
                    Account &amp; IFSC Cleared
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    Validated with RBI banking directory
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5">
                <input
                  type="checkbox"
                  checked={checks.amountWordsFigures}
                  onChange={(e) => setChecks({ ...checks, amountWordsFigures: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-white block text-[11px]">
                    Figures &amp; Words Reconciled
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    Net amount checked against voucher slip
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer transition border border-white/5">
                <input
                  type="checkbox"
                  checked={checks.stampSignature}
                  onChange={(e) => setChecks({ ...checks, stampSignature: e.target.checked })}
                  className="mt-0.5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="font-semibold text-white block text-[11px]">
                    MGM Seal &amp; Maker Signature
                  </span>
                  <span className="text-[10px] text-white/50 block">
                    Physical stamp and authorizer sign verified
                  </span>
                </div>
              </label>
            </div>
          </div>

          {allChecked && (
            <div className="mt-2 p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/35 text-emerald-200 text-[11px] font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All 4 internal verification checkpoints attested. Ready for payment clearance.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
