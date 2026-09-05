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

export interface BoundingBoxCoordinates {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  tag?: string;
}

export interface ExtractedFieldDetail {
  extracted: string | number | null;
  matched: boolean;
  confidence: ConfidenceLevel;
  readability: ReadabilityStatus;
  difference?: number | null;
  notes: string;
  box?: BoundingBoxCoordinates;
}

export interface AIVerificationResult {
  engine: "gemini-3.8-flash" | "calibrated-heuristic-engine" | "client-vision-ocr";
  verifiedAt: string;
  documentType?: "CHEQUE" | "VOUCHER" | "SANCTION_NOTE" | "GENERIC";
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
    date?: ExtractedFieldDetail;
    chequeNumber?: ExtractedFieldDetail;
  };
  boundingBoxes?: Record<
    string,
    { x: number; y: number; w: number; h: number; label: string; tag: string }
  >;
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

  // Phase 2 Traceability Links
  sourceType?: "MANUAL" | "COMMISSION_PAYABLE" | "BULK_UPLOAD";
  commissionPayableId?: string;
  disbursalId?: string;
  dsaId?: string;
  dsaName?: string;
  commissionRuleId?: string;
  commissionRuleVersion?: number;
  customerReference?: string;
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
  payableId?: string;
}

// ============================================================================
// PHASE 2: COMMISSION AUTOMATION TYPES & INTERFACES
// ============================================================================

export type AppPhase = "PHASE_1" | "PHASE_2";

export type DSAStatus = "ACTIVE" | "INACTIVE" | "ON_HOLD";
export type BankVerificationStatus = "VERIFIED" | "PENDING_VERIFICATION" | "FLAGGED";

export interface DSABankAuditRecord {
  id: string;
  dsaId: string;
  previousAccount: string;
  newAccount: string;
  previousIfsc: string;
  newIfsc: string;
  previousBank: string;
  newBank: string;
  previousHolderName: string;
  newHolderName: string;
  changedBy: string;
  changedByRole: UserRole;
  timestamp: string;
  reason: string;
  verificationStatus: BankVerificationStatus;
}

export interface DSAPartner {
  id: string; // e.g. DSA-LDH-001
  dsaCode: string; // e.g. ABC-FIN
  name: string; // e.g. ABC Finance
  legalName: string; // e.g. ABC Financial Advisory Services LLP
  contactPerson: string;
  mobile: string;
  email: string;
  branchId: string;
  branchName: string;
  pan: string;
  gstin?: string;
  
  // Banking details
  bankName: string;
  accountNumber: string;
  ifsc: string;
  accountHolderName: string;
  bankVerificationStatus: BankVerificationStatus;
  
  commissionScheme: string; // e.g. "Standard Retail Tier", "Gold Commercial Slabs"
  status: DSAStatus;
  effectiveDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Audit log of bank detail updates
  bankAuditHistory?: DSABankAuditRecord[];
}

export type LoanProductType =
  | "BUSINESS_LOAN"
  | "PERSONAL_LOAN"
  | "LOAN_AGAINST_PROPERTY"
  | "MICRO_ENTERPRISE_LOAN"
  | "USED_CAR_LOAN"
  | "HOME_LOAN";

export interface CommissionSlab {
  minAmount: number;
  maxAmount: number;
  commissionPercentage: number;
  ratePercentage?: number;
}

export type CommissionRuleType =
  | "DSA_SPECIFIC"
  | "BRANCH_SPECIFIC"
  | "PRODUCT_SPECIFIC"
  | "GLOBAL_FALLBACK"
  | "GLOBAL";

export interface CommissionRuleVersion {
  id: string;
  ruleId: string;
  version: number;
  commissionPercentage: number;
  effectiveFrom: string;
  effectiveUntil?: string;
  changedBy: string;
  changedAt: string;
  changeReason: string;
}

export interface CommissionRule {
  id: string; // e.g. RULE-PL-TIER1
  name: string; // e.g. Personal Loan Standard
  product: string; // e.g. "Personal Loan", "Business Loan", "Loan Against Property", "Used Car Loan", "Micro Enterprise Loan"
  dsaId?: string; // If DSA-specific
  dsaName?: string;
  branchId?: string; // If branch-specific
  branchName?: string;
  slabMin?: number; // in INR e.g. 100000
  slabMax?: number; // in INR e.g. 500000 (or Infinity)
  commissionPercentage?: number; // e.g. 1.25
  ruleType: CommissionRuleType;
  priority?: number;
  slabs?: CommissionSlab[];
  effectiveFrom: string; // YYYY-MM-DD
  effectiveUntil?: string; // YYYY-MM-DD
  effectiveTo?: string; // YYYY-MM-DD (alias)
  version: number; // 1, 2, 3...
  changeReason?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  versions?: CommissionRuleVersion[];
  versionHistory?: any[];
}

export type DisbursalStatus =
  | "READY"
  | "CALCULATED"
  | "MISSING_DSA"
  | "MISSING_RULE"
  | "DUPLICATE"
  | "ON_HOLD";

export interface Disbursal {
  id: string; // e.g. DISB-2026-001
  fileId: string; // e.g. MGM-45821
  applicationId?: string; // e.g. APP-99210
  disbursalDate: string;
  branchId: string;
  branchName: string;
  product: string;
  dsaId: string;
  dsaName: string;
  dsaCode?: string;
  customerReference: string;
  disbursalAmount: number;
  loanReference?: string;
  status: DisbursalStatus;
  
  // Rule metadata locked in during calculation
  applicableRuleId?: string;
  applicableRuleName?: string;
  applicableRuleVersion?: number;
  commissionRuleId?: string;
  commissionRuleVersion?: number;
  commissionRate?: number;
  commissionRatePercentage?: number;
  grossCommission?: number;
  netCommission?: number;
  tdsAmount?: number;
  
  duplicateOfFileId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  supportingDocumentUrl?: string;
}

export type AdjustmentType =
  | "TDS"
  | "RECOVERY"
  | "ADVANCE_ADJUSTMENT"
  | "BONUS"
  | "MANUAL_DEDUCTION"
  | "MANUAL_ADJUSTMENT"
  | "OTHER";

export interface CommissionAdjustment {
  id: string;
  type: AdjustmentType;
  amount: number; // in INR (reduction if positive, addition if negative)
  reason?: string;
  description?: string;
  adjustedBy?: string;
  appliedBy?: string;
  adjustedAt?: string;
  appliedAt?: string;
}

export type CommissionPayableStatus =
  | "CALCULATED"
  | "READY_FOR_PAYOUT"
  | "ON_HOLD"
  | "PAYMENT_GENERATED"
  | "PENDING_CHECKER"
  | "APPROVED"
  | "PAID"
  | "DISBURSED"
  | "REJECTED";

export interface CommissionPayable {
  id: string; // e.g. CP-00182
  disbursalId?: string;
  fileId: string;
  applicationId?: string;
  dsaId: string;
  dsaName: string;
  dsaCode?: string;
  dsaAccountNumber?: string;
  dsaIfsc?: string;
  dsaBankName?: string;
  dsaAccountHolderName?: string;
  branchId: string;
  branchName: string;
  product: string;
  customerReference: string;
  disbursalDate: string;
  disbursalAmount: number;
  
  // Commission calculation breakdown
  commissionRuleId: string;
  commissionRuleName?: string;
  commissionRuleVersion: number;
  commissionRate?: number; // e.g. 1.50%
  appliedRatePercentage?: number;
  grossCommission: number; // e.g. 12000
  tdsAmount?: number;
  
  adjustments: CommissionAdjustment[];
  totalAdjustments?: number; // sum of adjustments (e.g. 500)
  netPayable: number; // e.g. 11500
  
  status: CommissionPayableStatus;
  holdReason?: string;
  holdSetBy?: string;
  holdSetAt?: string;
  
  paymentId?: string; // Linked Phase 1 Payment ID (e.g. PAY-20260903-0042)
  calculatedAt?: string;
  calculatedBy?: string;
  auditTrail: AuditLogEntry[];
}

export interface PayoutStatementSummary {
  dsaId: string;
  dsaName: string;
  period: string; // e.g. "September 2026", "Q2 FY2026-27"
  branchName: string;
  totalDisbursalsCount: number;
  totalDisbursedAmount: number;
  grossCommission: number;
  totalAdjustments: number;
  netPayable: number;
  paidAmount: number;
  outstandingBalance: number;
  payables: CommissionPayable[];
  generatedAt: string;
  generatedBy: string;
}
