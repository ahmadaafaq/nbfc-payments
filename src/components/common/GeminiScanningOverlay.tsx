import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Scan, ShieldCheck, Cpu, Eye, FileText, CheckCircle2 } from "lucide-react";

interface GeminiScanningOverlayProps {
  documentName?: string;
  documentType?: string;
  isCompact?: boolean;
  isModal?: boolean; // When true, renders via portal fixed in center of viewport
}

const SCAN_PHASES = [
  {
    phase: "1/3",
    title: "Multimodal Visual Inspection",
    detail: "Analyzing CTS-2010 watermark, layout structure & typography...",
    icon: Eye,
  },
  {
    phase: "2/3",
    title: "Optical Text Extraction",
    detail: "Extracting Payee Name, Account Digits, IFSC Code & Net Amount...",
    icon: Scan,
  },
  {
    phase: "3/3",
    title: "4-Way Cross-Reconciliation",
    detail: "Cross-matching pixels against Maker CMS record & fraud rules...",
    icon: ShieldCheck,
  },
];

export const GeminiScanningOverlay: React.FC<GeminiScanningOverlayProps> = ({
  documentName,
  documentType,
  isCompact = false,
  isModal = true,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % SCAN_PHASES.length);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const currentPhase = SCAN_PHASES[phaseIndex];
  const PhaseIcon = currentPhase.icon;

  const content = (
    <div
      id="gemini-scanning-centered-overlay"
      className={
        isModal
          ? "fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-xl p-4 animate-in fade-in duration-200 select-none overflow-hidden"
          : "absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md transition-all duration-300 select-none overflow-hidden"
      }
    >
      {/* 1. Animated Holographic Laser Scan Line */}
      <div className="absolute inset-x-0 z-10 pointer-events-none animate-laser-sweep">
        <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee,0_0_40px_#38bdf8]" />
        <div className="w-full h-16 bg-gradient-to-b from-cyan-500/15 to-transparent pointer-events-none" />
      </div>

      {/* 2. Optical Grid Pattern (Subtle Background) */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(168, 85, 247, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* 3. Centered Futuristic Gemini AI HUD Card */}
      <div
        className={`relative z-20 mx-auto rounded-3xl border border-purple-500/50 bg-slate-900/95 shadow-2xl shadow-purple-950/90 text-center backdrop-blur-2xl transition-all ${
          isCompact ? "p-5 max-w-xs space-y-3" : "p-6 sm:p-8 max-w-md w-full space-y-5"
        }`}
      >
        {/* Glowing Gemini Orb in Center */}
        <div className="relative mx-auto flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
          {/* Concentric Ping Rings */}
          <div className="absolute inset-0 rounded-full bg-purple-500/30 animate-ping" />
          <div className="absolute -inset-2 rounded-full border border-purple-400/40 animate-pulse" />
          <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-spin-slow" />

          {/* Center Orb */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-2xl shadow-purple-600/60 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950/90 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Prominent High-Contrast Title */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold tracking-wide uppercase">
            <Cpu className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
            <span>Gemini Vision AI Engine</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5 pt-1">
            <span>Scanning with Gemini AI...</span>
          </h3>

          {documentName && (
            <div className="text-xs font-mono text-purple-300/90 truncate max-w-xs mx-auto flex items-center justify-center gap-1.5 bg-white/5 py-1 px-3 rounded-lg border border-white/10 mt-1">
              <FileText className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span className="truncate">{documentName}</span>
            </div>
          )}
        </div>

        {/* Dynamic Scan Phase Card */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 text-left space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <PhaseIcon className="w-4 h-4 text-cyan-400 animate-bounce shrink-0" />
              <span>{currentPhase.title}</span>
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {currentPhase.phase}
            </span>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">
            {currentPhase.detail}
          </p>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 w-full animate-pulse" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white/60 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Optical Calibration Active</span>
            </span>
            <span>Sub-pixel OCR</span>
          </div>
        </div>

        {/* Telemetry Chips */}
        {!isCompact && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="px-3 py-1 rounded-xl text-[11px] font-mono bg-purple-950/80 border border-purple-500/40 text-purple-200">
              {documentType ? `Type: ${documentType}` : "CTS-2010 / Voucher"}
            </span>
            <span className="px-3 py-1 rounded-xl text-[11px] font-mono bg-cyan-950/80 border border-cyan-500/40 text-cyan-200">
              Bounding Boxes: Real-time
            </span>
            <span className="px-3 py-1 rounded-xl text-[11px] font-mono bg-emerald-950/80 border border-emerald-500/40 text-emerald-200">
              Maker-Checker Signoff
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (isModal) {
    if (!mounted || typeof document === "undefined") return null;
    return createPortal(content, document.body);
  }

  return content;
};
