import React from "react";
import {
  PaymentStatus,
  BankStatus,
  AIOverallStatus,
  ConfidenceLevel,
  DocumentQuality,
} from "../../types";
import { CheckCircle2, AlertTriangle, XCircle, Clock, ShieldAlert, FileText } from "lucide-react";

interface StatusBadgeProps {
  status?: PaymentStatus;
  bankStatus?: BankStatus;
  aiStatus?: AIOverallStatus;
  confidence?: ConfidenceLevel;
  quality?: DocumentQuality;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  bankStatus,
  aiStatus,
  confidence,
  quality,
  size = "md",
}) => {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  const baseClasses = "inline-flex items-center gap-1.5 font-semibold rounded-full backdrop-blur-md shadow-xs transition-all";

  // Payment Status Badges
  if (status) {
    switch (status) {
      case "APPROVED":
        return (
          <span
            className={`${baseClasses} bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 ${sizeClasses}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Approved
          </span>
        );
      case "PENDING_CHECKER":
        return (
          <span
            className={`${baseClasses} bg-amber-500/15 text-amber-300 border border-amber-400/30 ${sizeClasses}`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Pending Checker
          </span>
        );
      case "REJECTED":
        return (
          <span
            className={`${baseClasses} bg-rose-500/15 text-rose-300 border border-rose-400/30 ${sizeClasses}`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Rejected
          </span>
        );
      case "SUCCESSFUL":
        return (
          <span
            className={`${baseClasses} bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 ${sizeClasses}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Successful
          </span>
        );
      case "FAILED":
        return (
          <span
            className={`${baseClasses} bg-rose-500/15 text-rose-300 border border-rose-400/30 ${sizeClasses}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            Bank Failed
          </span>
        );
      case "BANK_FILE_GENERATED":
        return (
          <span
            className={`${baseClasses} bg-purple-500/15 text-purple-300 border border-purple-400/30 ${sizeClasses}`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-400" />
            Bank File Ready
          </span>
        );
      case "SUBMITTED_TO_BANK":
      case "PROCESSING":
        return (
          <span
            className={`${baseClasses} bg-blue-500/15 text-blue-300 border border-blue-400/30 ${sizeClasses}`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            At Bank
          </span>
        );
      case "DRAFT":
      default:
        return (
          <span
            className={`${baseClasses} bg-white/10 text-white/70 border border-white/15 ${sizeClasses}`}
          >
            Draft
          </span>
        );
    }
  }

  // AI Verification Status Badges
  if (aiStatus) {
    switch (aiStatus) {
      case "PASS":
        return (
          <span
            className={`${baseClasses} bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 ${sizeClasses}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            AI Verified (Pass)
          </span>
        );
      case "MISMATCH":
        return (
          <span
            className={`${baseClasses} bg-rose-500/15 text-rose-300 border border-rose-400/30 ${sizeClasses}`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            AI Mismatch Detected
          </span>
        );
      case "REVIEW_REQUIRED":
        return (
          <span
            className={`${baseClasses} bg-amber-500/15 text-amber-300 border border-amber-400/30 ${sizeClasses}`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            AI Review Required
          </span>
        );
      case "UNREADABLE":
        return (
          <span
            className={`${baseClasses} bg-white/10 text-white/70 border border-white/15 ${sizeClasses}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Doc Unreadable
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-white/10 text-white/60 border border-white/10 ${sizeClasses}`}
          >
            AI Pending
          </span>
        );
    }
  }

  // Confidence Badges
  if (confidence) {
    const config = {
      HIGH: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30",
      MEDIUM: "text-amber-300 bg-amber-500/15 border-amber-400/30",
      LOW: "text-rose-300 bg-rose-500/15 border-rose-400/30",
    }[confidence];

    return (
      <span className={`inline-flex items-center font-semibold rounded-full px-2 py-0.5 text-[10px] backdrop-blur-md border ${config}`}>
        {confidence} CONFIDENCE
      </span>
    );
  }

  // Quality Badges
  if (quality) {
    const config = {
      GOOD: "text-emerald-300 bg-emerald-500/15 border-emerald-400/30",
      FAIR: "text-amber-300 bg-amber-500/15 border-amber-400/30",
      POOR: "text-rose-300 bg-rose-500/15 border-rose-400/30",
    }[quality];

    return (
      <span className={`inline-flex items-center font-semibold rounded-full px-2 py-0.5 text-[10px] backdrop-blur-md border ${config}`}>
        QUALITY: {quality}
      </span>
    );
  }

  return null;
};
