import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Trash2,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  X,
  Layers,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { showToast } from "./ToastNotification";

interface BlankSlateModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasData: boolean;
}

export const BlankSlateModal: React.FC<BlankSlateModalProps> = ({
  isOpen,
  onClose,
  hasData,
}) => {
  const [clearPartners, setClearPartners] = useState(false);

  if (!isOpen) return null;

  const handleClearData = () => {
    StorageService.clearMockData(clearPartners);
    showToast("Mock data detached! Application is now in Blank Slate mode.", "info");
    onClose();
  };

  const handleRestoreData = () => {
    StorageService.resetToDemoData();
    showToast("Full sample demo data re-attached successfully!", "success");
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="blank-slate-modal"
        className="w-full max-w-lg rounded-3xl glass-card border border-white/20 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-gradient-to-b from-purple-500/20 via-blue-500/10 to-transparent blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-2xl border ${
                hasData
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-purple-500/10 border-purple-500/30 text-purple-300"
              }`}
            >
              {hasData ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {hasData ? "Clear Data for Client Testing" : "Blank Slate Active"}
              </h2>
              <p className="text-xs text-white/60 mt-0.5">
                {hasData
                  ? "Detach mock transactions to test with a clean blank slate"
                  : "Currently testing in fresh blank slate mode"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-5 space-y-4 relative z-10 text-xs">
          {hasData ? (
            <>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-white text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Safe Data Detachment</span>
                </div>
                <p className="text-white/70 leading-relaxed">
                  Clicking <strong>Clear Data</strong> will detach all active mock transactions, batches, export history, and commission calculations from view so your client can test new entries from scratch.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Mock definitions and files are NOT deleted and can be re-loaded anytime.</span>
                </div>
              </div>

              {/* What will be cleared */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                  Records that will be detached:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Payments & Checker Queue</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Payment Batches & Exports</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Phase 2 Disbursals</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-white/80">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Commission Payables</span>
                  </div>
                </div>
              </div>

              {/* Optional Partner Clear */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={clearPartners}
                  onChange={(e) => setClearPartners(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
                <div className="text-[11px] text-white/80">
                  <span className="font-semibold text-white">Also detach DSA Channel Partners & Custom Rules</span>
                  <p className="text-white/50 mt-0.5">
                    Unchecked by default to keep partner master directory available for quick disbursement testing.
                  </p>
                </div>
              </label>
            </>
          ) : (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">Blank Slate Active</h3>
              <p className="text-white/70 leading-relaxed max-w-sm mx-auto">
                The application is ready for fresh test inputs. You can create manual payments, upload CSV disbursal files, or test Maker-Checker approvals with zero mock interference.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-white/10 relative z-10">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium transition"
          >
            Close
          </button>

          {hasData ? (
            <button
              id="confirm-clear-data-btn"
              onClick={handleClearData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-rose-900/30 border border-white/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Data (Blank Slate)</span>
            </button>
          ) : (
            <button
              id="restore-demo-data-btn"
              onClick={handleRestoreData}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 border border-white/20 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restore Mock Demo Data</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
