export type UserRole = "ADMIN" | "MAKER" | "CHECKER" | "FINANCE";

export type PaymentStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_CHECKER"
  | "APPROVED"
  | "BANK_FILE_GENERATED"
  | "SUBMITTED_TO_BANK"
  | "PROCESSING"
  | "SUCCESSFUL"
  | "FAILED"
  | "REJECTED"
  | "RESUBMITTED"
  | "CANCELLED"
  | "RETURNED"
  | "ON_HOLD";

export type BankStatus =
  | "NOT_GENERATED"
  | "FILE_GENERATED"
  | "SUBMITTED_TO_BANK"
  | "PROCESSING"
  | "SUCCESSFUL"
  | "FAILED"
  | "RETURNED";

export type PaymentCategory =
  | "DSA_COMMISSION"
  | "EMPLOYEE_REIMBURSEMENT"
  | "SALARY"
  | "VENDOR_PAYMENT"
  | "EXPENSE"
  | "CUSTOMER_REFUND"
  | "INTERNAL_TRANSFER"
  | "OTHER";

export type PaymentMethod = "NEFT" | "RTGS" | "IFT" | "A2A";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW";

export type ReadabilityStatus = "FULLY_READABLE" | "PARTIALLY_READABLE" | "UNREADABLE";

export type AIOverallStatus = "PASS" | "PARTIAL_MATCH" | "MISMATCH" | "UNREADABLE" | "REVIEW_REQUIRED";

export type DocumentQuality = "GOOD" | "FAIR" | "POOR";

export interface Branch {
  id: string;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
  city: string;
  state: string;
  address: string;
  contactNumber: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  avatar?: string;
  department: string;
}

export interface DebitAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountIdentifier: string;
  accountName?: string;
  ifsc: string;
  branchName: string;
  balance: number;
  currency: string;
  isDefault: boolean;
}

export interface PaymentDocument {
  id: string;
  name: string;
  size?: number;
  type?: string;
  mimeType?: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
  dataUrl?: string; // Base64 or sample SVG/receipt URL
  thumbnailUrl?: string;
  quality: DocumentQuality;
  notes?: string;
}

export interface ExtractedFieldDetail {
  extracted: string | number | null;
  matched: boolean;
  confidence: ConfidenceLevel;
  readability: ReadabilityStatus;
  difference?: number | null;
  notes: string;
}

export interface AIVerificationResult {
  engine: "gemini-3.8-flash" | "calibrated-heuristic-engine";
  verifiedAt: string;
  documentQuality: DocumentQuality;
  overallStatus: AIOverallStatus;
  overallConfidence: ConfidenceLevel;
  matchedFieldsCount: number;
  totalFieldsCount: number;
  summary: string;
  fields: {
    beneficiary: ExtractedFieldDetail;
    accountNumber: ExtractedFieldDetail;
    ifsc: ExtractedFieldDetail;
    amount: ExtractedFieldDetail;
    bankName: ExtractedFieldDetail;
  };
  discrepancies: string[];
  warnings: string[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface FinancialChangeRecord {
  id: string;
  fieldName: string;
  previousValue: number | string;
  newValue: number | string;
  changedBy: string;
  changedByRole: UserRole;
  timestamp: string;
  reason?: string;
}

export interface BankSubmissionDetails {
  bankFileId?: string;
  bankFileName?: string;
  generatedAt?: string;
  generatedBy?: string;
  submittedAt?: string;
  submittedBy?: string;
  utrReference?: string;
  bankResponseDate?: string;
  bankRemarks?: string;
  failureReason?: string;
}

export interface Payment {
  id: string; // e.g. PAY-20260903-0042
  fileId: string; // e.g. MGM-45821
  category?: PaymentCategory;
  categoryLabel?: string;
  method: PaymentMethod;
  branchId: string;
  branchName: string;
  paymentDate: string;
  purpose: string;
  remarks?: string;

  // Beneficiary details
  beneficiaryName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  beneficiaryEmail?: string;
  beneficiaryPhone?: string;

  // Financial details
  disbursalAmount?: number; // Manual entry for phase 1
  commissionPercentage?: number;
  grossCommission?: number;
  grossAmount?: number;
  tdsAdjustment?: number;
  netAmount: number; // Final payable amount
  currency: string;
  utrNumber?: string;
  bankFileBatchId?: string;

  // Debit account
  debitAccountId?: string;
  debitAccountName?: string;
  debitAccountNumber: string;

  // Status & Maker-Checker
  status: PaymentStatus;
  bankStatus?: BankStatus;
  makerId: string;
  makerName: string;
  checkerId?: string;
  checkerName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  rejectionNotes?: string;
  createdAt: string;
  updatedAt: string;

  // Documents & AI
  documents?: PaymentDocument[];
  supportingDocuments?: PaymentDocument[];
  aiVerification?: AIVerificationResult;

  // History & Auditing
  auditTrail: AuditLogEntry[];
  financialChangeHistory?: FinancialChangeRecord[];
  statusHistory?: Array<{ fromStatus: string; toStatus: string; timestamp: string; changedBy: string; role?: string }>;

  // Batching & Bank tracking
  batchId?: string;
  bankSubmission?: BankSubmissionDetails;
  duplicateWarningOverridden?: boolean;
}

export interface PaymentBatch {
  id: string; // e.g. BATCH-20260903-01
  branchId: string;
  branchName: string;
  paymentDate?: string;
  paymentIds: string[];
  totalPayments?: number;
  totalCount?: number;
  approvedCount?: number;
  rejectedCount?: number;
  totalAmount: number;
  status: "DRAFT" | "SUBMITTED" | "CHECKER_REVIEW" | "APPROVED" | "BANK_FILE_GENERATED" | "BANK_SUBMITTED";
  createdBy?: string;
  createdById?: string;
  makerId?: string;
  makerName?: string;
  checker?: string;
  checkerId?: string;
  createdAt: string;
  updatedAt?: string;
  bankFileId?: string;
  bankFileName?: string;
}

export interface BankExportRecord {
  id: string;
  fileName: string;
  bankFormat?: "IDFC_FIRST" | "STANDARD_CMS";
  bankAdapter?: "IDFC_FIRST" | "STANDARD_CMS";
  paymentIds: string[];
  totalPayments: number;
  totalAmount: number;
  generatedBy: string;
  generatedAt: string;
  uploadedAt?: string;
  bankReferenceNumber?: string;
  status: "GENERATED" | "UPLOADED_TO_BANK" | "RECONCILED";
  notes?: string;
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "info" | "warning" | "success" | "danger";
  paymentId?: string;
  batchId?: string;
}
