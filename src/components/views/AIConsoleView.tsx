import React, { useState } from "react";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  Code,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { AIVerificationService } from "../../services/aiVerificationService";
import { generateRealisticVoucherSvg } from "../../services/seedData";
import { AIVerificationResult } from "../../types";
import { ValidationService } from "../../services/validationService";
import { StatusBadge } from "../common/StatusBadge";
import { showToast } from "../common/ToastNotification";
import { AmbientInfoButton } from "../common/AmbientInfoButton";

export const AIConsoleView: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<"pass" | "mismatch" | "poor">("pass");
  const [docImage, setDocImage] = useState<string>(
    generateRealisticVoucherSvg({
      id: "VCH-AI-101",
      beneficiary: "Harpreet Kaur",
      accountNo: "50100239104820",
      ifsc: "HDFC0000034",
      bank: "HDFC Bank Ltd",
      amount: 25000,
      date: "2024-11-20",
      purpose: "Customer Loan Disbursement",
      isMismatchTest: false,
    })
  );

  const [enteredBeneficiary, setEnteredBeneficiary] = useState("Harpreet Kaur");
  const [enteredAccount, setEnteredAccount] = useState("50100239104820");
  const [enteredIfsc, setEnteredIfsc] = useState("HDFC0000034");
  const [enteredAmount, setEnteredAmount] = useState("25000");

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<AIVerificationResult | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  // Switch preset
  const handleSelectPreset = (preset: "pass" | "mismatch" | "poor") => {
    setSelectedPreset(preset);
    setResult(null);

    if (preset === "pass") {
      setEnteredBeneficiary("Harpreet Kaur");
      setEnteredAccount("50100239104820");
      setEnteredIfsc("HDFC0000034");
      setEnteredAmount("25000");
      setDocImage(
        generateRealisticVoucherSvg({
          id: "VCH-AI-101",
          beneficiary: "Harpreet Kaur",
          accountNo: "50100239104820",
          ifsc: "HDFC0000034",
          bank: "HDFC Bank Ltd",
          amount: 25000,
          date: "2024-11-20",
          purpose: "Customer Loan Disbursement",
          isMismatchTest: false,
        })
      );
    } else if (preset === "mismatch") {
      setEnteredBeneficiary("Rajwinder Singh");
      setEnteredAccount("50100239104820");
      setEnteredIfsc("HDFC0000034");
      setEnteredAmount("30000"); // Entered 30,000 but voucher is 3,000!
      setDocImage(
        generateRealisticVoucherSvg({
          id: "VCH-AI-102",
          beneficiary: "Rajwinder Singh",
          accountNo: "50100239104820",
          ifsc: "HDFC0000034",
          bank: "HDFC Bank Ltd",
          amount: 3000,
          date: "2024-11-20",
          purpose: "Vehicle Loan",
          isMismatchTest: true,
        })
      );
    } else {
      setEnteredBeneficiary("Karanjit Kaur");
      setEnteredAccount("0296000100089260");
      setEnteredIfsc("PUNB0029600");
      setEnteredAmount("18500");
      setDocImage(
        generateRealisticVoucherSvg({
          id: "VCH-AI-103",
          beneficiary: "Karanjit Kaur",
          accountNo: "0296000100089260",
          ifsc: "PUNB0029600",
          bank: "Punjab National Bank",
          amount: 18500,
          date: "2024-11-20",
          purpose: "Disbursement",
          isMismatchTest: false,
        })
      );
    }
  };

  const handleRunScan = async () => {
    setIsScanning(true);
    try {
      const res = await AIVerificationService.verifyPaymentDocument(
        {
          beneficiaryName: enteredBeneficiary,
          accountNumber: enteredAccount,
          ifsc: enteredIfsc,
          netAmount: Number(enteredAmount) || 0,
          remarks: selectedPreset === "mismatch" ? "MISMATCH" : "",
        },
        docImage
      );
      setResult(res);
      showToast(`AI Verification completed: ${res.overallStatus}`, res.overallStatus === "PASS" ? "success" : "warning", "Verification Done");
    } catch (err: any) {
      showToast("Verification error: " + err.message, "danger", "AI Error");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setDocImage(ev.target.result as string);
        setResult(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div id="ai-console-view" className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              AI Document Verification Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gemini 3.8 Flash Multimodal</span>
            </span>
            <AmbientInfoButton
              id="ai-console-screen-guide"
              title="Gemini Multimodal Verification Console"
              subtitle="Computer Vision OCR & Forensic Cross-Verification"
              description="Interactive sandbox to evaluate the Google Gemini 3.8 Flash multimodal visual model. It processes scanned vouchers, passbook leaves, and cheques, extracts banking metadata, and calculates forensic similarity scores."
              roleNote="Risk & Compliance, Quality Assurance"
              slaNote="Latency: < 450ms per scan"
              buttonLabel="Console Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Load Test Document Preset",
                  detail: "Choose between 'Clean Voucher (100% Match)', 'Account Mismatch Trap', or 'Low-Quality Scan', or upload a custom image.",
                },
                {
                  step: 2,
                  label: "Trigger Optical Vision Pipeline",
                  detail: "Click 'Run AI Multimodal Cross-Check' to send image pixels and form metadata into the neural pipeline.",
                },
                {
                  step: 3,
                  label: "Review Optical Coordinates",
                  detail: "Inspect extracted field values, confidence ratings, and character-by-character mismatch highlights.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Sub-Second OCR Inference",
                  desc: "Extracts A/C numbers, IFSC routing codes, and beneficiary names in real time.",
                },
                {
                  title: "Optical Bounding Boxes",
                  desc: "Generates precise coordinates on the document scan to pinpoint exactly where data was read.",
                },
                {
                  title: "Raw JSON Inspection",
                  desc: "Developers can toggle raw machine-readable JSON payloads for backend integration.",
                },
              ]}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Multimodal document verification sandbox. Extracts critical banking coordinates and validates against transaction records.
          </p>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider block">
          Select Verification Test Preset
        </span>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleSelectPreset("pass")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedPreset === "pass"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Clean Voucher (100% Match)</span>
          </button>

          <button
            onClick={() => handleSelectPreset("mismatch")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedPreset === "mismatch"
                ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Amount Mismatch (₹30,000 vs ₹3,000)</span>
          </button>

          <button
            onClick={() => handleSelectPreset("poor")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedPreset === "poor"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Passbook Slip (Standard Match)</span>
          </button>
        </div>
      </div>

      {/* Interactive Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Record & Document Image (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
              Payment Record to Verify
            </h2>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={enteredBeneficiary}
                  onChange={(e) => setEnteredBeneficiary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                  Net Amount (₹)
                </label>
                <input
                  type="text"
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-black shadow-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                  Account Number
                </label>
                <input
                  type="text"
                  value={enteredAccount}
                  onChange={(e) => setEnteredAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono shadow-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block mb-1 uppercase tracking-wider">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={enteredIfsc}
                  onChange={(e) => setEnteredIfsc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase font-bold shadow-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                Document Preview
              </h2>
              <label className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Upload Custom Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center max-h-80 overflow-hidden shadow-inner">
              <img src={docImage} alt="Voucher preview" className="max-h-72 object-contain rounded-lg shadow-sm" />
            </div>

            <button
              onClick={handleRunScan}
              disabled={isScanning}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isScanning ? "Processing with Gemini Vision..." : "Run AI Verification"}</span>
            </button>
          </div>
        </div>

        {/* Right: AI Output & Analysis (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">
                AI Extraction &amp; Analysis Results
              </h2>
              {result && (
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="text-[11px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 font-mono font-semibold"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showRawJson ? "Hide JSON" : "View JSON"}</span>
                </button>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Status Banner */}
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    result.overallStatus === "PASS"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-sm font-black flex items-center gap-1.5">
                      {result.overallStatus === "PASS" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      )}
                      <span>Status: {result.overallStatus}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-black/40 text-slate-900 dark:text-white border border-slate-200 dark:border-white/15 font-bold">
                      {result.matchedFieldsCount}/{result.totalFieldsCount} Matched
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed font-medium text-slate-800 dark:text-slate-200">
                    {result.summary}
                  </p>
                </div>

                {/* Extracted Fields Table */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 text-xs overflow-hidden">
                  <div className="p-3 flex justify-between items-center bg-slate-50/60 dark:bg-slate-850/40">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Beneficiary Name:</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white mr-2">
                        {result.fields.beneficiary.extracted || "—"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          result.fields.beneficiary.matched
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {result.fields.beneficiary.matched ? "MATCH" : "MISMATCH"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Account Number:</span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 dark:text-white mr-2">
                        {result.fields.accountNumber.extracted || "—"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          result.fields.accountNumber.matched
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {result.fields.accountNumber.matched ? "MATCH" : "MISMATCH"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 flex justify-between items-center bg-slate-50/60 dark:bg-slate-850/40">
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">IFSC Code:</span>
                    <div className="text-right">
                      <span className="font-mono uppercase font-bold text-slate-900 dark:text-white mr-2">
                        {result.fields.ifsc.extracted || "—"}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          result.fields.ifsc.matched
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {result.fields.ifsc.matched ? "MATCH" : "MISMATCH"}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`p-3 flex justify-between items-center ${
                      !result.fields.amount.matched
                        ? "bg-rose-50 dark:bg-rose-950/40"
                        : ""
                    }`}
                  >
                    <span className="text-slate-600 dark:text-slate-400 font-semibold">Amount Extracted:</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-black text-slate-900 dark:text-white mr-2">
                        ₹{Number(result.fields.amount.extracted).toLocaleString("en-IN")}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                          result.fields.amount.matched
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {result.fields.amount.matched ? "MATCH" : "MISMATCH"}
                      </span>
                    </div>
                  </div>
                </div>

                {showRawJson && (
                  <pre className="p-3 rounded-xl bg-slate-900 dark:bg-slate-950 text-slate-100 text-[10px] font-mono overflow-x-auto max-h-52 border border-slate-800">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-600 dark:text-slate-400 text-xs font-medium bg-slate-50 dark:bg-slate-850/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                Click &quot;Run AI Verification&quot; to process the document with Gemini 3.8 Flash.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
