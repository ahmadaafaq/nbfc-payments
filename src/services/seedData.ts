import {
  Branch,
  UserProfile,
  DebitAccount,
  Payment,
  PaymentBatch,
  BankExportRecord,
  InAppNotification,
  AIVerificationResult,
  PaymentDocument,
} from "../types";

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "branch-ludhiyana",
    name: "Ludhiyana (Main)",
    code: "LDH-01",
    status: "ACTIVE",
    city: "Ludhiyana",
    state: "Punjab",
    address: "Ferozepur Road, Opposite PAU Gate No 1, Ludhiyana, Punjab 141004",
    contactNumber: "+91 161 5084920",
  },
  {
    id: "branch-navimumbai",
    name: "Navi Mumbai",
    code: "NMB-02",
    status: "ACTIVE",
    city: "Navi Mumbai",
    state: "Maharashtra",
    address: "Sector 17, Vashi Plaza, Navi Mumbai, Maharashtra 400703",
    contactNumber: "+91 22 27894210",
  },
  {
    id: "branch-kota",
    name: "Kota",
    code: "KOT-03",
    status: "ACTIVE",
    city: "Kota",
    state: "Rajasthan",
    address: "Aerodrome Circle, Jhalawar Road, Kota, Rajasthan 324007",
    contactNumber: "+91 744 2391084",
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: "user-ratul",
    name: "Ratul Mohindra",
    email: "ratul.mohindra@mgmfinanciers.com",
    role: "ADMIN",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    department: "Executive Administration",
  },
  {
    id: "user-kunal",
    name: "Kunal Singhania",
    email: "kunal.s@mgmfinanciers.com",
    role: "CHECKER",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    department: "Risk & Compliance Audit",
  },
  {
    id: "user-priya",
    name: "Priya Mehta",
    email: "priya.mehta@mgmfinanciers.com",
    role: "CHECKER",
    branchId: "branch-kota",
    branchName: "Kota",
    department: "Credit & Disbursement Control",
  },
  {
    id: "user-neha",
    name: "Neha Sharma",
    email: "neha.sharma@mgmfinanciers.com",
    role: "MAKER",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    department: "Loan Disbursals & Operations",
  },
  {
    id: "user-amit",
    name: "Amit Verma",
    email: "amit.verma@mgmfinanciers.com",
    role: "MAKER",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    department: "Branch Operations",
  },
  {
    id: "user-sunita",
    name: "Sunita Joshi",
    email: "sunita.finance@mgmfinanciers.com",
    role: "FINANCE",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    department: "Treasury & Bank Operations",
  },
];

export const INITIAL_DEBIT_ACCOUNTS: DebitAccount[] = [
  {
    id: "acc-idfc-main",
    bankName: "IDFC FIRST Bank",
    accountNumber: "10084729104",
    accountIdentifier: "IDFC Main Disbursal A/C",
    ifsc: "IDFB0020101",
    branchName: "Barakhamba Road, New Delhi",
    balance: 48500000,
    currency: "INR",
    isDefault: true,
  },
  {
    id: "acc-hdfc-pool",
    bankName: "HDFC Bank",
    accountNumber: "50200049281744",
    accountIdentifier: "HDFC Channel Payouts A/C",
    ifsc: "HDFC0000034",
    branchName: "Mall Road, Ludhiana",
    balance: 19200000,
    currency: "INR",
    isDefault: false,
  },
  {
    id: "acc-pnb-ops",
    bankName: "Punjab National Bank",
    accountNumber: "0296002100084920",
    accountIdentifier: "PNB Operational Expenses A/C",
    ifsc: "PUNB0029600",
    branchName: "Civil Lines, Ludhiana",
    balance: 6400000,
    currency: "INR",
    isDefault: false,
  },
];

// Helper to create realistic SVG vouchers for inspection
export function generateSampleVoucherSvg(params: {
  title: string;
  beneficiary: string;
  accountNo: string;
  ifsc: string;
  amount: number;
  bankName: string;
  voucherNo: string;
  date: string;
  purpose: string;
  isBlurry?: boolean;
}): string {
  const blurFilter = params.isBlurry
    ? `<filter id="blurEffect"><feGaussianBlur stdDeviation="3.2" /></filter>`
    : "";
  const filterAttr = params.isBlurry ? `filter="url(#blurEffect)"` : "";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
  <defs>
    ${blurFilter}
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
  </defs>

  <!-- Paper Background with subtle texture -->
  <rect width="800" height="1050" fill="#fcfbf9" stroke="#cbd5e1" stroke-width="2" />

  <g ${filterAttr}>
    <!-- Top Header Banner -->
    <rect x="30" y="30" width="740" height="110" rx="8" fill="url(#headerGrad)" />
    <text x="50" y="75" font-family="Georgia, serif" font-weight="bold" font-size="28" fill="#ffffff">MGM FINANCIERS PVT LIMITED</text>
    <text x="50" y="105" font-family="Arial, sans-serif" font-size="14" fill="#a7f3d0">CIN: U65921PB1995PTC018291 • RBI REGN: B-06.00281</text>
    <text x="50" y="125" font-family="Arial, sans-serif" font-size="12" fill="#6ee7b7">Regd Off: Ferozepur Road, Ludhiana, Punjab 141004</text>

    <rect x="580" y="50" width="170" height="70" rx="6" fill="#047857" opacity="0.8" />
    <text x="665" y="78" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff" text-anchor="middle">DISBURSAL VOUCHER</text>
    <text x="665" y="102" font-family="Courier, monospace" font-size="14" fill="#34d399" text-anchor="middle">#${params.voucherNo}</text>

    <!-- Metadata Row -->
    <line x1="30" y1="160" x2="770" y2="160" stroke="#e2e8f0" stroke-width="2" />
    <text x="40" y="190" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Voucher Date:</text>
    <text x="140" y="190" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#0f172a">${params.date}</text>

    <text x="320" y="190" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Branch:</text>
    <text x="380" y="190" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#0f172a">Ludhiyana (Main)</text>

    <text x="560" y="190" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Payment Mode:</text>
    <text x="670" y="190" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#047857">NEFT / RTGS</text>
    <line x1="30" y1="210" x2="770" y2="210" stroke="#e2e8f0" stroke-width="2" />

    <!-- Main Payment Table -->
    <rect x="40" y="235" width="720" height="380" rx="6" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect x="40" y="235" width="720" height="40" rx="6" fill="#f1f5f9" />
    <text x="60" y="260" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#334155">BENEFICIARY &amp; BANKING DETAILS</text>
    <text x="620" y="260" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#334155">VERIFIED</text>

    <!-- Row 1: Beneficiary -->
    <text x="60" y="310" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Beneficiary Name</text>
    <text x="260" y="310" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#0f172a">${params.beneficiary}</text>
    <line x1="40" y1="330" x2="760" y2="330" stroke="#f1f5f9" />

    <!-- Row 2: Account -->
    <text x="60" y="365" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Bank Account No.</text>
    <text x="260" y="365" font-family="Courier, monospace" font-weight="bold" font-size="18" fill="#0f172a" letter-spacing="1.5">${params.accountNo}</text>
    <line x1="40" y1="385" x2="760" y2="385" stroke="#f1f5f9" />

    <!-- Row 3: IFSC & Bank -->
    <text x="60" y="420" font-family="Arial, sans-serif" font-size="14" fill="#64748b">IFSC Code</text>
    <text x="260" y="420" font-family="Courier, monospace" font-weight="bold" font-size="16" fill="#047857">${params.ifsc}</text>
    <text x="440" y="420" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Bank Name:</text>
    <text x="530" y="420" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#0f172a">${params.bankName}</text>
    <line x1="40" y1="440" x2="760" y2="440" stroke="#f1f5f9" />

    <!-- Row 4: Purpose -->
    <text x="60" y="475" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Payment Purpose</text>
    <text x="260" y="475" font-family="Arial, sans-serif" font-size="15" fill="#334155">${params.purpose}</text>
    <line x1="40" y1="495" x2="760" y2="495" stroke="#f1f5f9" />

    <!-- Row 5: Amount Highlight Box -->
    <rect x="50" y="515" width="700" height="80" rx="6" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
    <text x="70" y="560" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#065f46">NET PAYABLE AMOUNT:</text>
    <text x="720" y="565" font-family="Arial, sans-serif" font-weight="900" font-size="32" fill="#047857" text-anchor="end">₹${params.amount.toLocaleString("en-IN")}</text>

    <!-- Disbursal Breakdown Box -->
    <rect x="40" y="640" width="720" height="150" rx="6" fill="#ffffff" stroke="#e2e8f0" />
    <text x="60" y="670" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#64748b">SUPPORTING ATTACHMENTS &amp; CALCULATION AUDIT:</text>
    <text x="60" y="700" font-family="Arial, sans-serif" font-size="13" fill="#334155">• Disbursal File Sanctioned Under MGM Micro-Enterprise Credit Scheme</text>
    <text x="60" y="725" font-family="Arial, sans-serif" font-size="13" fill="#334155">• Channel Commission calculated as per DSA Schedule FY 2026-Q2</text>
    <text x="60" y="750" font-family="Arial, sans-serif" font-size="13" fill="#334155">• Bank Account verified via cancelled cheque / passbook copy on file</text>

    <!-- Signatures & Stamps -->
    <g transform="translate(60, 830)">
      <line x1="0" y1="70" x2="160" y2="70" stroke="#94a3b8" stroke-dasharray="4 4" />
      <text x="80" y="90" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Prepared By (Maker)</text>
      <text x="80" y="110" font-family="Brush Script MT, cursive" font-size="20" fill="#0369a1" text-anchor="middle">Neha Sharma</text>
    </g>

    <g transform="translate(300, 830)">
      <!-- Official MGM Stamp -->
      <circle cx="60" cy="50" r="45" fill="none" stroke="#059669" stroke-width="2.5" stroke-dasharray="6 3" />
      <text x="60" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#059669" text-anchor="middle">MGM FINANCIERS</text>
      <text x="60" y="55" font-family="Arial, sans-serif" font-size="8" fill="#059669" text-anchor="middle">PVT LIMITED</text>
      <text x="60" y="68" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#047857" text-anchor="middle">VERIFIED</text>
    </g>

    <g transform="translate(520, 830)">
      <line x1="0" y1="70" x2="180" y2="70" stroke="#94a3b8" stroke-dasharray="4 4" />
      <text x="90" y="90" font-family="Arial, sans-serif" font-size="12" fill="#64748b" text-anchor="middle">Authorised Signatory</text>
      <text x="90" y="110" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">[Pending Checker Approval]</text>
    </g>

    <!-- Footer Bar -->
    <rect x="30" y="990" width="740" height="30" fill="#f8fafc" />
    <text x="400" y="1010" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Computer Generated Payment Document • MGM Core Financial Operations Platform</text>
  </g>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export function generateRealisticVoucherSvg(params: {
  id?: string;
  voucherNo?: string;
  beneficiary: string;
  accountNo: string;
  ifsc: string;
  bank?: string;
  bankName?: string;
  amount: number;
  date?: string;
  purpose?: string;
  title?: string;
  isMismatchTest?: boolean;
  isBlurry?: boolean;
}): string {
  return generateSampleVoucherSvg({
    title: params.title || "DISBURSAL VOUCHER",
    beneficiary: params.beneficiary,
    accountNo: params.accountNo,
    ifsc: params.ifsc,
    amount: params.amount,
    bankName: params.bankName || params.bank || "IDFC FIRST Bank",
    voucherNo: params.voucherNo || params.id || "VCH-2026-001",
    date: params.date || new Date().toISOString().slice(0, 10),
    purpose: params.purpose || "Disbursement Payout",
    isBlurry: params.isBlurry,
  });
}

// Generate realistic Indian CTS-2010 Bank Cheque leaf SVG
export function generateChequeLeafSvg(params: {
  beneficiary: string;
  accountNo: string;
  ifsc: string;
  bankName?: string;
  amount?: number;
  date?: string;
}): string {
  const bank = params.bankName || "Punjab National Bank";
  const ifsc = params.ifsc || "PUNB0029600";
  const acc = params.accountNo || "0296000100089260";
  const name = params.beneficiary || "Beneficiary";
  const dateStr = params.date || new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" width="900" height="420">
  <defs>
    <linearGradient id="chequeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4" />
      <stop offset="50%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#ecfdf5" />
    </linearGradient>
    <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 0 20 Q 10 0 20 20 T 40 20" fill="none" stroke="#d1fae5" stroke-width="0.8" />
    </pattern>
  </defs>

  <!-- Cheque Border & Paper -->
  <rect width="900" height="420" fill="url(#chequeBg)" stroke="#cbd5e1" stroke-width="2" rx="4" />
  <rect width="900" height="420" fill="url(#guilloche)" opacity="0.6" />

  <!-- Top-left Crossed Account Payee Stamp -->
  <g transform="translate(40, 20)">
    <line x1="0" y1="0" x2="60" y2="60" stroke="#047857" stroke-width="2" />
    <line x1="12" y1="0" x2="72" y2="60" stroke="#047857" stroke-width="2" />
    <text x="32" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="9" fill="#047857" transform="rotate(45 32 24)">A/C PAYEE ONLY</text>
  </g>

  <!-- Bank Branding & Header -->
  <text x="140" y="55" font-family="Georgia, serif" font-weight="bold" font-size="22" fill="#065f46">${bank.toUpperCase()}</text>
  <text x="140" y="75" font-family="Arial, sans-serif" font-size="11" fill="#475569">Civil Lines Branch, Ludhiana • RTGS / NEFT IFSC: ${ifsc}</text>

  <!-- Date Boxes (Top Right) -->
  <g transform="translate(680, 35)">
    <text x="-45" y="16" font-family="Arial, sans-serif" font-size="11" fill="#64748b">DATE</text>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
      <rect x="${i * 20}" y="0" width="18" height="22" fill="#ffffff" stroke="#94a3b8" />
      <text x="${i * 20 + 9}" y="15" font-family="Courier, monospace" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">${dateStr[i] || ""}</text>
    `).join("")}
  </g>

  <!-- Pay Line -->
  <text x="50" y="125" font-family="Arial, sans-serif" font-size="14" fill="#64748b">PAY</text>
  <line x1="90" y1="130" x2="760" y2="130" stroke="#94a3b8" stroke-dasharray="2 2" />
  <text x="110" y="123" font-family="Georgia, serif" font-weight="bold" font-size="16" fill="#0f172a">${name}</text>
  <text x="770" y="125" font-family="Arial, sans-serif" font-size="12" fill="#64748b">OR BEARER</text>

  <!-- Rupees Line -->
  <text x="50" y="175" font-family="Arial, sans-serif" font-size="14" fill="#64748b">RUPEES</text>
  <line x1="120" y1="180" x2="620" y2="180" stroke="#94a3b8" stroke-dasharray="2 2" />
  <text x="130" y="173" font-family="Arial, sans-serif" font-weight="600" font-size="13" fill="#334155">Supporting Disbursal Payout As Per Loan Schedule</text>

  <!-- Amount Box (Right) -->
  <rect x="640" y="150" width="220" height="42" fill="#ffffff" stroke="#047857" stroke-width="2" rx="4" />
  <text x="655" y="178" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#047857">₹</text>
  <text x="840" y="178" font-family="Courier, monospace" font-weight="900" font-size="20" fill="#0f172a" text-anchor="end">${params.amount ? params.amount.toLocaleString("en-IN") + "/-" : "—"}</text>

  <!-- Account Number Box -->
  <rect x="50" y="220" width="460" height="52" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" rx="4" />
  <text x="65" y="238" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">A/C NO.</text>
  <text x="65" y="260" font-family="Courier, monospace" font-weight="900" font-size="20" fill="#0f172a" letter-spacing="2">${acc}</text>

  <!-- Signature Section -->
  <g transform="translate(680, 240)">
    <text x="90" y="55" font-family="Arial, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">For MGM FINANCIERS PVT LTD</text>
    <line x1="10" y1="80" x2="170" y2="80" stroke="#94a3b8" />
    <text x="90" y="96" font-family="Arial, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">Authorised Signatory</text>
  </g>

  <!-- CTS-2010 Watermark -->
  <text x="450" y="320" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#cbd5e1" text-anchor="middle" letter-spacing="6">CTS - 2010 VALIDATED</text>

  <!-- Bottom MICR Band (Cheque No, MICR, Account Key, Transaction Code) -->
  <rect x="0" y="360" width="900" height="60" fill="#f1f5f9" />
  <line x1="0" y1="360" x2="900" y2="360" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="450" y="396" font-family="Courier, monospace" font-weight="bold" font-size="18" fill="#1e293b" text-anchor="middle" letter-spacing="4">
    ⑈004281⑈ 141024002⑆ 029600⑈ 29
  </text>
</svg>
`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

// Generate realistic payments
export function generateInitialPayments(): Payment[] {
  const payments: Payment[] = [
    // 1. Sharnjit Kaur - PENDING CHECKER (Hero scenario from user prompt)
    {
      id: "PAY-20260903-0042",
      fileId: "MGM-45821",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "DSA Commission payout for Micro-Loan portfolio disbursal batch LUD-782",
      remarks: "Documents verified against DSA agreement",
      beneficiaryName: "Sharnjit Kaur",
      accountNumber: "0296000100089260",
      ifsc: "PUNB0029600",
      bankName: "Punjab National Bank",
      beneficiaryEmail: "sharnjit.kaur92@gmail.com",
      disbursalAmount: 150000,
      commissionPercentage: 2.0,
      grossCommission: 3000,
      tdsAdjustment: 0,
      netAmount: 3000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      createdAt: "2026-09-03T05:31:00Z",
      updatedAt: "2026-09-03T05:38:00Z",
      documents: [
        {
          id: "doc-0042-1",
          name: "DSA_Commission_Voucher_45821.png",
          size: 482910,
          type: "image/png",
          uploadedAt: "2026-09-03T05:32:00Z",
          uploadedBy: "Neha Sharma",
          quality: "GOOD",
          dataUrl: generateSampleVoucherSvg({
            title: "Disbursal Voucher",
            beneficiary: "Sharnjit Kaur",
            accountNo: "0296000100089260",
            ifsc: "PUNB0029600",
            amount: 3000,
            bankName: "Punjab National Bank",
            voucherNo: "MGM-45821",
            date: "03 Sep 2026",
            purpose: "DSA Commission Payout",
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T05:39:00Z",
        documentQuality: "GOOD",
        overallStatus: "PASS",
        overallConfidence: "HIGH",
        matchedFieldsCount: 4,
        totalFieldsCount: 4,
        summary: "4/4 critical fields matched. Document quality is high. No discrepancies detected.",
        fields: {
          beneficiary: {
            extracted: "Sharnjit Kaur",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Exact string match with disbursal voucher",
          },
          accountNumber: {
            extracted: "0296000100089260",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Account number sequence fully visible and confirmed",
          },
          ifsc: {
            extracted: "PUNB0029600",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Valid 11-char IFSC code matched",
          },
          amount: {
            extracted: 3000,
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            difference: 0,
            notes: "Exact net amount matched: ₹3,000",
          },
          bankName: {
            extracted: "Punjab National Bank",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Bank name matches IFSC entity",
          },
        },
        discrepancies: [],
        warnings: [],
      },
      auditTrail: [
        {
          id: "audit-1",
          timestamp: "2026-09-03T05:31:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Payment draft initialized with File ID MGM-45821",
        },
        {
          id: "audit-2",
          timestamp: "2026-09-03T05:35:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "DOCUMENT_UPLOADED",
          details: "Uploaded DSA_Commission_Voucher_45821.png (471 KB)",
        },
        {
          id: "audit-3",
          timestamp: "2026-09-03T05:38:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "SUBMITTED_FOR_CHECKER",
          details: "Payment submitted to Checker Queue. Duplicate check passed.",
        },
        {
          id: "audit-4",
          timestamp: "2026-09-03T05:39:00Z",
          userId: "system-ai",
          userName: "AI Verification Engine",
          userRole: "CHECKER",
          action: "AI_VERIFICATION_COMPLETED",
          details: "Gemini Vision analysis completed: 4/4 fields matched (HIGH confidence).",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 2. Rajinder Kumar Gandhi - PENDING CHECKER (From prompt example)
    {
      id: "PAY-20260903-0043",
      fileId: "MGM-45829",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "Commercial vehicle disbursal channel commission",
      remarks: "Rate: 1.85% on ₹15,00,000 disbursal",
      beneficiaryName: "Rajinder Kumar Gandhi",
      accountNumber: "50100284767803",
      ifsc: "PUNB0029600",
      bankName: "Punjab National Bank",
      disbursalAmount: 1500000,
      commissionPercentage: 1.85,
      grossCommission: 27750,
      tdsAdjustment: 50,
      netAmount: 27700,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      createdAt: "2026-09-03T05:40:00Z",
      updatedAt: "2026-09-03T05:45:00Z",
      documents: [
        {
          id: "doc-0043-1",
          name: "Voucher_RajinderKumar_27700.png",
          size: 512000,
          type: "image/png",
          uploadedAt: "2026-09-03T05:42:00Z",
          uploadedBy: "Neha Sharma",
          quality: "GOOD",
          dataUrl: generateSampleVoucherSvg({
            title: "Channel Commission Payout",
            beneficiary: "Rajinder Kumar Gandhi",
            accountNo: "50100284767803",
            ifsc: "PUNB0029600",
            amount: 27700,
            bankName: "Punjab National Bank",
            voucherNo: "MGM-45829",
            date: "03 Sep 2026",
            purpose: "Channel Commission Payout",
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T05:46:00Z",
        documentQuality: "GOOD",
        overallStatus: "PASS",
        overallConfidence: "HIGH",
        matchedFieldsCount: 4,
        totalFieldsCount: 4,
        summary: "4/4 critical fields matched. Document quality is high. Beneficiary and amount confirmed.",
        fields: {
          beneficiary: {
            extracted: "Rajinder Kumar Gandhi",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches payment beneficiary name",
          },
          accountNumber: {
            extracted: "50100284767803",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Full account number matches voucher",
          },
          ifsc: {
            extracted: "PUNB0029600",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "IFSC matched",
          },
          amount: {
            extracted: 27700,
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            difference: 0,
            notes: "Net amount matches ₹27,700",
          },
          bankName: {
            extracted: "Punjab National Bank",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
        },
        discrepancies: [],
        warnings: [],
      },
      auditTrail: [
        {
          id: "audit-20",
          timestamp: "2026-09-03T05:40:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Created payment MGM-45829 for ₹27,000",
        },
        {
          id: "audit-21",
          timestamp: "2026-09-03T05:43:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "FIELD_UPDATED",
          details: "Amount corrected from ₹27,000 to ₹27,700 per recalculated TDS",
          previousValue: "₹27,000",
          newValue: "₹27,700",
        },
        {
          id: "audit-22",
          timestamp: "2026-09-03T05:45:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "SUBMITTED_FOR_CHECKER",
          details: "Submitted for approval",
        },
      ],
      financialChangeHistory: [
        {
          id: "fch-1",
          fieldName: "netAmount",
          previousValue: 27000,
          newValue: 27700,
          changedBy: "Neha Sharma",
          changedByRole: "MAKER",
          timestamp: "2026-09-03T05:43:00Z",
          reason: "TDS rate adjustment correction as per 194H",
        },
      ],
      bankSubmission: {},
    },

    // 3. Gurpreet Singh - PENDING CHECKER (Showcases AMOUNT MISMATCH warning from prompt!)
    {
      id: "PAY-20260903-0045",
      fileId: "MGM-45834",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-navimumbai",
      branchName: "Navi Mumbai",
      paymentDate: "2026-09-03",
      purpose: "Two-wheeler loan DSA channel payout",
      remarks: "Maker entered ₹30,000",
      beneficiaryName: "Gurpreet Singh",
      accountNumber: "651829019283",
      ifsc: "SBIN0001428",
      bankName: "State Bank of India",
      disbursalAmount: 200000,
      commissionPercentage: 1.5,
      grossCommission: 30000,
      tdsAdjustment: 0,
      netAmount: 30000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-amit",
      makerName: "Amit Verma",
      createdAt: "2026-09-03T05:50:00Z",
      updatedAt: "2026-09-03T05:55:00Z",
      documents: [
        {
          id: "doc-0045-1",
          name: "Voucher_Gurpreet_Discrepancy.png",
          size: 460000,
          type: "image/png",
          uploadedAt: "2026-09-03T05:51:00Z",
          uploadedBy: "Amit Verma",
          quality: "GOOD",
          dataUrl: generateSampleVoucherSvg({
            title: "Channel Commission Voucher",
            beneficiary: "Gurpreet Singh",
            accountNo: "651829019283",
            ifsc: "SBIN0001428",
            amount: 3000, // Intentional mismatch: voucher has 3000, maker entered 30000!
            bankName: "State Bank of India",
            voucherNo: "MGM-45834",
            date: "03 Sep 2026",
            purpose: "Channel Commission Voucher",
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T05:56:00Z",
        documentQuality: "GOOD",
        overallStatus: "MISMATCH",
        overallConfidence: "HIGH",
        matchedFieldsCount: 3,
        totalFieldsCount: 4,
        summary: "CRITICAL MISMATCH: System entered ₹30,000, but document clearly shows ₹3,000 (Difference: ₹27,000).",
        fields: {
          beneficiary: {
            extracted: "Gurpreet Singh",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches beneficiary name",
          },
          accountNumber: {
            extracted: "651829019283",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches account number",
          },
          ifsc: {
            extracted: "SBIN0001428",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches IFSC",
          },
          amount: {
            extracted: 3000,
            matched: false,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            difference: 27000,
            notes: "AMOUNT MISMATCH: Entered ₹30,000 vs Document ₹3,000. Discrepancy of ₹27,000.",
          },
          bankName: {
            extracted: "State Bank of India",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
        },
        discrepancies: [
          "AMOUNT MISMATCH: System entered ₹30,000, but supporting document clearly reads ₹3,000. Discrepancy of ₹27,000.",
        ],
        warnings: [
          "Checker action required: Reject or send back to Maker Amit Verma for amount correction.",
        ],
      },
      auditTrail: [
        {
          id: "audit-30",
          timestamp: "2026-09-03T05:50:00Z",
          userId: "user-amit",
          userName: "Amit Verma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Created payment MGM-45834",
        },
        {
          id: "audit-31",
          timestamp: "2026-09-03T05:55:00Z",
          userId: "user-amit",
          userName: "Amit Verma",
          userRole: "MAKER",
          action: "SUBMITTED_FOR_CHECKER",
          details: "Submitted to Checker Queue",
        },
        {
          id: "audit-32",
          timestamp: "2026-09-03T05:56:00Z",
          userId: "system-ai",
          userName: "AI Verification Engine",
          userRole: "CHECKER",
          action: "AI_VERIFICATION_COMPLETED",
          details: "AI Flagged AMOUNT MISMATCH (Entered: ₹30,000 vs Doc: ₹3,000)",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 4. Balwinder Enterprises - PENDING CHECKER (Showcases BLURRED / LOW QUALITY handling from prompt!)
    {
      id: "PAY-20260903-0046",
      fileId: "MGM-45840",
      category: "VENDOR_PAYMENT",
      categoryLabel: "Vendor Payment",
      method: "RTGS",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "Office IT infrastructure & server maintenance invoice",
      remarks: "Invoice received via photo printout",
      beneficiaryName: "Balwinder Enterprises",
      accountNumber: "918020084729104",
      ifsc: "UTIB0000182",
      bankName: "Axis Bank",
      netAmount: 85000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      createdAt: "2026-09-03T06:05:00Z",
      updatedAt: "2026-09-03T06:10:00Z",
      documents: [
        {
          id: "doc-0046-1",
          name: "Vendor_Invoice_Balwinder_Blurry.png",
          size: 395000,
          type: "image/png",
          uploadedAt: "2026-09-03T06:06:00Z",
          uploadedBy: "Neha Sharma",
          quality: "POOR",
          dataUrl: generateSampleVoucherSvg({
            title: "Vendor Invoice",
            beneficiary: "Balwinder Enterprises",
            accountNo: "918020084729104",
            ifsc: "UTIB0000182",
            amount: 85000,
            bankName: "Axis Bank",
            voucherNo: "MGM-45840",
            date: "03 Sep 2026",
            purpose: "IT Maintenance Payout",
            isBlurry: true, // Showcases blur handling!
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T06:11:00Z",
        documentQuality: "POOR",
        overallStatus: "REVIEW_REQUIRED",
        overallConfidence: "LOW",
        matchedFieldsCount: 2,
        totalFieldsCount: 4,
        summary: "Document image is degraded or partially blurred. Unable to reliably verify account number and amount. Manual inspection required.",
        fields: {
          beneficiary: {
            extracted: "Balwinder Enterpr...",
            matched: true,
            confidence: "MEDIUM",
            readability: "PARTIALLY_READABLE",
            notes: "First word legible; trailing text faded",
          },
          accountNumber: {
            extracted: "XXXX...104",
            matched: true,
            confidence: "LOW",
            readability: "PARTIALLY_READABLE",
            notes: "Middle digits blurred; last 3 digits match",
          },
          ifsc: {
            extracted: "UTIB0000182",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "IFSC text legible",
          },
          amount: {
            extracted: null,
            matched: false,
            confidence: "LOW",
            readability: "UNREADABLE",
            difference: null,
            notes: "Unable to reliably verify amount field due to blur. Never guessing digits.",
          },
          bankName: {
            extracted: "Axis Bank",
            matched: true,
            confidence: "MEDIUM",
            readability: "PARTIALLY_READABLE",
            notes: "Axis Bank logo discernible",
          },
        },
        discrepancies: ["Amount digits obscured by watermark/blur."],
        warnings: [
          "Unable to reliably verify this field. Checker must manually inspect original document.",
          "Image preprocessing (sharpening/contrast) recommended in document viewer.",
        ],
      },
      auditTrail: [
        {
          id: "audit-40",
          timestamp: "2026-09-03T06:05:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Created payment MGM-45840",
        },
        {
          id: "audit-41",
          timestamp: "2026-09-03T06:10:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "SUBMITTED_FOR_CHECKER",
          details: "Submitted with low-contrast document",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 5. Harpreet Kaur - PENDING CHECKER
    {
      id: "PAY-20260903-0047",
      fileId: "MGM-45852",
      category: "EMPLOYEE_REIMBURSEMENT",
      categoryLabel: "Employee Reimbursement",
      method: "NEFT",
      branchId: "branch-kota",
      branchName: "Kota",
      paymentDate: "2026-09-03",
      purpose: "Travel & branch customer verification fuel expense",
      remarks: "Attached fuel receipts and tour summary",
      beneficiaryName: "Harpreet Kaur",
      accountNumber: "201847291048",
      ifsc: "HDFC0000034",
      bankName: "HDFC Bank",
      netAmount: 4200,
      currency: "INR",
      debitAccountId: "acc-pnb-ops",
      debitAccountName: "PNB Operational Expenses A/C",
      debitAccountNumber: "0296002100084920",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-amit",
      makerName: "Amit Verma",
      createdAt: "2026-09-03T06:15:00Z",
      updatedAt: "2026-09-03T06:20:00Z",
      documents: [
        {
          id: "doc-0047-1",
          name: "Expense_Voucher_Harpreet.png",
          size: 420000,
          type: "image/png",
          uploadedAt: "2026-09-03T06:16:00Z",
          uploadedBy: "Amit Verma",
          quality: "GOOD",
          dataUrl: generateSampleVoucherSvg({
            title: "Reimbursement Voucher",
            beneficiary: "Harpreet Kaur",
            accountNo: "201847291048",
            ifsc: "HDFC0000034",
            amount: 4200,
            bankName: "HDFC Bank",
            voucherNo: "MGM-45852",
            date: "03 Sep 2026",
            purpose: "Travel & Fuel Reimbursement",
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T06:21:00Z",
        documentQuality: "GOOD",
        overallStatus: "PASS",
        overallConfidence: "HIGH",
        matchedFieldsCount: 4,
        totalFieldsCount: 4,
        summary: "4/4 critical fields matched. High confidence.",
        fields: {
          beneficiary: {
            extracted: "Harpreet Kaur",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches beneficiary name",
          },
          accountNumber: {
            extracted: "201847291048",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches account number",
          },
          ifsc: {
            extracted: "HDFC0000034",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches IFSC",
          },
          amount: {
            extracted: 4200,
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            difference: 0,
            notes: "Matches ₹4,200",
          },
          bankName: {
            extracted: "HDFC Bank",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
        },
        discrepancies: [],
        warnings: [],
      },
      auditTrail: [
        {
          id: "audit-50",
          timestamp: "2026-09-03T06:15:00Z",
          userId: "user-amit",
          userName: "Amit Verma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Created payment MGM-45852",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 6. Simranjit Singh - PENDING CHECKER
    {
      id: "PAY-20260903-0048",
      fileId: "MGM-45860",
      category: "CUSTOMER_REFUND",
      categoryLabel: "Customer Refund",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "Excess processing fee refund for Loan File #LN-8921",
      remarks: "Approved by Credit Committee",
      beneficiaryName: "Simranjit Singh",
      accountNumber: "3920194827104",
      ifsc: "SBIN0000691",
      bankName: "State Bank of India",
      netAmount: 15500,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      createdAt: "2026-09-03T06:25:00Z",
      updatedAt: "2026-09-03T06:30:00Z",
      documents: [
        {
          id: "doc-0048-1",
          name: "Refund_Calculation_Simranjit.png",
          size: 470000,
          type: "image/png",
          uploadedAt: "2026-09-03T06:26:00Z",
          uploadedBy: "Neha Sharma",
          quality: "GOOD",
          dataUrl: generateSampleVoucherSvg({
            title: "Customer Refund Voucher",
            beneficiary: "Simranjit Singh",
            accountNo: "3920194827104",
            ifsc: "SBIN0000691",
            amount: 15500,
            bankName: "State Bank of India",
            voucherNo: "MGM-45860",
            date: "03 Sep 2026",
            purpose: "Excess Processing Fee Refund",
          }),
        },
      ],
      aiVerification: {
        engine: "gemini-3.8-flash",
        verifiedAt: "2026-09-03T06:31:00Z",
        documentQuality: "GOOD",
        overallStatus: "PASS",
        overallConfidence: "HIGH",
        matchedFieldsCount: 4,
        totalFieldsCount: 4,
        summary: "4/4 critical fields verified with high confidence.",
        fields: {
          beneficiary: {
            extracted: "Simranjit Singh",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
          accountNumber: {
            extracted: "3920194827104",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
          ifsc: {
            extracted: "SBIN0000691",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
          amount: {
            extracted: 15500,
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            difference: 0,
            notes: "Matches",
          },
          bankName: {
            extracted: "State Bank of India",
            matched: true,
            confidence: "HIGH",
            readability: "FULLY_READABLE",
            notes: "Matches",
          },
        },
        discrepancies: [],
        warnings: [],
      },
      auditTrail: [
        {
          id: "audit-60",
          timestamp: "2026-09-03T06:25:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Created payment MGM-45860",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 7. APPROVED Payments (Ready for bank file generation)
    {
      id: "PAY-20260903-0038",
      fileId: "MGM-45790",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "Commercial equipment finance payout",
      beneficiaryName: "Taranjit Agro Agency",
      accountNumber: "0296002100091823",
      ifsc: "PUNB0029600",
      bankName: "Punjab National Bank",
      disbursalAmount: 850000,
      commissionPercentage: 2.0,
      grossCommission: 17000,
      tdsAdjustment: 0,
      netAmount: 17000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "APPROVED",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      checkerId: "user-kunal",
      checkerName: "Kunal Singhania",
      approvedAt: "2026-09-03T04:42:00Z",
      createdAt: "2026-09-03T04:10:00Z",
      updatedAt: "2026-09-03T04:42:00Z",
      documents: [],
      auditTrail: [
        {
          id: "a-38-1",
          timestamp: "2026-09-03T04:10:00Z",
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "PAYMENT_CREATED",
          details: "Payment created",
        },
        {
          id: "a-38-2",
          timestamp: "2026-09-03T04:42:00Z",
          userId: "user-kunal",
          userName: "Kunal Singhania",
          userRole: "CHECKER",
          action: "PAYMENT_APPROVED",
          details: "Verified against disbursal file. Approved for bank file export.",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },
    {
      id: "PAY-20260903-0039",
      fileId: "MGM-45794",
      category: "SALARY",
      categoryLabel: "Salary",
      method: "NEFT",
      branchId: "branch-navimumbai",
      branchName: "Navi Mumbai",
      paymentDate: "2026-09-03",
      purpose: "Staff salary incentive for Q2 disbursement quota",
      beneficiaryName: "Manpreet Singh",
      accountNumber: "201847192830",
      ifsc: "HDFC0000034",
      bankName: "HDFC Bank",
      netAmount: 24500,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "APPROVED",
      bankStatus: "NOT_GENERATED",
      makerId: "user-amit",
      makerName: "Amit Verma",
      checkerId: "user-priya",
      checkerName: "Priya Mehta",
      approvedAt: "2026-09-03T04:48:00Z",
      createdAt: "2026-09-03T04:15:00Z",
      updatedAt: "2026-09-03T04:48:00Z",
      documents: [],
      auditTrail: [],
      financialChangeHistory: [],
      bankSubmission: {},
    },
    {
      id: "PAY-20260903-0040",
      fileId: "MGM-45801",
      category: "VENDOR_PAYMENT",
      categoryLabel: "Vendor Payment",
      method: "RTGS",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-03",
      purpose: "Branch security and surveillance system maintenance",
      beneficiaryName: "Apex Security & Allied Solutions",
      accountNumber: "919020084720194",
      ifsc: "UTIB0000182",
      bankName: "Axis Bank",
      netAmount: 145000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "APPROVED",
      bankStatus: "NOT_GENERATED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      checkerId: "user-kunal",
      checkerName: "Kunal Singhania",
      approvedAt: "2026-09-03T05:05:00Z",
      createdAt: "2026-09-03T04:30:00Z",
      updatedAt: "2026-09-03T05:05:00Z",
      documents: [],
      auditTrail: [],
      financialChangeHistory: [],
      bankSubmission: {},
    },

    // 8. BANK SUBMITTED & SUCCESSFUL PAYMENTS (With UTRs)
    {
      id: "PAY-20260902-0021",
      fileId: "MGM-45601",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-02",
      purpose: "Micro-loan disbursal batch payout",
      beneficiaryName: "Kavita Rani",
      accountNumber: "104928104820",
      ifsc: "SBIN0000691",
      bankName: "State Bank of India",
      netAmount: 18400,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "SUCCESSFUL",
      bankStatus: "SUCCESSFUL",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      checkerId: "user-kunal",
      checkerName: "Kunal Singhania",
      approvedAt: "2026-09-02T10:15:00Z",
      createdAt: "2026-09-02T09:30:00Z",
      updatedAt: "2026-09-02T15:30:00Z",
      documents: [],
      auditTrail: [],
      financialChangeHistory: [],
      bankSubmission: {
        bankFileId: "EXP-20260902-01",
        bankFileName: "MGM_IDFC_CMS_02092026_01.xlsx",
        generatedAt: "2026-09-02T11:00:00Z",
        generatedBy: "Sunita Joshi",
        submittedAt: "2026-09-02T11:30:00Z",
        submittedBy: "Sunita Joshi",
        utrReference: "CMS202609028910492",
        bankResponseDate: "2026-09-02T14:45:00Z",
        bankRemarks: "Credit confirmed by RBI clearing",
      },
    },
    {
      id: "PAY-20260902-0022",
      fileId: "MGM-45608",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-navimumbai",
      branchName: "Navi Mumbai",
      paymentDate: "2026-09-02",
      purpose: "Commercial vehicle commission",
      beneficiaryName: "Jalandhar Auto Link DSA",
      accountNumber: "0296000100482019",
      ifsc: "PUNB0029600",
      bankName: "Punjab National Bank",
      netAmount: 64000,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "SUCCESSFUL",
      bankStatus: "SUCCESSFUL",
      makerId: "user-amit",
      makerName: "Amit Verma",
      checkerId: "user-priya",
      checkerName: "Priya Mehta",
      approvedAt: "2026-09-02T10:30:00Z",
      createdAt: "2026-09-02T09:40:00Z",
      updatedAt: "2026-09-02T15:30:00Z",
      documents: [],
      auditTrail: [],
      financialChangeHistory: [],
      bankSubmission: {
        bankFileId: "EXP-20260902-01",
        bankFileName: "MGM_IDFC_CMS_02092026_01.xlsx",
        utrReference: "CMS202609028910493",
        bankResponseDate: "2026-09-02T14:50:00Z",
      },
    },

    // 9. FAILED PAYMENT (For reconciliation demonstration)
    {
      id: "PAY-20260902-0025",
      fileId: "MGM-45615",
      category: "VENDOR_PAYMENT",
      categoryLabel: "Vendor Payment",
      method: "NEFT",
      branchId: "branch-ludhiyana",
      branchName: "Ludhiyana (Main)",
      paymentDate: "2026-09-02",
      purpose: "Stationery and printing supplies",
      beneficiaryName: "Modern Printers Ludhiana",
      accountNumber: "102948201948",
      ifsc: "SBIN0001428",
      bankName: "State Bank of India",
      netAmount: 12500,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "FAILED",
      bankStatus: "FAILED",
      makerId: "user-neha",
      makerName: "Neha Sharma",
      checkerId: "user-kunal",
      checkerName: "Kunal Singhania",
      approvedAt: "2026-09-02T11:00:00Z",
      createdAt: "2026-09-02T10:00:00Z",
      updatedAt: "2026-09-02T16:00:00Z",
      documents: [],
      auditTrail: [],
      financialChangeHistory: [],
      bankSubmission: {
        bankFileId: "EXP-20260902-01",
        bankFileName: "MGM_IDFC_CMS_02092026_01.xlsx",
        submittedAt: "2026-09-02T11:30:00Z",
        failureReason: "Beneficiary account inactive / blocked by destination bank (Code: R04)",
      },
    },

    // 10. REJECTED PAYMENT (Returned to maker)
    {
      id: "PAY-20260902-0029",
      fileId: "MGM-45630",
      category: "DSA_COMMISSION",
      categoryLabel: "DSA / Channel Commission",
      method: "NEFT",
      branchId: "branch-kota",
      branchName: "Kota",
      paymentDate: "2026-09-02",
      purpose: "DSA Commission File 45630",
      beneficiaryName: "Deepak Chawla",
      accountNumber: "0296000100482910",
      ifsc: "PUNB0029600",
      bankName: "Punjab National Bank",
      netAmount: 8500,
      currency: "INR",
      debitAccountId: "acc-idfc-main",
      debitAccountName: "IDFC Main Disbursal A/C",
      debitAccountNumber: "10084729104",
      status: "REJECTED",
      bankStatus: "NOT_GENERATED",
      makerId: "user-amit",
      makerName: "Amit Verma",
      checkerId: "user-priya",
      checkerName: "Priya Mehta",
      rejectionReason: "Wrong account number on supporting voucher",
      rejectionNotes: "The cancelled cheque provided shows account ending with 2915, but Maker entered 2910. Please verify with borrower and re-upload.",
      createdAt: "2026-09-02T11:30:00Z",
      updatedAt: "2026-09-02T14:10:00Z",
      documents: [],
      auditTrail: [
        {
          id: "a-rej-1",
          timestamp: "2026-09-02T14:10:00Z",
          userId: "user-priya",
          userName: "Priya Mehta",
          userRole: "CHECKER",
          action: "PAYMENT_REJECTED",
          details: "Payment rejected: Wrong account number on supporting voucher",
        },
      ],
      financialChangeHistory: [],
      bankSubmission: {},
    },
  ];

  return payments;
}

export const INITIAL_BATCHES: PaymentBatch[] = [
  {
    id: "BATCH-20260903-01",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    paymentDate: "2026-09-03",
    paymentIds: ["PAY-20260903-0038", "PAY-20260903-0039", "PAY-20260903-0040"],
    totalPayments: 3,
    approvedCount: 3,
    rejectedCount: 0,
    totalAmount: 186500,
    status: "APPROVED",
    createdBy: "Neha Sharma",
    createdById: "user-neha",
    checker: "Kunal Singhania",
    checkerId: "user-kunal",
    createdAt: "2026-09-03T04:15:00Z",
  },
  {
    id: "BATCH-20260902-02",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    paymentDate: "2026-09-02",
    paymentIds: ["PAY-20260902-0021", "PAY-20260902-0022", "PAY-20260902-0025"],
    totalPayments: 3,
    approvedCount: 3,
    rejectedCount: 0,
    totalAmount: 94900,
    status: "BANK_SUBMITTED",
    createdBy: "Neha Sharma",
    createdById: "user-neha",
    checker: "Kunal Singhania",
    checkerId: "user-kunal",
    createdAt: "2026-09-02T09:30:00Z",
    bankFileId: "EXP-20260902-01",
    bankFileName: "MGM_IDFC_CMS_02092026_01.xlsx",
  },
];

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: "notif-1",
    title: "Pending Checker Approval",
    message: "6 payments are awaiting your approval in the Checker Queue.",
    timestamp: "10 mins ago",
    read: false,
    type: "warning",
  },
  {
    id: "notif-2",
    title: "Amount Mismatch Flagged",
    message: "Payment PAY-20260903-0045 has a ₹27,000 difference flagged by AI.",
    timestamp: "35 mins ago",
    read: false,
    type: "danger",
    paymentId: "PAY-20260903-0045",
  },
  {
    id: "notif-3",
    title: "Bank Export Completed",
    message: "Bank file MGM_IDFC_CMS_02092026_01.xlsx was successfully uploaded.",
    timestamp: "Yesterday",
    read: true,
    type: "success",
  },
  {
    id: "notif-4",
    title: "Payment Returned to Maker",
    message: "Payment PAY-20260902-0029 was rejected by Priya Mehta with reason: Wrong account number.",
    timestamp: "Yesterday",
    read: true,
    type: "info",
    paymentId: "PAY-20260902-0029",
  },
];
