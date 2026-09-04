import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, AlertTriangle, CheckCircle, ShieldCheck } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "primary" | "danger" | "success";
  details?: Array<{ label: string; value: string | React.ReactNode; isAlert?: boolean }>;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "primary",
  details,
  loading = false,
}) => {
  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !loading) {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getButtonClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-900/30 border border-rose-400/30";
      case "success":
        return "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/30 border border-emerald-400/30";
      case "primary":
      default:
        return "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30 border border-white/20";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "success":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-purple-400" />;
    }
  };

  const modalContent = (
    <div
      id="confirm-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        id="confirm-modal-box"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl glass-card bg-slate-950/95 shadow-2xl border border-white/20 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-slate-950/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 border border-white/15">
              {getIcon()}
            </div>
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {description && (
            <p className="text-xs text-white/70 leading-relaxed">
              {description}
            </p>
          )}

          {details && details.length > 0 && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-3.5 space-y-2.5 text-xs">
              {details.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 py-1 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/50 font-medium">{item.label}</span>
                  <span
                    className={`font-semibold text-right ${
                      item.isAlert
                        ? "text-rose-400 font-bold"
                        : "text-white"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 bg-white/5 border-t border-white/10 sticky bottom-0 bg-slate-950/90 backdrop-blur-md z-10">
          <button
            id="modal-cancel-button"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition disabled:opacity-50 border border-white/10"
          >
            {cancelText}
          </button>
          <button
            id="modal-confirm-button"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 ${getButtonClasses()}`}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
};
