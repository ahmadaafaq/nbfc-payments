import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Sliders,
  RefreshCw,
  FileText,
  Layers,
  Sparkles,
  Upload,
  Eye,
  Crosshair,
  CheckCircle2,
  ShieldCheck,
  Move,
  FileType,
} from "lucide-react";
import { PaymentDocument } from "../../types";

export type BoundingBoxField =
  | "beneficiary"
  | "accountNumber"
  | "ifsc"
  | "bankName"
  | "amount"
  | "stamp"
  | "voucherNo"
  | "date"
  | null;

interface DocumentInspectionDeckProps {
  docUrl: string;
  docName: string;
  activeField: BoundingBoxField;
  onSelectField: (field: BoundingBoxField) => void;
  zoomLevel: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  rotation: number;
  setRotation: React.Dispatch<React.SetStateAction<number>>;
  isGrayscale: boolean;
  setIsGrayscale: React.Dispatch<React.SetStateAction<boolean>>;
  contrastBoost: number;
  setContrastBoost: React.Dispatch<React.SetStateAction<number>>;
  isInverted: boolean;
  setIsInverted: React.Dispatch<React.SetStateAction<boolean>>;
  showBoundingBoxes: boolean;
  setShowBoundingBoxes: React.Dispatch<React.SetStateAction<boolean>>;
  onReRunAi: () => void;
  isAiRunning: boolean;
  documentsList: PaymentDocument[];
  selectedDocIndex: number;
  onSelectDocIndex: (idx: number) => void;
  onLoadSampleVoucher: (isMismatch: boolean) => void;
  onUploadVoucher: (file: File) => void;
  isMismatchDemoActive?: boolean;
}

// Bounding box percentages for the Disbursal Voucher (relative to 800x1050 SVG canvas)
const VOUCHER_BOUNDING_BOXES: Record<
  string,
  { x: number; y: number; w: number; h: number; label: string; tag: string }
> = {
  voucherNo: { x: 72, y: 7.2, w: 22, h: 4.8, label: "Voucher Reference", tag: "VOUCHER #" },
  beneficiary: { x: 7.5, y: 28.5, w: 85, h: 4.8, label: "Beneficiary Name", tag: "BENEFICIARY" },
  accountNumber: { x: 7.5, y: 34, w: 85, h: 4.8, label: "Account Number", tag: "ACCOUNT NO" },
  ifsc: { x: 7.5, y: 39.2, w: 45, h: 4.8, label: "IFSC Code", tag: "IFSC" },
  bankName: { x: 53.5, y: 39.2, w: 39, h: 4.8, label: "Bank Name", tag: "BANK" },
  amount: { x: 6, y: 49.2, w: 88, h: 8.5, label: "Net Payable Amount", tag: "NET AMOUNT (₹)" },
  stamp: { x: 37, y: 79.5, w: 16, h: 10.5, label: "Official MGM Physical Seal", tag: "OFFICIAL SEAL" },
};

export const DocumentInspectionDeck: React.FC<DocumentInspectionDeckProps> = ({
  docUrl,
  docName,
  activeField,
  onSelectField,
  zoomLevel,
  setZoomLevel,
  rotation,
  setRotation,
  isGrayscale,
  setIsGrayscale,
  contrastBoost,
  setContrastBoost,
  isInverted,
  setIsInverted,
  showBoundingBoxes,
  setShowBoundingBoxes,
  onReRunAi,
  isAiRunning,
  documentsList,
  selectedDocIndex,
  onSelectDocIndex,
  onLoadSampleVoucher,
  onUploadVoucher,
  isMismatchDemoActive,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Lock body scroll and listen for Escape key when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
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
  }, [isFullscreen]);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsPanning(true);
    setStartPan({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanPosition({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetAllFilters = () => {
    setZoomLevel(1);
    setRotation(0);
    setIsGrayscale(false);
    setContrastBoost(1.0);
    setIsInverted(false);
    setPanPosition({ x: 0, y: 0 });
  };

  // Preset zoom buttons
  const zoomIn = () => setZoomLevel((prev) => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
  const zoomOut = () => setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
  const rotateClockwise = () => setRotation((prev) => (prev + 90) % 360);

  // File upload change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadVoucher(file);
    }
  };

  const deckContent = (
    <div
      id="document-inspection-deck"
      className={`rounded-3xl glass-card flex flex-col transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-2 sm:inset-4 z-[99999] p-4 sm:p-6 bg-slate-950/98 border border-purple-500/40 shadow-2xl backdrop-blur-3xl overflow-y-auto space-y-3.5 text-white"
          : "p-5 space-y-3.5"
      }`}
    >
      {/* Top Document Header & Multi-Document Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/20 text-purple-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Document Inspection Deck {isFullscreen && "(Fullscreen Mode)"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>CTS-2010 / 300 DPI</span>
              </span>
            </div>
            <p className="text-[11px] text-white/50 truncate max-w-[280px]">
              {docName || "Disbursal_Voucher_MGM.svg"}
            </p>
          </div>
        </div>

        {/* Viewport Zoom & Stage Controls */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button
            id="btn-doc-zoom-out"
            type="button"
            onClick={zoomOut}
            title="Zoom Out (-25%)"
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition active:scale-95"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 text-[11px] font-mono font-bold text-purple-300 min-w-[44px] text-center select-none">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            id="btn-doc-zoom-in"
            type="button"
            onClick={zoomIn}
            title="Zoom In (+25%)"
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition active:scale-95"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/15 mx-0.5" />

          <button
            id="btn-doc-rotate"
            type="button"
            onClick={rotateClockwise}
            title="Rotate 90° Clockwise"
            className="p-1.5 rounded-xl hover:bg-white/15 text-white/80 hover:text-white transition active:scale-95"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-doc-reset-filters"
            type="button"
            onClick={resetAllFilters}
            title="Reset Pan, Zoom, & Filters"
            className="px-2 py-1 rounded-xl hover:bg-white/15 text-white/70 hover:text-white text-[10px] font-bold font-mono transition"
          >
            Reset
          </button>

          <button
            id="btn-doc-fullscreen"
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Inspect in Fullscreen Stage"}
            className={`p-1.5 rounded-xl transition active:scale-95 flex items-center gap-1 text-xs font-semibold ${
              isFullscreen
                ? "bg-purple-600 text-white shadow-md border border-purple-400/40"
                : "hover:bg-white/15 text-white/80 hover:text-white"
            }`}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Multi-Document Gallery Tabs (Disbursal Voucher, Bank Cheque, Sanction Note) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl bg-white/5 border border-white/10 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-semibold text-white/50 pl-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-purple-400" />
            <span>Attachments:</span>
          </span>

          {documentsList.length > 0 ? (
            documentsList.map((d, i) => (
              <button
                key={d.id || i}
                type="button"
                onClick={() => onSelectDocIndex(i)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap ${
                  selectedDocIndex === i
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md border border-white/20"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <FileType className="w-3 h-3" />
                <span className="max-w-[140px] truncate">{d.name}</span>
                {selectedDocIndex === i && <CheckCircle2 className="w-3 h-3 text-emerald-300 ml-0.5" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-semibold">
              Primary Disbursement Voucher
            </div>
          )}
        </div>

        {/* Quick Testing Bar & Upload Trigger */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="hidden"
          />

          <button
            id="btn-upload-voucher-trigger"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition"
            title="Upload custom voucher slip"
          >
            <Upload className="w-3 h-3 text-purple-300" />
            <span>Upload Slip</span>
          </button>

          {/* Preset Demo Vouchers for Checker Verification testing */}
          <div className="flex items-center gap-1">
            <button
              id="btn-doc-load-pass"
              type="button"
              onClick={() => onLoadSampleVoucher(false)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                !isMismatchDemoActive
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              Demo: Match
            </button>
            <button
              id="btn-doc-load-mismatch"
              type="button"
              onClick={() => onLoadSampleVoucher(true)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition border ${
                isMismatchDemoActive
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
              }`}
            >
              Demo: Mismatch
            </button>
          </div>
        </div>
      </div>

      {/* Forensic Inspection Filters (Enhance Carbon Copies, Low Ink, Faint Stamped Slips) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl glass-card-subtle text-[11px]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-white/60 font-bold">
            <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Forensic Lens:</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white font-medium transition">
            <input
              type="checkbox"
              checked={isGrayscale}
              onChange={(e) => setIsGrayscale(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span>B&amp;W (Clear Ink)</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white font-medium transition">
            <input
              type="checkbox"
              checked={isInverted}
              onChange={(e) => setIsInverted(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
            <span>Inverted (Darkroom)</span>
          </label>

          <div className="flex items-center gap-2 text-slate-700 dark:text-white/80 font-medium">
            <span>Contrast:</span>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={contrastBoost}
              onChange={(e) => setContrastBoost(parseFloat(e.target.value))}
              className="w-16 accent-purple-600 h-1.5 bg-slate-200 dark:bg-white/20 rounded-lg cursor-pointer"
            />
            <span className="font-mono text-[10px] text-purple-700 dark:text-purple-300 font-bold">{contrastBoost.toFixed(1)}x</span>
          </div>
        </div>

        {/* Optical Bounding Box Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-white/80 hover:text-slate-950 dark:hover:text-white transition">
            <Crosshair className={`w-3.5 h-3.5 ${showBoundingBoxes ? "text-purple-600 dark:text-purple-400" : "text-slate-400 dark:text-white/40"}`} />
            <span className="text-[11px] font-bold">Optical OCR Spotlight</span>
            <input
              type="checkbox"
              checked={showBoundingBoxes}
              onChange={(e) => setShowBoundingBoxes(e.target.checked)}
              className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Interactive Document Viewport (Drag to Pan + Zoom + Spotlight Overlays) */}
      <div
        id="document-viewport"
        ref={viewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative w-full rounded-2xl overflow-hidden flex items-center justify-center border border-white/15 bg-black/50 shadow-inner backdrop-blur-md select-none ${
          isFullscreen ? "h-[calc(100vh-250px)]" : "h-[490px]"
        } ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      >
        {/* Subtle Pan & Zoom Guidance Overlay */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none opacity-40 hover:opacity-100 transition">
          <div className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[10px] text-white flex items-center gap-1 backdrop-blur-md">
            <Move className="w-3 h-3 text-purple-400" />
            <span>Click &amp; drag to pan • Scroll to zoom</span>
          </div>
        </div>

        {/* Floating Active Field Spotlight Pill if user hovered a field */}
        {activeField && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-xl bg-purple-600/90 border border-purple-400/40 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 backdrop-blur-md animate-in fade-in zoom-in-95">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Spotlight: {VOUCHER_BOUNDING_BOXES[activeField]?.label || activeField}</span>
          </div>
        )}

        {/* Scalable & Pannable Document Container */}
        <div
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotation}deg)`,
            filter: `${isGrayscale ? "grayscale(100%)" : ""} ${
              isInverted ? "invert(100%)" : ""
            } contrast(${contrastBoost * 100}%)`,
            transition: isPanning ? "none" : "transform 0.15s ease-out, filter 0.15s ease-out",
            transformOrigin: "center center",
          }}
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {/* Main Document Image */}
          <div className="relative inline-block shadow-2xl rounded-lg overflow-hidden border border-white/20">
            <img
              src={docUrl}
              alt="Disbursement Voucher"
              draggable={false}
              className="max-h-[460px] w-auto select-none pointer-events-none block"
            />

            {/* Interactive Optical Bounding Boxes Overlay */}
            {showBoundingBoxes && (
              <div className="absolute inset-0 z-10 pointer-events-auto">
                {Object.entries(VOUCHER_BOUNDING_BOXES).map(([fieldKey, box]) => {
                  const isHighlighted = activeField === fieldKey;
                  return (
                    <div
                      key={fieldKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectField(fieldKey as BoundingBoxField);
                      }}
                      onMouseEnter={() => onSelectField(fieldKey as BoundingBoxField)}
                      onMouseLeave={() => onSelectField(null)}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                      }}
                      className={`absolute cursor-pointer rounded transition-all duration-200 border-2 ${
                        isHighlighted
                          ? "border-amber-400 bg-amber-400/25 shadow-lg shadow-amber-400/50 ring-2 ring-amber-300 animate-pulse"
                          : "border-purple-400/70 bg-purple-600/15 hover:border-purple-300 hover:bg-purple-600/30"
                      }`}
                      title={`${box.label} (Click to link to comparison)`}
                    >
                      <span
                        style={{ color: isHighlighted ? "#020617" : "#ffffff" }}
                        className={`absolute -top-3.5 left-0 text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md border whitespace-nowrap z-20 select-none ${
                          isHighlighted
                            ? "bg-amber-400 !text-slate-950 border-amber-300 scale-105"
                            : "bg-purple-700 !text-white border-purple-400/50 shadow-purple-950/60"
                        }`}
                      >
                        {box.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Footer Bar & Re-Scan Trigger */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-white/50 pt-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>MGM Hologram &amp; Official Seal Verified</span>
          </span>
          <span>•</span>
          <span>Pan: ({panPosition.x}px, {panPosition.y}px)</span>
        </div>

        <button
          id="btn-re-run-ai-scan"
          type="button"
          onClick={onReRunAi}
          disabled={isAiRunning}
          className="text-purple-300 hover:text-white font-semibold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAiRunning ? "animate-spin text-amber-300" : ""}`} />
          <span>{isAiRunning ? "Scanning with Gemini AI..." : "Re-Scan with Forensic Filters"}</span>
        </button>
      </div>
    </div>
  );

  // If in fullscreen mode, portal the whole deck directly to document.body to break out of all parent stacking contexts
  if (isFullscreen) {
    return (
      <>
        {/* Inline placeholder while portaled so the layout doesn't collapse */}
        <div className="p-8 rounded-3xl border border-dashed border-purple-500/30 bg-purple-950/20 text-center flex flex-col items-center justify-center gap-2 min-h-[300px]">
          <FileText className="w-8 h-8 text-purple-400 animate-pulse" />
          <p className="text-xs font-bold text-white">Document Inspection Deck is opened in Fullscreen Modal</p>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Return to Workspace Layout</span>
          </button>
        </div>
        {createPortal(deckContent, document.body)}
      </>
    );
  }

  return deckContent;
};

