import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  History,
  ShieldCheck,
  Building2,
  Sparkles,
  Columns,
  Maximize,
  Copy,
  Check,
  User,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { ValidationService } from "../../services/validationService";
import { AIVerificationService } from "../../services/aiVerificationService";
import { Payment, UserProfile, PaymentDocument } from "../../types";
import { StatusBadge } from "../common/StatusBadge";
import { ConfirmModal } from "../common/ConfirmModal";
import { showToast } from "../common/ToastNotification";
import {
  generateRealisticVoucherSvg,
  generateChequeLeafSvg,
} from "../../services/seedData";
import {
  DocumentInspectionDeck,
  BoundingBoxField,
} from "../checker/DocumentInspectionDeck";
import { AmbientInfoButton } from "../common/AmbientInfoButton";
import { ReconciliationMatrix } from "../checker/ReconciliationMatrix";
import { CheckerActionDeck } from "../checker/CheckerActionDeck";
import { RejectModal, SendBackModal } from "../checker/CheckerModals";

interface CheckerReviewWorkspaceProps {
  paymentId: string;
  onNavigate: (view: string, params?: any) => void;
}

type LayoutMode = "balanced" | "doc-focus" | "data-focus";

export const CheckerReviewWorkspace: React.FC<CheckerReviewWorkspaceProps> = ({
  paymentId,
  onNavigate,
}) => {
  const [payment, setPayment] = useState<Payment | undefined>(
    StorageService.getPaymentById(paymentId)
  );
  const currentUser = StorageService.getCurrentUser();

  // Active Layout Mode
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("balanced");

  // Document Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isGrayscale, setIsGrayscale] = useState<boolean>(false);
  const [contrastBoost, setContrastBoost] = useState<number>(1.0);
  const [isInverted, setIsInverted] = useState<boolean>(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  // Active Spotlight Field (linked between document and comparison matrix)
  const [activeField, setActiveField] = useState<BoundingBoxField>(null);

  // Multi-Document Support (Voucher + Cheque Leaf + Uploaded Docs)
  const [uploadedDocs, setUploadedDocs] = useState<PaymentDocument[]>([]);
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [customDocUrl, setCustomDocUrl] = useState<string | null>(null);
  const [isMismatchDemoActive, setIsMismatchDemoActive] = useState<boolean>(false);

  // AI Verification State
  const [isAiRunning, setIsAiRunning] = useState<boolean>(false);

  // Workspace Tabs (Optical Verification vs Full Audit Trail)
  const [activeTab, setActiveTab] = useState<"verification" | "audit">("verification");

  // Modals State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isSendBackModalOpen, setIsSendBackModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("AMOUNT_MISMATCH");
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [sendBackNotes, setSendBackNotes] = useState("");
  const [sendBackError, setSendBackError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Build document list for the payment
  const getDocumentList = useCallback((): PaymentDocument[] => {
    if (!payment) return [];
    const baseDocs = payment.documents || payment.supportingDocuments || [];

    const defaultDocs: PaymentDocument[] = [
      {
        id: "doc-voucher-main",
        name: `Disbursal_Voucher_${payment.fileId || payment.id}.svg`,
        size: 345120,
        type: "image/svg+xml",
        uploadedAt: payment.createdAt,
        uploadedBy: payment.makerName,
        quality: "GOOD",
        dataUrl: generateRealisticVoucherSvg({
          id: payment.id,
          voucherNo: payment.fileId || payment.id,
          beneficiary: payment.beneficiaryName,
          accountNo: payment.accountNumber,
          ifsc: payment.ifsc,
          bankName: payment.bankName,
          amount: payment.netAmount,
          date: payment.paymentDate,
          purpose: payment.purpose,
        }),
      },
      {
        id: "doc-cheque-leaf",
        name: `Cancelled_Cheque_${payment.beneficiaryName.replace(/\s+/g, "_")}.svg`,
        size: 218900,
        type: "image/svg+xml",
        uploadedAt: payment.createdAt,
        uploadedBy: payment.makerName,
        quality: "GOOD",
        dataUrl: generateChequeLeafSvg({
          beneficiary: payment.beneficiaryName,
          accountNo: payment.accountNumber,
          ifsc: payment.ifsc,
          bankName: payment.bankName,
          amount: payment.netAmount,
          date: payment.paymentDate,
        }),
      },
    ];

    const sourceDocs = baseDocs.length > 0 ? baseDocs : defaultDocs;
    return [...sourceDocs, ...uploadedDocs];
  }, [payment, uploadedDocs]);

  const documentsList = getDocumentList();
  const currentDoc = documentsList[selectedDocIndex] || documentsList[0];
  const activeDocUrl = customDocUrl || currentDoc?.dataUrl || "";

  // Check Segregation of Duties
  const isMaker = payment ? payment.makerId === currentUser.id : false;
  const isMakerCheckerConflict = isMaker && currentUser.role !== "ADMIN";
  const hasDiscrepancy = payment?.aiVerification?.overallStatus === "MISMATCH";

  // Core AI Verification runner
  const runAiVerification = async (
    targetDocUrl: string,
    docName: string,
    mimeType: string = "image/png"
  ) => {
    if (!payment) return;
    setIsAiRunning(true);
    try {
      const preprocessed = await AIVerificationService.preprocessImage(
        targetDocUrl,
        {
          grayscale: isGrayscale,
          contrast: contrastBoost,
          rotation,
        }
      );

      const result = await AIVerificationService.verifyPaymentDocument(
        payment,
        preprocessed || targetDocUrl,
        docName,
        mimeType
      );

      StorageService.updatePayment({
        ...payment,
        aiVerification: result,
      });

      const fresh = StorageService.getPaymentById(payment.id);
      if (fresh) {
        setPayment(fresh);
      }

      showToast(
        result.overallStatus === "PASS"
          ? `OCR Verified (${result.documentType || "Document"}): 4/4 critical fields match.`
          : `OCR Complete (${result.documentType || "Document"}): Discrepancy detected.`,
        result.overallStatus === "PASS" ? "success" : "warning"
      );
    } catch (err) {
      console.error(err);
      showToast("Verification failed to execute", "danger");
    } finally {
      setIsAiRunning(false);
    }
  };

  // Re-run AI verification with active filters & active document
  const handleReRunAi = async () => {
    await runAiVerification(
      activeDocUrl,
      currentDoc?.name || "Document.png",
      currentDoc?.type || "image/png"
    );
  };

  // Demo voucher switchers
  const handleLoadSampleVoucher = (isMismatch: boolean) => {
    if (!payment) return;
    setIsMismatchDemoActive(isMismatch);
    const newAmount = isMismatch ? 3000 : payment.netAmount;
    const newDocUrl = generateRealisticVoucherSvg({
      id: payment.id,
      voucherNo: payment.fileId,
      beneficiary: payment.beneficiaryName,
      accountNo: isMismatch ? "0296000100089210" : payment.accountNumber,
      ifsc: payment.ifsc,
      bankName: payment.bankName,
      amount: newAmount,
      date: payment.paymentDate,
      purpose: payment.purpose,
      isMismatchTest: isMismatch,
    });
    setCustomDocUrl(newDocUrl);

    // Update AI verification state
    const simulatedResult = AIVerificationService.getLocalVerificationFallback(
      payment,
      newDocUrl,
      isMismatch ? "Voucher_Mismatch_Demo.svg" : "Disbursal_Voucher.svg"
    );

    StorageService.updatePayment({
      ...payment,
      aiVerification: simulatedResult,
    });

    const fresh = StorageService.getPaymentById(payment.id);
    if (fresh) {
      setPayment(fresh);
    }

    showToast(
      isMismatch
        ? "Loaded Mismatch Demo (Voucher shows ₹3,000 vs entered ₹30,000)"
        : "Loaded Matching Voucher Demo",
      isMismatch ? "warning" : "info"
    );
  };

  // Upload custom cheque leaf or voucher
  const handleUploadVoucher = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: PaymentDocument = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size: file.size,
        type: file.type || "image/png",
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser.name,
        quality: "GOOD",
        dataUrl,
      };

      setUploadedDocs((prev) => {
        const next = [...prev, newDoc];
        // Calculate new index
        const baseCount = (payment?.documents || payment?.supportingDocuments || []).length || 2;
        setSelectedDocIndex(baseCount + prev.length);
        return next;
      });

      setCustomDocUrl(dataUrl);
      showToast(`Uploaded document: ${file.name}. Processing OCR...`, "info");
      runAiVerification(dataUrl, file.name, file.type || "image/png");
    };
    reader.readAsDataURL(file);
  };


  // Approval handler
  const handleApprove = () => {
    if (!payment) return;
    if (isMakerCheckerConflict) {
      showToast("Cannot approve payment you created as Maker (RBI NBFC mandate)", "danger");
      return;
    }

    const res = StorageService.approvePayment(payment.id, currentUser);
    if (res.success) {
      const fresh = StorageService.getPaymentById(payment.id);
      if (fresh) setPayment(fresh);
      setIsApproveModalOpen(false);
      showToast(`Payment ${payment.fileId || payment.id} approved successfully`, "success");
      setTimeout(() => onNavigate("dashboard"), 1200);
    } else {
      showToast(res.error || "Approval failed", "danger");
    }
  };

  // Rejection handler
  const handleConfirmReject = () => {
    if (!payment) return;
    if (!rejectNotes.trim()) {
      setRejectError("Detailed audit explanation is required for compliance logging.");
      return;
    }

    const res = StorageService.rejectPayment(
      payment.id,
      currentUser,
      rejectReason,
      rejectNotes
    );
    if (res.success) {
      const fresh = StorageService.getPaymentById(payment.id);
      if (fresh) setPayment(fresh);
      setIsRejectModalOpen(false);
      showToast(`Payment ${payment.fileId || payment.id} rejected and logged in audit trail`, "info");
      setTimeout(() => onNavigate("dashboard"), 1200);
    } else {
      setRejectError(res.error || "Rejection failed");
    }
  };

  // Send back handler
  const handleConfirmSendBack = () => {
    if (!payment) return;
    if (!sendBackNotes.trim()) {
      setSendBackError("Please provide clear instructions for the Maker.");
      return;
    }

    const res = StorageService.sendBackToMaker(
      payment.id,
      currentUser,
      sendBackNotes
    );
    if (res.success) {
      const fresh = StorageService.getPaymentById(payment.id);
      if (fresh) setPayment(fresh);
      setIsSendBackModalOpen(false);
      showToast(`Payment ${payment.fileId || payment.id} returned to Maker for corrections`, "warning");
      setTimeout(() => onNavigate("dashboard"), 1200);
    } else {
      setSendBackError(res.error || "Action failed");
    }
  };

  // Copy Reference ID
  const handleCopyId = () => {
    if (!payment) return;
    navigator.clipboard.writeText(payment.fileId || payment.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        isApproveModalOpen ||
        isRejectModalOpen ||
        isSendBackModalOpen
      ) {
        return;
      }

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        setIsApproveModalOpen(true);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setIsRejectModalOpen(true);
      } else if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setIsSendBackModalOpen(true);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoomLevel((prev) => Math.min(3.0, Number((prev + 0.25).toFixed(2))));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoomLevel((prev) => Math.max(0.5, Number((prev - 0.25).toFixed(2))));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoomLevel(1);
        setRotation(0);
      } else if (e.key === "1") {
        e.preventDefault();
        setActiveField("amount");
      } else if (e.key === "2") {
        e.preventDefault();
        setActiveField("accountNumber");
      } else if (e.key === "3") {
        e.preventDefault();
        setActiveField("ifsc");
      } else if (e.key === "4") {
        e.preventDefault();
        setActiveField("beneficiary");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isApproveModalOpen, isRejectModalOpen, isSendBackModalOpen]);

  if (!payment) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <p className="text-sm font-semibold">Payment record not found.</p>
        <button
          onClick={() => onNavigate("dashboard")}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Grid layout classes based on active layoutMode
  const getGridCols = () => {
    switch (layoutMode) {
      case "doc-focus":
        return "lg:grid-cols-12 gap-5";
      case "data-focus":
        return "lg:grid-cols-12 gap-5";
      case "balanced":
      default:
        return "lg:grid-cols-12 gap-5";
    }
  };

  const getDocColSpan = () => {
    switch (layoutMode) {
      case "doc-focus":
        return "lg:col-span-7 xl:col-span-8";
      case "data-focus":
        return "lg:col-span-4 xl:col-span-4";
      case "balanced":
      default:
        return "lg:col-span-6 xl:col-span-6";
    }
  };

  const getDataColSpan = () => {
    switch (layoutMode) {
      case "doc-focus":
        return "lg:col-span-5 xl:col-span-4";
      case "data-focus":
        return "lg:col-span-8 xl:col-span-8";
      case "balanced":
      default:
        return "lg:col-span-6 xl:col-span-6";
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-300">
      {/* 1. Top Executive Navigation & Context Header */}
      <div className="p-4 rounded-3xl glass-card border border-white/15 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-queue"
            type="button"
            onClick={() => onNavigate("dashboard")}
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition active:scale-95"
            title="Return to Pending Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-tight">
                Checker Review Desk
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-purple-200 text-xs font-mono font-bold border border-white/15 transition"
                title="Copy File Reference ID"
              >
                <span>{payment.fileId || payment.id}</span>
                {copiedId ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/60" />}
              </button>
              <StatusBadge status={payment.status} size="sm" />
              <AmbientInfoButton
                id="checker-workspace-guide-btn"
                title="Forensic Checker Review Desk"
                subtitle="Dual-Pane Forensic Verification & Keyboard-Driven Audit"
                description="The primary inspection workspace for reviewing physical vouchers, cancelled cheques, or loan sanction notes against structured database records. Provides high-resolution zoom, inversion filters, optical bounding boxes, and 4-Eye authorization controls."
                roleNote="Checker & Admin"
                slaNote="Hotkeys: Shift+A (Approve), Shift+R (Reject), Shift+B (Send Back)"
                buttonLabel="Desk Guide"
                variant="screen"
                size="sm"
                steps={[
                  {
                    step: 1,
                    label: "Inspect Document Deck",
                    detail: "Use forensic tools (B&W filter, darkroom inversion, zoom up to 4x, optical OCR spotlight) to inspect faint ink or stamps.",
                  },
                  {
                    step: 2,
                    label: "Verify Field Matrix",
                    detail: "Compare Beneficiary Name, Account Number, IFSC, and Disbursement Amount against the optical OCR scan results.",
                  },
                  {
                    step: 3,
                    label: "Execute Authorization Decision",
                    detail: "Click 'Approve Disbursement' to release into Bank Export Engine, or 'Send Back to Maker' with remarks if corrections are required.",
                  },
                ]}
                keyFeatures={[
                  {
                    title: "Forensic Lens & Bounding Boxes",
                    desc: "Toggle optical OCR spotlight to highlight exactly where each field was detected on the voucher image.",
                  },
                  {
                    title: "Keyboard Shortcuts",
                    desc: "Accelerate verification using Shift+A (Approve), Shift+B (Send Back), and Shift+R (Reject).",
                  },
                  {
                    title: "Immutable Audit Trail",
                    desc: "All approvals, returns, and remarks are permanently logged with timestamps and user credentials.",
                  },
                ]}
                proTips={[
                  "Click on any field row in the comparison matrix to spotlight that coordinate on the voucher scan.",
                  "If account numbers do not match exactly, the system will prevent one-click approval until confirmed.",
                ]}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-purple-400" />
                <span>Maker: <strong>{payment.makerName}</strong></span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>{payment.branchName}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{new Date(payment.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Layout View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/10 backdrop-blur-md text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setLayoutMode("doc-focus")}
              className={`px-2.5 py-1 rounded-xl transition ${
                layoutMode === "doc-focus"
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white"
              }`}
              title="Give maximum width to the document canvas"
            >
              Doc Focus
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("balanced")}
              className={`px-2.5 py-1 rounded-xl transition ${
                layoutMode === "balanced"
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white"
              }`}
              title="50/50 Balanced side-by-side view"
            >
              50/50 Balanced
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("data-focus")}
              className={`px-2.5 py-1 rounded-xl transition ${
                layoutMode === "data-focus"
                  ? "bg-purple-600 text-white shadow-md font-bold"
                  : "text-white/60 hover:text-white"
              }`}
              title="Give maximum width to the reconciliation tables"
            >
              Data Focus
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main All-in-One Dual Stage Grid */}
      <div className={`grid grid-cols-1 ${getGridCols()}`}>
        {/* LEFT COLUMN: Supporting Document Inspection Deck */}
        <div className={getDocColSpan()}>
          <DocumentInspectionDeck
            docUrl={activeDocUrl}
            docName={currentDoc?.name || "Disbursal_Voucher.svg"}
            documentType={payment.aiVerification?.documentType}
            dynamicBoundingBoxes={payment.aiVerification?.boundingBoxes}
            activeField={activeField}
            onSelectField={setActiveField}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            rotation={rotation}
            setRotation={setRotation}
            isGrayscale={isGrayscale}
            setIsGrayscale={setIsGrayscale}
            contrastBoost={contrastBoost}
            setContrastBoost={setContrastBoost}
            isInverted={isInverted}
            setIsInverted={setIsInverted}
            showBoundingBoxes={showBoundingBoxes}
            setShowBoundingBoxes={setShowBoundingBoxes}
            onReRunAi={handleReRunAi}
            isAiRunning={isAiRunning}
            documentsList={documentsList}
            selectedDocIndex={selectedDocIndex}
            onSelectDocIndex={(idx) => {
              setSelectedDocIndex(idx);
              setCustomDocUrl(null);
              const target = documentsList[idx];
              if (target?.dataUrl) {
                runAiVerification(target.dataUrl, target.name, target.type || "image/png");
              }
            }}
            onLoadSampleVoucher={handleLoadSampleVoucher}
            onUploadVoucher={handleUploadVoucher}
            isMismatchDemoActive={isMismatchDemoActive}
          />
        </div>

        {/* RIGHT COLUMN: AI Optical Reconciliation & Audit Matrix */}
        <div className={`${getDataColSpan()} space-y-4`}>
          {/* Tabs for Right Column */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-1.5 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-1 text-xs font-semibold overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("verification")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "verification"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>3-Way Reconciliation</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("audit")}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === "audit"
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5 text-purple-300" />
                <span>Audit Log ({payment.auditTrail.length})</span>
              </button>
            </div>

            <div className="px-2 hidden md:block">
              <span className="text-[11px] font-mono text-white/50 whitespace-nowrap">
                Engine: {payment.aiVerification?.engine || "Gemini 3.8 Flash OCR"}
              </span>
            </div>
          </div>

          {/* TAB 1: 3-Way Optical Reconciliation Matrix & Action Deck */}
          {activeTab === "verification" && (
            <div className="space-y-4 animate-in fade-in">
              <ReconciliationMatrix
                payment={payment}
                aiResult={payment.aiVerification}
                activeField={activeField}
                onHoverField={setActiveField}
                onReRunAi={handleReRunAi}
                isAiRunning={isAiRunning}
                currentDocName={currentDoc?.name}
                documentType={payment.aiVerification?.documentType}
              />

              <CheckerActionDeck
                payment={payment}
                currentUser={currentUser}
                onOpenApproveModal={() => setIsApproveModalOpen(true)}
                onOpenRejectModal={() => setIsRejectModalOpen(true)}
                onOpenSendBackModal={() => setIsSendBackModalOpen(true)}
                isMakerCheckerConflict={isMakerCheckerConflict}
                hasDiscrepancy={hasDiscrepancy}
              />
            </div>
          )}

          {/* TAB 2: Regulatory Compliance & Immutable Audit Log */}
          {activeTab === "audit" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Detailed Payment Attributes */}
              <div className="p-4 rounded-3xl glass-card border border-white/15 space-y-3 text-xs text-white">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  <span>Transaction Blueprint Details</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-white/40 block text-[10px]">Payment Category:</span>
                    <span className="font-semibold">{payment.categoryLabel || payment.category || "DSA Commission"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Payment Rails:</span>
                    <span className="font-semibold">{payment.method} (CMS IDFC FIRST)</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Beneficiary Contact:</span>
                    <span className="font-semibold truncate block">{payment.beneficiaryEmail || "Verified via KYC"}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Maker Employee:</span>
                    <span className="font-semibold">{payment.makerName} (ID: {payment.makerId})</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Submission Time:</span>
                    <span className="font-mono">{new Date(payment.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">Regulatory Status:</span>
                    <span className="font-semibold text-emerald-300">RBI Master Direction NBFC compliant</span>
                  </div>
                </div>
              </div>

              {/* Complete Audit Trail */}
              <div className="p-4 rounded-3xl glass-card border border-white/15 space-y-3 text-xs text-white">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-purple-400" />
                  <span>Immutable Activity Ledger</span>
                </h4>

                <div className="space-y-3">
                  {payment.auditTrail.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3"
                    >
                      <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-white text-xs">{log.action}</span>
                          <span className="text-[10px] text-white/40 font-mono">
                            {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/70 mt-0.5">{log.details}</p>
                        <span className="text-[10px] text-purple-300/80 mt-1 block">
                          User: {log.userName} ({log.userRole})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Modals */}
      {/* Approval Modal */}
      <ConfirmModal
        isOpen={isApproveModalOpen}
        title="Authorize Payment for Banking Clearance"
        message={`Are you sure you want to approve payment ${payment.fileId || payment.id} of ${ValidationService.formatINR(payment.netAmount)} to ${payment.beneficiaryName}? This will advance the transaction to CMS bank file generation.`}
        confirmText="Confirm & Authorize Payout"
        cancelText="Cancel"
        variant="primary"
        onConfirm={handleApprove}
        onClose={() => setIsApproveModalOpen(false)}
      />

      {/* Rejection Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        reason={rejectReason}
        setReason={setRejectReason}
        notes={rejectNotes}
        setNotes={setRejectNotes}
        error={rejectError}
      />

      {/* Send Back to Maker Modal */}
      <SendBackModal
        isOpen={isSendBackModalOpen}
        onClose={() => setIsSendBackModalOpen(false)}
        onConfirm={handleConfirmSendBack}
        makerName={payment.makerName}
        notes={sendBackNotes}
        setNotes={setSendBackNotes}
        error={sendBackError}
      />
    </div>
  );
};
