import React from "react";
import { AlertTriangle, XCircle, CornerUpLeft } from "lucide-react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reason: string;
  setReason: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  error: string | null;
}

export const RejectModal: React.FC<RejectModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reason,
  setReason,
  notes,
  setNotes,
  error,
}) => {
  if (!isOpen) return null;

  const quickTemplates = [
    "Amount on voucher does not match entered payment record.",
    "Account number digit mismatch observed against cancelled cheque.",
    "IFSC code points to different bank than beneficiary passbook.",
    "Document voucher is blurred, illegible, or missing official MGM stamp.",
    "Duplicate payout requested for previously settled loan account.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-rose-500/30 bg-slate-950/90 shadow-2xl p-6 space-y-4 text-white">
        <div className="flex items-center gap-2.5 text-rose-400">
          <div className="p-2 rounded-2xl bg-rose-500/20">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Reject Payment Submission
            </h3>
            <p className="text-xs text-white/50">
              Mandatory audit trail entry for RBI NBFC compliance
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-white/80 mb-1.5">
            Rejection Reason Category <span className="text-rose-400">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl glass-dropdown text-white font-medium focus:ring-2 focus:ring-rose-500"
          >
            <option value="AMOUNT_MISMATCH" className="bg-slate-900 text-white">Amount Mismatch with Supporting Voucher</option>
            <option value="BENEFICIARY_NAME_MISMATCH" className="bg-slate-900 text-white">Beneficiary Name Mismatch</option>
            <option value="INCORRECT_ACCOUNT_OR_IFSC" className="bg-slate-900 text-white">Incorrect Account Number or IFSC</option>
            <option value="ILLEGIBLE_OR_DEGRADED_VOUCHER" className="bg-slate-900 text-white">Illegible or Blurred Voucher Document</option>
            <option value="DUPLICATE_TRANSACTION" className="bg-slate-900 text-white">Duplicate Payment Detected</option>
            <option value="UNAUTHORIZED_DISBURSEMENT" className="bg-slate-900 text-white">Unauthorized Disbursement Request</option>
            <option value="OTHER" className="bg-slate-900 text-white">Other Compliance Reason</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-white/80">
              Detailed Audit Explanation <span className="text-rose-400">*</span>
            </label>
            <span className="text-[10px] text-white/40">Visible to Maker &amp; Management</span>
          </div>
          <textarea
            rows={3}
            placeholder="Specify the exact discrepancy found for the audit trail..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl glass-input text-white focus:ring-2 focus:ring-rose-500"
          />

          {/* Quick template chips */}
          <div className="mt-2 space-y-1">
            <span className="text-[10px] text-white/40 font-semibold block">Quick Templates:</span>
            <div className="flex flex-wrap gap-1">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNotes(tmpl)}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] border border-white/10 transition"
                >
                  {tmpl.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-950/40 transition active:scale-95"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

interface SendBackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  makerName: string;
  notes: string;
  setNotes: (val: string) => void;
  error: string | null;
}

export const SendBackModal: React.FC<SendBackModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  makerName,
  notes,
  setNotes,
  error,
}) => {
  if (!isOpen) return null;

  const quickSendBackTemplates = [
    "Please re-upload a clear, high-resolution scan of the voucher slip.",
    "Please verify the net disbursement amount against the physical ledger.",
    "Please attach passbook or cancelled cheque copy to verify IFSC code.",
    "Please ensure authorized branch stamp is visible before resubmission.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl glass-card border border-amber-500/30 bg-slate-950/90 shadow-2xl p-6 space-y-4 text-white">
        <div className="flex items-center gap-2.5 text-amber-400">
          <div className="p-2 rounded-2xl bg-amber-500/20">
            <CornerUpLeft className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Send Back to Maker ({makerName})
            </h3>
            <p className="text-xs text-white/50">
              Payment will return to Draft state so Maker can adjust and resubmit
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-white/80 mb-1.5">
            Instructions for Maker <span className="text-amber-400">*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Describe what needs correction (e.g. upload legible voucher copy, correct amount digits)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-2xl glass-input text-white focus:ring-2 focus:ring-amber-500"
          />

          <div className="mt-2 space-y-1">
            <span className="text-[10px] text-white/40 font-semibold block">Quick Suggestion Templates:</span>
            <div className="flex flex-wrap gap-1">
              {quickSendBackTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNotes(tmpl)}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-[10px] border border-white/10 transition"
                >
                  {tmpl.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-950/40 transition active:scale-95"
          >
            Send Back to Maker
          </button>
        </div>
      </div>
    </div>
  );
};
