import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Info, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Lightbulb, 
  ShieldCheck, 
  ArrowRight,
  HelpCircle,
  Clock,
  BookOpen
} from "lucide-react";

export interface WorkflowStep {
  step: number | string;
  label: string;
  detail: string;
}

export interface KeyFeatureItem {
  title: string;
  desc: string;
}

export interface AmbientInfoButtonProps {
  id?: string;
  title: string;
  subtitle?: string;
  description: string;
  roleNote?: string;
  slaNote?: string;
  steps?: WorkflowStep[];
  keyFeatures?: (string | KeyFeatureItem)[];
  proTips?: string[];
  buttonLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "screen" | "section";
  className?: string;
}

export const AmbientInfoButton: React.FC<AmbientInfoButtonProps> = ({
  id,
  title,
  subtitle,
  description,
  roleNote,
  slaNote,
  steps,
  keyFeatures,
  proTips,
  buttonLabel,
  size = "md",
  variant = "screen",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "steps" | "tips">("overview");
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const buttonSizeClasses = {
    sm: "px-2 py-1 text-[11px] gap-1",
    md: "px-2.5 py-1.5 text-xs gap-1.5",
    lg: "px-3.5 py-2 text-xs gap-2",
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-4 h-4",
  }[size];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Ambient Light Halo + Button Trigger */}
      <button
        id={id || `ambient-info-btn-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
        type="button"
        onClick={() => setIsOpen(true)}
        title={`How this ${variant === "screen" ? "screen" : "section"} works`}
        className={`group relative inline-flex items-center rounded-full font-bold transition-all duration-300 active:scale-95 ${buttonSizeClasses} ${
          variant === "screen"
            ? "bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-600/60 shadow-sm hover:shadow-md"
            : "bg-white/90 dark:bg-slate-800/90 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/40 hover:bg-indigo-50/60"
        }`}
      >
        {/* Ambient Glowing Halo (Breathing multi-layer backlight) */}
        <span
          className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 opacity-60 blur-[3px] group-hover:opacity-90 group-hover:blur-[6px] transition-all duration-300 pointer-events-none -z-10 animate-pulse"
          aria-hidden="true"
        />

        {/* Ambient Ring Wave */}
        <span
          className="absolute -inset-0.5 rounded-full border border-purple-400/50 dark:border-purple-400/70 pointer-events-none -z-10"
          aria-hidden="true"
        />

        {/* Icon with glowing sparkle */}
        <span className="relative flex items-center justify-center">
          <Info className={`${iconSizes} text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-200`} />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping opacity-75" />
        </span>

        {/* Optional Label */}
        {buttonLabel && (
          <span className="font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300">
            {buttonLabel}
          </span>
        )}
      </button>

      {/* Floating Interactive Guide Modal */}
      {isOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
        >
          <div
            ref={modalRef}
            className="w-full max-w-xl max-h-[85vh] bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white transition-all scale-100 relative z-[100000]"
            style={{
              boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.35), 0 0 45px -5px rgba(99, 102, 241, 0.3)",
            }}
          >
            {/* Header with Ambient Gradient Glow */}
            <div className="relative p-5 sm:p-6 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white overflow-hidden shrink-0">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{variant === "screen" ? "Interactive Screen Guide" : "Section Deep-Dive"}</span>
                  </div>

                  <h2 id="guide-modal-title" className="text-lg sm:text-xl font-black tracking-tight text-white">
                    {title}
                  </h2>

                  {subtitle && (
                    <p className="text-xs text-purple-100 leading-relaxed font-medium">
                      {subtitle}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 shrink-0"
                  title="Close Guide (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Tags Row */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-white/15 text-[11px]">
                {roleNote && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/15 text-white font-bold border border-white/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Role: {roleNote}</span>
                  </span>
                )}
                {slaNote && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/15 text-white font-bold border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{slaNote}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-400/20 text-emerald-200 font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>No Manual Training Needed</span>
                </span>
              </div>
            </div>

            {/* Navigation Tabs if Steps or Tips Exist */}
            {(steps?.length || proTips?.length) ? (
              <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                    activeTab === "overview"
                      ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Overview &amp; Features</span>
                </button>

                {steps && steps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("steps")}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      activeTab === "steps"
                        ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Workflow Steps ({steps.length})</span>
                  </button>
                )}

                {proTips && proTips.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("tips")}
                    className={`flex-1 py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                      activeTab === "tips"
                        ? "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200 dark:border-slate-700"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Pro Tips ({proTips.length})</span>
                  </button>
                )}
              </div>
            ) : null}

            {/* Scrollable Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs leading-relaxed max-h-[50vh]">
              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-slate-800 dark:text-purple-200 leading-relaxed font-medium">
                    {description}
                  </div>

                  {/* Key Capabilities List */}
                  {keyFeatures && keyFeatures.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Key Capabilities &amp; Controls</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {keyFeatures.map((item, idx) => {
                          const isObj = typeof item === "object";
                          const itemTitle = isObj ? item.title : `Feature ${idx + 1}`;
                          const itemDesc = isObj ? item.desc : item;

                          return (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1"
                            >
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{itemTitle}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                                {itemDesc}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Workflow Steps */}
              {activeTab === "steps" && steps && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Step-by-Step Operator Guide
                  </h4>
                  <div className="space-y-2.5">
                    {steps.map((st, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {st.step}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="font-bold text-slate-900 dark:text-white text-xs">
                            {st.label}
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                            {st.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Pro Tips */}
              {activeTab === "tips" && proTips && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Best Practices &amp; Operational Shortcuts</span>
                  </h4>
                  <div className="space-y-2.5">
                    {proTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-slate-800 dark:text-amber-200"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed font-medium">
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with "Got it" action */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">Esc</kbd> anytime to dismiss
              </span>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto ml-auto px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Understood, Continue</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
