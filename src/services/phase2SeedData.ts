import {
  DSAPartner,
  CommissionRule,
  Disbursal,
  CommissionPayable,
  CommissionAdjustment,
  AuditLogEntry,
} from "../types";

// ============================================================================
// 1. INITIAL 25+ FICTIONAL DSAs / CHANNEL PARTNERS
// ============================================================================
export const INITIAL_DSAS: DSAPartner[] = [
  {
    id: "DSA-LDH-001",
    dsaCode: "ABC-FIN",
    name: "ABC Finance",
    legalName: "ABC Financial Advisory Services LLP",
    contactPerson: "Harpreet Singh Sodhi",
    mobile: "+91 98140 82910",
    email: "harpreet@abcfinance.in",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AAAFB1928K",
    gstin: "03AAAFB1928K1Z5",
    bankName: "HDFC Bank",
    accountNumber: "50200039281260",
    ifsc: "HDFC0000034",
    accountHolderName: "ABC Financial Advisory Services LLP",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Tier-1 Gold Channel Partner",
    status: "ACTIVE",
    effectiveDate: "2024-04-01",
    notes: "Top channel partner for SME & Business Loan disbursals in Ludhiana region.",
    createdAt: "2024-04-01T10:00:00Z",
    updatedAt: "2026-08-15T14:30:00Z",
    bankAuditHistory: [
      {
        id: "BA-001",
        dsaId: "DSA-LDH-001",
        previousAccount: "50200018291044",
        newAccount: "50200039281260",
        previousIfsc: "HDFC0000034",
        newIfsc: "HDFC0000034",
        previousBank: "HDFC Bank",
        newBank: "HDFC Bank",
        previousHolderName: "ABC Financial Services",
        newHolderName: "ABC Financial Advisory Services LLP",
        changedBy: "Ratul Mohindra",
        changedByRole: "ADMIN",
        timestamp: "2026-08-15 14:30",
        reason: "Updated to newly registered LLP corporate current account.",
        verificationStatus: "VERIFIED",
      },
    ],
  },
  {
    id: "DSA-LDH-002",
    dsaCode: "PRIME-FS",
    name: "Prime Finserv",
    legalName: "Prime Finserv Solutions Pvt Ltd",
    contactPerson: "Gurinder Gill",
    mobile: "+91 98722 93841",
    email: "gill@primefinserv.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AABCP8821M",
    gstin: "03AABCP8821M1Z2",
    bankName: "ICICI Bank",
    accountNumber: "001805009842",
    ifsc: "ICIC0000018",
    accountHolderName: "Prime Finserv Solutions Pvt Ltd",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2024-06-15",
    notes: "Specializes in Loan Against Property & Industrial machinery loans.",
    createdAt: "2024-06-15T11:00:00Z",
    updatedAt: "2026-07-10T12:00:00Z",
  },
  {
    id: "DSA-LDH-003",
    dsaCode: "STAR-CAP",
    name: "Star Capital Advisors",
    legalName: "Star Capital Enterprises",
    contactPerson: "Ravinder Kumar",
    mobile: "+91 98881 12390",
    email: "ravinder@starcapital.co.in",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "ABCPK4419N",
    bankName: "State Bank of India",
    accountNumber: "389201948291",
    ifsc: "SBIN0001509",
    accountHolderName: "Star Capital Enterprises",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Personal Loan Retail Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-08-01",
    notes: "Active channel partner for salaried personal loans and used car loans.",
    createdAt: "2024-08-01T09:30:00Z",
    updatedAt: "2026-08-01T09:30:00Z",
  },
  {
    id: "DSA-LDH-004",
    dsaCode: "GN-FIN",
    name: "Guru Nanak Financial",
    legalName: "Guru Nanak FinCorp Services",
    contactPerson: "Jaspreet Singh Walia",
    mobile: "+91 94170 34821",
    email: "walia@gnfincorp.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AALPG9021Q",
    gstin: "03AALPG9021Q1Z4",
    bankName: "Axis Bank",
    accountNumber: "919020084729104",
    ifsc: "UTIB0000122",
    accountHolderName: "Guru Nanak FinCorp Services",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Tier-1 Gold Channel Partner",
    status: "ACTIVE",
    effectiveDate: "2024-05-10",
    notes: "High volume channel partner covering Ludhiana and Khanna industrial belt.",
    createdAt: "2024-05-10T10:00:00Z",
    updatedAt: "2026-06-20T16:00:00Z",
  },
  {
    id: "DSA-LDH-005",
    dsaCode: "SHIV-ASC",
    name: "Shivalik Associates",
    legalName: "Shivalik Loan Consultancy",
    contactPerson: "Pankaj Sharma",
    mobile: "+91 98150 49281",
    email: "pankaj@shivalikloans.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AAGCS7712E",
    bankName: "Punjab National Bank",
    accountNumber: "0296002100984712",
    ifsc: "PUNB0029600",
    accountHolderName: "Shivalik Loan Consultancy",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2024-09-01",
    notes: "Partner for rural and semi-urban micro-enterprise loans.",
    createdAt: "2024-09-01T12:00:00Z",
    updatedAt: "2026-07-15T11:20:00Z",
  },
  {
    id: "DSA-LDH-006",
    dsaCode: "MALWA-W",
    name: "Malwa Wealth Partners",
    legalName: "Malwa Wealth Management Services",
    contactPerson: "Amaninder Dhillon",
    mobile: "+91 98780 19283",
    email: "aman@malwawealth.in",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AAEFM3910R",
    gstin: "03AAEFM3910R1Z8",
    bankName: "Kotak Mahindra Bank",
    accountNumber: "8472910482",
    ifsc: "KKBK0000281",
    accountHolderName: "Malwa Wealth Management Services",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Tier-1 Gold Channel Partner",
    status: "ACTIVE",
    effectiveDate: "2024-10-01",
    notes: "Aggressive business loan sourcing in Malwa region.",
    createdAt: "2024-10-01T14:00:00Z",
    updatedAt: "2026-08-20T10:15:00Z",
  },
  {
    id: "DSA-LDH-007",
    dsaCode: "LDH-HUB",
    name: "Ludhiana Loan Hub",
    legalName: "Ludhiana Credit Consultants",
    contactPerson: "Sunil Grover",
    mobile: "+91 98144 55829",
    email: "sunil@ludhianaloanhub.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AALPL1102T",
    bankName: "IndusInd Bank",
    accountNumber: "150098472910",
    ifsc: "INDB0000042",
    accountHolderName: "Ludhiana Credit Consultants",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Personal Loan Retail Slabs",
    status: "ACTIVE",
    effectiveDate: "2025-01-15",
    notes: "Specializes in quick retail turnaround cases.",
    createdAt: "2025-01-15T09:00:00Z",
    updatedAt: "2026-05-18T15:00:00Z",
  },
  {
    id: "DSA-LDH-008",
    dsaCode: "GOLD-FS",
    name: "Golden Finserve",
    legalName: "Golden Finserve Associates",
    contactPerson: "Balwinder Sandhu",
    mobile: "+91 98141 90812",
    email: "sandhu@goldenfinserve.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AAGCG9820B",
    bankName: "HDFC Bank",
    accountNumber: "50200084729104",
    ifsc: "HDFC0000034",
    accountHolderName: "Golden Finserve Associates",
    bankVerificationStatus: "PENDING_VERIFICATION",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ON_HOLD",
    effectiveDate: "2025-02-01",
    notes: "Bank passbook copy pending submission for updated current account.",
    createdAt: "2025-02-01T11:00:00Z",
    updatedAt: "2026-08-28T16:00:00Z",
  },
  {
    id: "DSA-LDH-009",
    dsaCode: "PB-CREDIT",
    name: "Punjab Credit Partners",
    legalName: "Punjab Credit Solution Provider",
    contactPerson: "Manjit Bhasin",
    mobile: "+91 98765 43210",
    email: "bhasin@punjabcredit.in",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AAPCB6619H",
    bankName: "State Bank of India",
    accountNumber: "204892019482",
    ifsc: "SBIN0000726",
    accountHolderName: "Punjab Credit Solution Provider",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Tier-1 Gold Channel Partner",
    status: "ACTIVE",
    effectiveDate: "2024-11-15",
    notes: "Active partner in hosiery and textile vendor finance.",
    createdAt: "2024-11-15T10:30:00Z",
    updatedAt: "2026-06-12T13:45:00Z",
  },
  {
    id: "DSA-LDH-010",
    dsaCode: "CITY-FIN",
    name: "City Finance Co",
    legalName: "City Financial Intermediary",
    contactPerson: "Rajeev Talwar",
    mobile: "+91 94172 88491",
    email: "rajeev@cityfinanceco.com",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    pan: "AACTC5529P",
    bankName: "Punjab & Sind Bank",
    accountNumber: "04921000847291",
    ifsc: "PSIB0000492",
    accountHolderName: "City Financial Intermediary",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2025-03-01",
    notes: "Urban retail personal and auto loans.",
    createdAt: "2025-03-01T09:15:00Z",
    updatedAt: "2026-07-22T10:00:00Z",
  },

  // NAVI MUMBAI BRANCH DSAS
  {
    id: "DSA-NMB-001",
    dsaCode: "VASHI-CAP",
    name: "Vashi Capital Services",
    legalName: "Vashi Capital Advisors Pvt Ltd",
    contactPerson: "Sachin Kadam",
    mobile: "+91 98200 48291",
    email: "sachin@vashicapital.com",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AABCV9912L",
    gstin: "27AABCV9912L1Z3",
    bankName: "IDFC FIRST Bank",
    accountNumber: "100948291048",
    ifsc: "IDFB0040101",
    accountHolderName: "Vashi Capital Advisors Pvt Ltd",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Mumbai Commercial & LAP Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-05-01",
    notes: "Primary channel partner for Navi Mumbai and Thane industrial sectors.",
    createdAt: "2024-05-01T10:00:00Z",
    updatedAt: "2026-07-18T11:00:00Z",
  },
  {
    id: "DSA-NMB-002",
    dsaCode: "KONKAN-FS",
    name: "Konkan Finserve",
    legalName: "Konkan Financial Consultancy",
    contactPerson: "Milind Sawant",
    mobile: "+91 98190 38291",
    email: "milind@konkanfinserve.com",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AAACK4810M",
    bankName: "HDFC Bank",
    accountNumber: "50200098472910",
    ifsc: "HDFC0000240",
    accountHolderName: "Konkan Financial Consultancy",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2024-07-01",
    notes: "Retail mortgage and business loans in Belapur / Panvel.",
    createdAt: "2024-07-01T11:30:00Z",
    updatedAt: "2026-06-30T14:20:00Z",
  },
  {
    id: "DSA-NMB-003",
    dsaCode: "APEX-MUM",
    name: "Apex Credit Mumbai",
    legalName: "Apex Credit Intermediaries LLP",
    contactPerson: "Nilesh Joshi",
    mobile: "+91 98330 19284",
    email: "nilesh@apexcredit.in",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AAKFA2819R",
    gstin: "27AAKFA2819R1Z8",
    bankName: "Axis Bank",
    accountNumber: "918020048291048",
    ifsc: "UTIB0000210",
    accountHolderName: "Apex Credit Intermediaries LLP",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Mumbai Commercial & LAP Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-08-15",
    notes: "Specialized in supply chain and logistics equipment financing.",
    createdAt: "2024-08-15T12:00:00Z",
    updatedAt: "2026-08-10T16:40:00Z",
  },
  {
    id: "DSA-NMB-004",
    dsaCode: "THANE-LOAN",
    name: "Thane Loan Consultants",
    legalName: "Thane Financial Services",
    contactPerson: "Prashant Patil",
    mobile: "+91 98210 94821",
    email: "patil@thaneloans.com",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AATCP8812D",
    bankName: "Bank of Baroda",
    accountNumber: "08470200004928",
    ifsc: "BARB0VASHIX",
    accountHolderName: "Thane Financial Services",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Personal Loan Retail Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-11-01",
    notes: "Active in personal loans and auto refinances.",
    createdAt: "2024-11-01T09:45:00Z",
    updatedAt: "2026-05-14T11:10:00Z",
  },
  {
    id: "DSA-NMB-005",
    dsaCode: "METRO-CRED",
    name: "Metro Credit Solutions",
    legalName: "Metro Capital Partners",
    contactPerson: "Vivek Deshmukh",
    mobile: "+91 98690 12849",
    email: "vivek@metrocredit.in",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AAMCM4910K",
    bankName: "ICICI Bank",
    accountNumber: "008405001928",
    ifsc: "ICIC0000084",
    accountHolderName: "Metro Capital Partners",
    bankVerificationStatus: "PENDING_VERIFICATION",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ON_HOLD",
    effectiveDate: "2025-01-10",
    notes: "Bank IFSC updated; awaiting revised cancelled cheque copy.",
    createdAt: "2025-01-10T15:00:00Z",
    updatedAt: "2026-08-30T17:20:00Z",
  },
  {
    id: "DSA-NMB-006",
    dsaCode: "PANVEL-FS",
    name: "Panvel Finserv",
    legalName: "Panvel Wealth & Loan Services",
    contactPerson: "Anand Mhatre",
    mobile: "+91 98205 39182",
    email: "anand@panvelfinserv.com",
    branchId: "branch-navimumbai",
    branchName: "Navi Mumbai",
    pan: "AAPPM7710S",
    bankName: "Canara Bank",
    accountNumber: "1482101004928",
    ifsc: "CNRB0001482",
    accountHolderName: "Panvel Wealth & Loan Services",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2025-02-15",
    notes: "Covers Raigad industrial corridor cases.",
    createdAt: "2025-02-15T10:00:00Z",
    updatedAt: "2026-07-05T12:00:00Z",
  },

  // KOTA BRANCH DSAS
  {
    id: "DSA-KOT-001",
    dsaCode: "HADOTI-CAP",
    name: "Hadoti Capital Services",
    legalName: "Hadoti Financial Associates",
    contactPerson: "Mahesh Chandra Gautam",
    mobile: "+91 94141 82910",
    email: "mahesh@hadoticapital.com",
    branchId: "branch-kota",
    branchName: "Kota",
    pan: "AAHFH4912J",
    gstin: "08AAHFH4912J1Z7",
    bankName: "State Bank of India",
    accountNumber: "30849201948",
    ifsc: "SBIN0000412",
    accountHolderName: "Hadoti Financial Associates",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Rajasthan Regional Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-04-15",
    notes: "Leader in education infrastructure and hostel business loans in Kota.",
    createdAt: "2024-04-15T09:30:00Z",
    updatedAt: "2026-08-12T14:10:00Z",
  },
  {
    id: "DSA-KOT-002",
    dsaCode: "CHAMBAL-FS",
    name: "Chambal Finserv",
    legalName: "Chambal Credit Advisory",
    contactPerson: "Suresh Meena",
    mobile: "+91 94143 55829",
    email: "suresh@chambalfin.in",
    branchId: "branch-kota",
    branchName: "Kota",
    pan: "AACMC9812A",
    bankName: "HDFC Bank",
    accountNumber: "50200084910284",
    ifsc: "HDFC0000249",
    accountHolderName: "Chambal Credit Advisory",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "ACTIVE",
    effectiveDate: "2024-06-01",
    notes: "Agri-business and trade loans in Kota stone & grain markets.",
    createdAt: "2024-06-01T11:00:00Z",
    updatedAt: "2026-06-18T10:30:00Z",
  },
  {
    id: "DSA-KOT-003",
    dsaCode: "RAJ-LOANS",
    name: "Rajasthan Loan Point",
    legalName: "Rajasthan Finance & Credit Solutions",
    contactPerson: "Dinesh Rathore",
    mobile: "+91 98290 19284",
    email: "rathore@rajloanpoint.com",
    branchId: "branch-kota",
    branchName: "Kota",
    pan: "AARFR7819N",
    bankName: "Bank of Baroda",
    accountNumber: "02490200008492",
    ifsc: "BARB0KOTAX",
    accountHolderName: "Rajasthan Finance & Credit Solutions",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Personal Loan Retail Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-08-01",
    notes: "Salaried and retail customer loans.",
    createdAt: "2024-08-01T10:00:00Z",
    updatedAt: "2026-07-25T15:00:00Z",
  },
  {
    id: "DSA-KOT-004",
    dsaCode: "KOTA-PRIME",
    name: "Kota Prime Capital",
    legalName: "Kota Prime Consultancy",
    contactPerson: "Rajendra Mittal",
    mobile: "+91 94142 90812",
    email: "mittal@kotaprime.in",
    branchId: "branch-kota",
    branchName: "Kota",
    pan: "AAKPM6610Q",
    bankName: "ICICI Bank",
    accountNumber: "024905001829",
    ifsc: "ICIC0000249",
    accountHolderName: "Kota Prime Consultancy",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Rajasthan Regional Slabs",
    status: "ACTIVE",
    effectiveDate: "2024-10-15",
    notes: "Commercial vehicle and LAP specialist.",
    createdAt: "2024-10-15T12:00:00Z",
    updatedAt: "2026-08-05T11:45:00Z",
  },
  {
    id: "DSA-KOT-005",
    dsaCode: "MARWAR-FS",
    name: "Marwar Finserv",
    legalName: "Marwar Loan Agency",
    contactPerson: "Ashok Gehlot",
    mobile: "+91 98292 48102",
    email: "ashok@marwarfin.com",
    branchId: "branch-kota",
    branchName: "Kota",
    pan: "AAMGM3319L",
    bankName: "Punjab National Bank",
    accountNumber: "0412002100849201",
    ifsc: "PUNB0041200",
    accountHolderName: "Marwar Loan Agency",
    bankVerificationStatus: "FLAGGED",
    commissionScheme: "Standard Retail & LAP Scheme",
    status: "INACTIVE",
    effectiveDate: "2025-01-01",
    notes: "Account inactive due to non-renewal of empanelment agreement.",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
  },
];

// ============================================================================
// 2. INITIAL COMMISSION RULES & VERSIONING
// ============================================================================
export const INITIAL_COMMISSION_RULES: CommissionRule[] = [
  // DSA Specific Override Rule (Highest Priority)
  {
    id: "RULE-DSA-ABC-BL",
    name: "ABC Finance Business Loan Custom Rate",
    product: "Business Loan",
    dsaId: "DSA-LDH-001",
    dsaName: "ABC Finance",
    slabMin: 100000,
    slabMax: 5000000,
    commissionPercentage: 1.50,
    ruleType: "DSA_SPECIFIC",
    effectiveFrom: "2026-04-01",
    version: 3,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-08-01T10:00:00Z",
    versions: [
      {
        id: "RV-001",
        ruleId: "RULE-DSA-ABC-BL",
        version: 1,
        commissionPercentage: 1.00,
        effectiveFrom: "2025-04-01",
        effectiveUntil: "2025-09-30",
        changedBy: "Ratul Mohindra",
        changedAt: "2025-04-01 09:00",
        changeReason: "Initial FY25 empanelment agreement rate",
      },
      {
        id: "RV-002",
        ruleId: "RULE-DSA-ABC-BL",
        version: 2,
        commissionPercentage: 1.25,
        effectiveFrom: "2025-10-01",
        effectiveUntil: "2026-03-31",
        changedBy: "Ratul Mohindra",
        changedAt: "2025-10-01 10:30",
        changeReason: "Festive volume incentive boost",
      },
      {
        id: "RV-003",
        ruleId: "RULE-DSA-ABC-BL",
        version: 3,
        commissionPercentage: 1.50,
        effectiveFrom: "2026-04-01",
        changedBy: "Ratul Mohindra",
        changedAt: "2026-04-01 09:00",
        changeReason: "Annual renewal - Tier 1 Gold partner revision",
      },
    ],
  },
  // Product Specific Rules: Business Loan
  {
    id: "RULE-BL-TIER1",
    name: "Business Loan — Slab ₹1L to ₹10L",
    product: "Business Loan",
    slabMin: 100000,
    slabMax: 1000000,
    commissionPercentage: 1.25,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 2,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
  },
  {
    id: "RULE-BL-TIER2",
    name: "Business Loan — Slab > ₹10L",
    product: "Business Loan",
    slabMin: 1000001,
    slabMax: 10000000,
    commissionPercentage: 1.50,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  // Personal Loan Slabs
  {
    id: "RULE-PL-TIER1",
    name: "Personal Loan — Slab ₹1L to ₹5L",
    product: "Personal Loan",
    slabMin: 100000,
    slabMax: 500000,
    commissionPercentage: 1.00,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  {
    id: "RULE-PL-TIER2",
    name: "Personal Loan — Slab ₹5L to ₹10L",
    product: "Personal Loan",
    slabMin: 500001,
    slabMax: 1000000,
    commissionPercentage: 1.25,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  // Loan Against Property (LAP) Slabs
  {
    id: "RULE-LAP-TIER1",
    name: "Loan Against Property — Up to ₹25L",
    product: "Loan Against Property",
    slabMin: 500000,
    slabMax: 2500000,
    commissionPercentage: 0.85,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  {
    id: "RULE-LAP-TIER2",
    name: "Loan Against Property — Above ₹25L",
    product: "Loan Against Property",
    slabMin: 2500001,
    slabMax: 20000000,
    commissionPercentage: 1.00,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  // Micro Enterprise Loan
  {
    id: "RULE-MICRO-TIER1",
    name: "Micro Enterprise Loan — Standard Slabs",
    product: "Micro Enterprise Loan",
    slabMin: 50000,
    slabMax: 500000,
    commissionPercentage: 1.75,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  // Used Car Loan
  {
    id: "RULE-AUTO-TIER1",
    name: "Used Car Loan — Standard Slabs",
    product: "Used Car Loan",
    slabMin: 100000,
    slabMax: 1500000,
    commissionPercentage: 1.10,
    ruleType: "PRODUCT_SPECIFIC",
    effectiveFrom: "2026-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  },
  // Global Fallback Rule (Lowest Priority)
  {
    id: "RULE-GLOBAL-DEF",
    name: "MGM Base Default Commission Rule",
    product: "All Products",
    slabMin: 50000,
    slabMax: 50000000,
    commissionPercentage: 0.75,
    ruleType: "GLOBAL",
    effectiveFrom: "2025-01-01",
    version: 1,
    status: "ACTIVE",
    createdBy: "Ratul Mohindra",
    createdAt: "2025-01-01T10:00:00Z",
    updatedAt: "2025-01-01T10:00:00Z",
  },
];

// Helper to find applicable commission rule
export function matchCommissionRule(
  rules: CommissionRule[],
  dsaId: string,
  product: string,
  disbursalAmount: number,
  branchId?: string
): { rule: CommissionRule | null; conflict: boolean; reason?: string } {
  const activeRules = rules.filter((r) => r.status === "ACTIVE");

  // Priority 1: DSA Specific matching product & amount
  const dsaSpecific = activeRules.filter(
    (r) =>
      r.ruleType === "DSA_SPECIFIC" &&
      r.dsaId === dsaId &&
      (r.product === product || r.product === "All Products") &&
      disbursalAmount >= r.slabMin &&
      disbursalAmount <= r.slabMax
  );
  if (dsaSpecific.length > 1) {
    return { rule: null, conflict: true, reason: "Multiple conflicting DSA-specific rules found." };
  }
  if (dsaSpecific.length === 1) {
    return { rule: dsaSpecific[0], conflict: false };
  }

  // Priority 2: Branch Specific matching product & amount
  if (branchId) {
    const branchSpecific = activeRules.filter(
      (r) =>
        r.ruleType === "BRANCH_SPECIFIC" &&
        r.branchId === branchId &&
        (r.product === product || r.product === "All Products") &&
        disbursalAmount >= r.slabMin &&
        disbursalAmount <= r.slabMax
    );
    if (branchSpecific.length > 1) {
      return { rule: null, conflict: true, reason: "Multiple conflicting Branch-specific rules found." };
    }
    if (branchSpecific.length === 1) {
      return { rule: branchSpecific[0], conflict: false };
    }
  }

  // Priority 3: Product Specific matching product & amount
  const productSpecific = activeRules.filter(
    (r) =>
      r.ruleType === "PRODUCT_SPECIFIC" &&
      r.product === product &&
      disbursalAmount >= r.slabMin &&
      disbursalAmount <= r.slabMax
  );
  if (productSpecific.length > 1) {
    return { rule: null, conflict: true, reason: "Multiple conflicting Product-specific rules found." };
  }
  if (productSpecific.length === 1) {
    return { rule: productSpecific[0], conflict: false };
  }

  // Priority 4: Global Rule
  const globalRules = activeRules.filter(
    (r) =>
      r.ruleType === "GLOBAL" &&
      disbursalAmount >= r.slabMin &&
      disbursalAmount <= r.slabMax
  );
  if (globalRules.length > 0) {
    return { rule: globalRules[0], conflict: false };
  }

  return { rule: null, conflict: false, reason: "No commission rule configured for this product and slab." };
}

// ============================================================================
// 3. INITIAL 100+ REALISTIC DISBURSALS & COMMISSION PAYABLES GENERATOR
// ============================================================================
export function generateInitialPhase2Data(): {
  disbursals: Disbursal[];
  payables: CommissionPayable[];
} {
  const disbursals: Disbursal[] = [];
  const payables: CommissionPayable[] = [];

  const products = [
    "Business Loan",
    "Personal Loan",
    "Loan Against Property",
    "Micro Enterprise Loan",
    "Used Car Loan",
  ];

  const firstNames = ["Rajesh", "Jaspreet", "Vikram", "Kuldeep", "Manpreet", "Sunita", "Harish", "Rohit", "Tarun", "Aman", "Ramesh", "Deepak", "Gagandeep", "Simran", "Vikas", "Ashwani", "Pooja", "Sarabjit", "Navneet", "Anil"];
  const lastNames = ["Sharma", "Singh", "Verma", "Kaur", "Gupta", "Malhotra", "Bhatia", "Ahluwalia", "Grover", "Dhillon", "Mehta", "Patel", "Joshi", "Bansal", "Chopra", "Sethi"];

  const branches = [
    { id: "branch-ludhiyana", name: "Ludhiyana (Main)" },
    { id: "branch-navimumbai", name: "Navi Mumbai" },
    { id: "branch-kota", name: "Kota" },
  ];

  let fileCounter = 45800;

  // 1. Explicit Walkthrough Key Record: MGM-45821 for ABC Finance
  const walkThroughDisbursal: Disbursal = {
    id: "DISB-2026-0001",
    fileId: "MGM-45821",
    applicationId: "APP-99210",
    disbursalDate: "2026-09-02",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    product: "Business Loan",
    dsaId: "DSA-LDH-001",
    dsaName: "ABC Finance",
    customerReference: "M/s Vardhman Hosiery & Textile Mills",
    disbursalAmount: 800000,
    loanReference: "LN-BL-2026-0891",
    status: "CALCULATED",
    applicableRuleId: "RULE-DSA-ABC-BL",
    applicableRuleName: "ABC Finance Business Loan Custom Rate",
    applicableRuleVersion: 3,
    commissionRate: 1.50,
    grossCommission: 12000,
    netCommission: 11500,
    createdBy: "Neha Sharma",
    createdAt: "2026-09-02T11:20:00Z",
    notes: "Machinery expansion term loan under SME Credit Guarantee scheme.",
  };
  disbursals.push(walkThroughDisbursal);

  const walkThroughPayable: CommissionPayable = {
    id: "CP-00182",
    disbursalId: "DISB-2026-0001",
    fileId: "MGM-45821",
    applicationId: "APP-99210",
    dsaId: "DSA-LDH-001",
    dsaName: "ABC Finance",
    dsaAccountNumber: "50200039281260",
    dsaIfsc: "HDFC0000034",
    dsaBankName: "HDFC Bank",
    dsaAccountHolderName: "ABC Financial Advisory Services LLP",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    product: "Business Loan",
    customerReference: "M/s Vardhman Hosiery & Textile Mills",
    disbursalDate: "2026-09-02",
    disbursalAmount: 800000,
    commissionRuleId: "RULE-DSA-ABC-BL",
    commissionRuleName: "ABC Finance Business Loan Custom Rate",
    commissionRuleVersion: 3,
    commissionRate: 1.50,
    grossCommission: 12000,
    adjustments: [
      {
        id: "ADJ-001",
        type: "TDS",
        amount: 500,
        reason: "Section 194H TDS deduction @ 5% on commission",
        adjustedBy: "Sunita Joshi",
        adjustedAt: "2026-09-02 12:00",
      },
    ],
    totalAdjustments: 500,
    netPayable: 11500,
    status: "READY_FOR_PAYOUT",
    calculatedAt: "2026-09-02T11:25:00Z",
    calculatedBy: "System Rule Engine v3",
    auditTrail: [
      {
        id: "AUD-CP-001",
        timestamp: "2026-09-02 11:25",
        userId: "user-neha",
        userName: "Neha Sharma",
        userRole: "MAKER",
        action: "DISBURSAL_CREATED",
        details: "Disbursal record created for File #MGM-45821, ₹8,00,000",
      },
      {
        id: "AUD-CP-002",
        timestamp: "2026-09-02 11:25",
        userId: "system",
        userName: "System Engine",
        userRole: "ADMIN",
        action: "COMMISSION_CALCULATED",
        details: "Rule matched: RULE-DSA-ABC-BL (v3) @ 1.50%, Gross: ₹12,000",
      },
      {
        id: "AUD-CP-003",
        timestamp: "2026-09-02 12:00",
        userId: "user-sunita",
        userName: "Sunita Joshi",
        userRole: "FINANCE",
        action: "ADJUSTMENT_ADDED",
        details: "Added TDS adjustment: ₹500 (Section 194H TDS)",
      },
    ],
  };
  payables.push(walkThroughPayable);

  // 2. Exception Demo Record: Missing Rule
  disbursals.push({
    id: "DISB-2026-0002",
    fileId: "MGM-45822",
    applicationId: "APP-99211",
    disbursalDate: "2026-09-02",
    branchId: "branch-kota",
    branchName: "Kota",
    product: "Solar Equipment Finance", // Unknown product
    dsaId: "DSA-KOT-001",
    dsaName: "Hadoti Capital Services",
    customerReference: "Chambal Agro Cold Storage",
    disbursalAmount: 1500000,
    loanReference: "LN-SE-2026-0120",
    status: "MISSING_RULE",
    createdBy: "Priya Mehta",
    createdAt: "2026-09-02T14:10:00Z",
    notes: "Special solar equipment product - requires explicit commission scheme mapping.",
  });

  // 3. Exception Demo Record: Missing Bank Details / On Hold
  disbursals.push({
    id: "DISB-2026-0003",
    fileId: "MGM-45823",
    applicationId: "APP-99212",
    disbursalDate: "2026-09-01",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    product: "Personal Loan",
    dsaId: "DSA-LDH-008",
    dsaName: "Golden Finserve",
    customerReference: "Rupinderjit Singh",
    disbursalAmount: 450000,
    loanReference: "LN-PL-2026-0491",
    status: "ON_HOLD",
    applicableRuleId: "RULE-PL-TIER1",
    applicableRuleName: "Personal Loan — Slab ₹1L to ₹5L",
    applicableRuleVersion: 1,
    commissionRate: 1.00,
    grossCommission: 4500,
    netCommission: 4500,
    createdBy: "Neha Sharma",
    createdAt: "2026-09-01T15:30:00Z",
    notes: "DSA Bank account verification pending.",
  });
  payables.push({
    id: "CP-00183",
    disbursalId: "DISB-2026-0003",
    fileId: "MGM-45823",
    dsaId: "DSA-LDH-008",
    dsaName: "Golden Finserve",
    dsaAccountNumber: "50200084729104",
    dsaIfsc: "HDFC0000034",
    dsaBankName: "HDFC Bank",
    dsaAccountHolderName: "Golden Finserve Associates",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    product: "Personal Loan",
    customerReference: "Rupinderjit Singh",
    disbursalDate: "2026-09-01",
    disbursalAmount: 450000,
    commissionRuleId: "RULE-PL-TIER1",
    commissionRuleName: "Personal Loan — Slab ₹1L to ₹5L",
    commissionRuleVersion: 1,
    commissionRate: 1.00,
    grossCommission: 4500,
    adjustments: [],
    totalAdjustments: 0,
    netPayable: 4500,
    status: "ON_HOLD",
    holdReason: "DSA bank passbook copy pending verification.",
    holdSetBy: "Sunita Joshi",
    holdSetAt: "2026-09-01 16:00",
    calculatedAt: "2026-09-01T15:35:00Z",
    calculatedBy: "System Rule Engine",
    auditTrail: [
      {
        id: "AUD-CP-004",
        timestamp: "2026-09-01 16:00",
        userId: "user-sunita",
        userName: "Sunita Joshi",
        userRole: "FINANCE",
        action: "PAYABLE_PLACED_ON_HOLD",
        details: "Held: DSA bank details require verification before release.",
      },
    ],
  });

  // 4. Exception Demo Record: Possible Duplicate
  disbursals.push({
    id: "DISB-2026-0004",
    fileId: "MGM-45821-DUP",
    applicationId: "APP-99210",
    disbursalDate: "2026-09-02",
    branchId: "branch-ludhiyana",
    branchName: "Ludhiyana (Main)",
    product: "Business Loan",
    dsaId: "DSA-LDH-001",
    dsaName: "ABC Finance",
    customerReference: "M/s Vardhman Hosiery & Textile Mills",
    disbursalAmount: 800000,
    loanReference: "LN-BL-2026-0891",
    status: "DUPLICATE",
    duplicateOfFileId: "MGM-45821",
    createdBy: "Neha Sharma",
    createdAt: "2026-09-02T16:00:00Z",
    notes: "Duplicate submission of Application #APP-99210 detected.",
  });

  // 5. Generate 95+ realistic disbursals across historical dates (August & September 2026)
  const dsaPool = INITIAL_DSAS;
  let cpCounter = 184;

  for (let i = 5; i <= 105; i++) {
    fileCounter++;
    const dsa = dsaPool[(i - 5) % dsaPool.length];
    const product = products[i % products.length];
    const customer = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const branch = branches.find((b) => b.id === dsa.branchId) || branches[0];
    
    // Amount ranges between 1.5L and 45L
    const amountTiers = [250000, 400000, 650000, 850000, 1200000, 1800000, 2500000, 3500000];
    const disbursalAmount = amountTiers[i % amountTiers.length];

    // Dates spread from 2026-08-01 to 2026-09-03
    const day = ((i * 3) % 28) + 1;
    const month = i < 70 ? "08" : "09";
    const disbursalDate = `2026-${month}-${day < 10 ? "0" + day : day}`;

    // Match rule
    const ruleMatch = matchCommissionRule(
      INITIAL_COMMISSION_RULES,
      dsa.id,
      product,
      disbursalAmount,
      branch.id
    );

    const rule = ruleMatch.rule || INITIAL_COMMISSION_RULES[INITIAL_COMMISSION_RULES.length - 1];
    const rate = rule.commissionPercentage;
    const grossCommission = Math.round((disbursalAmount * rate) / 100);
    const tds = Math.round(grossCommission * 0.05); // 5% TDS
    const netCommission = grossCommission - tds;

    const fileId = `MGM-${fileCounter}`;
    const disbursalId = `DISB-2026-${i < 1000 ? ("000" + i).slice(-4) : i}`;

    // Assign realistic life-cycle statuses
    let disbursalStatus: Disbursal["status"] = "CALCULATED";
    let payableStatus: CommissionPayable["status"] = "READY_FOR_PAYOUT";
    let paymentId: string | undefined = undefined;

    if (month === "08" && i < 50) {
      // Historical August payments - already paid
      payableStatus = "PAID";
      paymentId = `PAY-202608${day < 10 ? "0" + day : day}-${("000" + i).slice(-4)}`;
    } else if (month === "08" && i >= 50) {
      // August payments - approved and ready for bank file
      payableStatus = "APPROVED";
      paymentId = `PAY-20260828-${("000" + i).slice(-4)}`;
    } else if (i % 7 === 0) {
      // Pending checker review
      payableStatus = "PENDING_CHECKER";
      paymentId = `PAY-20260902-${("000" + i).slice(-4)}`;
    } else if (i % 9 === 0) {
      // Payment generated by maker
      payableStatus = "PAYMENT_GENERATED";
      paymentId = `PAY-20260903-${("000" + i).slice(-4)}`;
    } else if (i % 13 === 0) {
      // On hold
      payableStatus = "ON_HOLD";
    } else {
      // Ready for payout
      payableStatus = "READY_FOR_PAYOUT";
    }

    const disbursal: Disbursal = {
      id: disbursalId,
      fileId,
      applicationId: `APP-${88000 + i}`,
      disbursalDate,
      branchId: branch.id,
      branchName: branch.name,
      product,
      dsaId: dsa.id,
      dsaName: dsa.name,
      customerReference: customer,
      disbursalAmount,
      loanReference: `LN-${product.substring(0, 2).toUpperCase()}-2026-${1000 + i}`,
      status: disbursalStatus,
      applicableRuleId: rule.id,
      applicableRuleName: rule.name,
      applicableRuleVersion: rule.version,
      commissionRate: rate,
      grossCommission,
      netCommission,
      createdBy: "Neha Sharma",
      createdAt: `${disbursalDate}T10:30:00Z`,
      notes: `${product} sanctioned under standard credit norms.`,
    };
    disbursals.push(disbursal);

    const payable: CommissionPayable = {
      id: `CP-00${cpCounter++}`,
      disbursalId,
      fileId,
      applicationId: `APP-${88000 + i}`,
      dsaId: dsa.id,
      dsaName: dsa.name,
      dsaAccountNumber: dsa.accountNumber,
      dsaIfsc: dsa.ifsc,
      dsaBankName: dsa.bankName,
      dsaAccountHolderName: dsa.accountHolderName,
      branchId: branch.id,
      branchName: branch.name,
      product,
      customerReference: customer,
      disbursalDate,
      disbursalAmount,
      commissionRuleId: rule.id,
      commissionRuleName: rule.name,
      commissionRuleVersion: rule.version,
      commissionRate: rate,
      grossCommission,
      adjustments: [
        {
          id: `ADJ-${cpCounter}`,
          type: "TDS",
          amount: tds,
          reason: "Section 194H TDS deduction @ 5%",
          adjustedBy: "Sunita Joshi",
          adjustedAt: `${disbursalDate} 11:00`,
        },
      ],
      totalAdjustments: tds,
      netPayable: netCommission,
      status: payableStatus,
      holdReason: payableStatus === "ON_HOLD" ? "Quarterly compliance review pending for channel partner." : undefined,
      paymentId,
      calculatedAt: `${disbursalDate}T10:35:00Z`,
      calculatedBy: `System Rule Engine (Rule: ${rule.name})`,
      auditTrail: [
        {
          id: `AUD-CP-${cpCounter}-1`,
          timestamp: `${disbursalDate} 10:35`,
          userId: "user-neha",
          userName: "Neha Sharma",
          userRole: "MAKER",
          action: "DISBURSAL_RECORDED",
          details: `Disbursal File #${fileId}, ₹${disbursalAmount.toLocaleString("en-IN")}`,
        },
        {
          id: `AUD-CP-${cpCounter}-2`,
          timestamp: `${disbursalDate} 10:35`,
          userId: "system",
          userName: "System Engine",
          userRole: "ADMIN",
          action: "COMMISSION_CALCULATED",
          details: `Applied Rule: ${rule.name} (v${rule.version}) @ ${rate}%, Net: ₹${netCommission.toLocaleString("en-IN")}`,
        },
      ],
    };
    payables.push(payable);
  }

  return { disbursals, payables };
}
