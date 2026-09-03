import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "danger" | "warning" | "info";
  title?: string;
  message: string;
}

// Global emitter for toasts
type ToastListener = (toast: ToastMessage) => void;
const listeners: ToastListener[] = [];

export const showToast = (
  message: string,
  type: "success" | "danger" | "warning" | "info" = "info",
  title?: string
) => {
  const toast: ToastMessage = {
    id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    message,
    title,
  };
  listeners.forEach((fn) => fn(toast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: ToastListener = (toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 4)); // Max 4 toasts
      // Auto-dismiss after 4.5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
    };

    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      id="toast-notifications-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((t) => {
        const getStyles = () => {
          switch (t.type) {
            case "success":
              return {
                bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-100",
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
              };
            case "danger":
              return {
                bg: "bg-rose-950/80 border-rose-500/40 text-rose-100",
                icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
              };
            case "warning":
              return {
                bg: "bg-amber-950/80 border-amber-500/40 text-amber-100",
                icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
              };
            default:
              return {
                bg: "bg-slate-900/80 border-purple-500/40 text-slate-100",
                icon: <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />,
              };
          }
        };

        const { bg, icon } = getStyles();

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-3 flex items-start justify-between gap-3 ${bg}`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div className="text-xs">
                {t.title && <div className="font-bold text-white mb-0.5">{t.title}</div>}
                <p className="leading-relaxed opacity-90">{t.message}</p>
              </div>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
