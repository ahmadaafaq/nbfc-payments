import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Plus,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Building2,
  FileSpreadsheet,
  X,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Filter,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import {
  Disbursal,
  DisbursalStatus,
  LoanProductType,
  DSAPartner,
} from "../../../types";

interface DisbursalsViewProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const DisbursalsView: React.FC<DisbursalsViewProps> = ({ onNavigate }) => {
  const [disbursals, setDisbursals] = useState<Disbursal[]>(StorageService.getDisbursals());
  const [dsas] = useState<DSAPartner[]>(StorageService.getDSAs());
  const branches = StorageService.getBranches();
  const currentUser = StorageService.getCurrentUser();

  const [activeTab, setActiveTab] = useState<"REGISTER" | "BULK_UPLOAD">("REGISTER");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDsa, setSelectedDsa] = useState<string>("ALL");

  // Single Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [singleForm, setSingleForm] = useState({
    fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
    applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    customerReference: "Rameshwar Industries Ltd",
    branchId: branches[0]?.id || "branch-ludhiyana",
    product: "BUSINESS_LOAN" as LoanProductType,
    dsaId: dsas[0]?.id || "",
    disbursalAmount: 2000000,
    disbursalDate: new Date().toISOString().split("T")[0],
  });
  const [previewCalculation, setPreviewCalculation] = useState<any>(null);

  // Bulk Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setDisbursals(StorageService.getDisbursals());
    });
    return unsub;
  }, []);

  // Update live preview when single form fields change
  useEffect(() => {
    if (showAddModal && singleForm.dsaId && singleForm.disbursalAmount > 0) {
      const calc = StorageService.calculateCommission({
        loanAmount: Number(singleForm.disbursalAmount),
        product: singleForm.product,
        dsaId: singleForm.dsaId,
        branchId: singleForm.branchId,
        disbursalDate: singleForm.disbursalDate,
      });
      setPreviewCalculation(calc);
    }
  }, [singleForm, showAddModal]);

  const filteredDisbursals = disbursals.filter((d) => {
    const matchesSearch =
      (d.fileId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.applicationId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.customerReference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.dsaName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.dsaCode && d.dsaCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch = selectedBranch === "ALL" || d.branchId === selectedBranch;
    const matchesProduct = selectedProduct === "ALL" || d.product === selectedProduct;
    const matchesStatus = selectedStatus === "ALL" || d.status === selectedStatus;
    const matchesDsa = selectedDsa === "ALL" || d.dsaId === selectedDsa;

    return matchesSearch && matchesBranch && matchesProduct && matchesStatus && matchesDsa;
  });

  const handleOpenAdd = () => {
    const newFileId = `MGM-${Math.floor(10000 + Math.random() * 90000)}`;
    const newAppId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setSingleForm({
      fileId: newFileId,
      applicationId: newAppId,
      customerReference: "Punjab Agro Export Syndicate",
      branchId: branches[0]?.id || "branch-ludhiyana",
      product: "BUSINESS_LOAN",
      dsaId: dsas[0]?.id || "",
      disbursalAmount: 1800000,
      disbursalDate: new Date().toISOString().split("T")[0],
    });
    setShowAddModal(true);
  };

  const handleSaveSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = branches.find((b) => b.id === singleForm.branchId) || branches[0];
    const partner = dsas.find((d) => d.id === singleForm.dsaId) || dsas[0];

    const calc = StorageService.calculateCommission({
      loanAmount: Number(singleForm.disbursalAmount),
      product: singleForm.product,
      dsaId: partner.id,
      branchId: branch.id,
      disbursalDate: singleForm.disbursalDate,
    });

    const newDisbursal: Disbursal = {
      id: `DISB-${Date.now().toString().slice(-6)}`,
      fileId: singleForm.fileId,
      applicationId: singleForm.applicationId,
      customerReference: singleForm.customerReference,
      branchId: branch.id,
      branchName: branch.name,
      product: singleForm.product,
      dsaId: partner.id,
      dsaName: partner.name,
      dsaCode: partner.dsaCode,
      disbursalAmount: Number(singleForm.disbursalAmount),
      disbursalDate: singleForm.disbursalDate,
      status: "CALCULATED",
      commissionRuleId: calc.appliedRuleId,
      commissionRuleVersion: calc.appliedRuleVersion,
      commissionRatePercentage: calc.appliedRatePercentage,
      grossCommission: calc.grossCommission,
      tdsAmount: calc.tdsAmount,
      netCommission: calc.netCommission,
      createdAt: new Date().toISOString(),
    };

    StorageService.addDisbursal(newDisbursal);
    setShowAddModal(false);
  };

  // Sample CSV generator
  const handleDownloadSampleCSV = () => {
    const csvContent =
      "FileID,ApplicationID,CustomerReference,BranchCode,Product,DSACode,DisbursalAmount,DisbursalDate\n" +
      "MGM-91021,APP-2026-901,Vardhman Handlooms,LDH,BUSINESS_LOAN,ABC-FIN,2500000,2026-09-02\n" +
      "MGM-91022,APP-2026-902,Oberoi Real Estate,LDH,LOAN_AGAINST_PROPERTY,GOLDEN-CP,4500000,2026-09-03\n" +
      "MGM-91023,APP-2026-903,Western Express Couriers,NVM,BUSINESS_LOAN,SHIVAM-CP,1200000,2026-09-03\n" +
      "MGM-91024,APP-2026-904,Chambal Precision Tools,KOT,MICRO_ENTERPRISE_LOAN,APEX-KOTA,800000,2026-09-04\n" +
      "MGM-91025,APP-2026-905,Singh Transport Logistics,LDH,BUSINESS_LOAN,ABC-FIN,3000000,2026-09-04";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "MGM_Disbursals_Sample_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pre-load demo batch for bulk testing
  const handleLoadDemoBatch = () => {
    const sampleRows = [
      {
        fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
        applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerReference: "Golden Hosiery Works Ludhiana",
        branchCode: "LDH",
        product: "BUSINESS_LOAN",
        dsaCode: "ABC-FIN",
        disbursalAmount: 2200000,
        disbursalDate: new Date().toISOString().split("T")[0],
      },
      {
        fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
        applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerReference: "Navi Mumbai Cold Storage LLP",
        branchCode: "NVM",
        product: "LOAN_AGAINST_PROPERTY",
        dsaCode: "SHIVAM-CP",
        disbursalAmount: 4800000,
        disbursalDate: new Date().toISOString().split("T")[0],
      },
      {
        fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
        applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerReference: "Hadoti Stone & Granite Works",
        branchCode: "KOT",
        product: "BUSINESS_LOAN",
        dsaCode: "APEX-KOTA",
        disbursalAmount: 1600000,
        disbursalDate: new Date().toISOString().split("T")[0],
      },
      {
        fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
        applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerReference: "Malwa Dairy Equipment Syndicate",
        branchCode: "LDH",
        product: "MICRO_ENTERPRISE_LOAN",
        dsaCode: "GOLDEN-CP",
        disbursalAmount: 950000,
        disbursalDate: new Date().toISOString().split("T")[0],
      },
      {
        fileId: `MGM-${Math.floor(10000 + Math.random() * 90000)}`,
        applicationId: `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerReference: "Seawoods Freight Movers",
        branchCode: "NVM",
        product: "BUSINESS_LOAN",
        dsaCode: "SHIVAM-CP",
        disbursalAmount: 3200000,
        disbursalDate: new Date().toISOString().split("T")[0],
      },
    ];

    validateAndSetRows(sampleRows, "MGM_Core_LMS_Daily_Disbursals_Sept.csv");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSVContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const parseCSVContent = (text: string, filename: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      alert("Uploaded CSV contains no valid data rows.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const fileIdIdx = headers.findIndex((h) => h.includes("file"));
    const appIdx = headers.findIndex((h) => h.includes("app"));
    const custIdx = headers.findIndex((h) => h.includes("customer") || h.includes("client"));
    const branchIdx = headers.findIndex((h) => h.includes("branch"));
    const productIdx = headers.findIndex((h) => h.includes("product"));
    const dsaIdx = headers.findIndex((h) => h.includes("dsa") || h.includes("partner"));
    const amountIdx = headers.findIndex((h) => h.includes("amount") || h.includes("disbursal"));
    const dateIdx = headers.findIndex((h) => h.includes("date"));

    const rows: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",").map((p) => p.trim());
      if (parts.length < 5) continue;

      rows.push({
        fileId: parts[fileIdIdx >= 0 ? fileIdIdx : 0] || `MGM-${10000 + i}`,
        applicationId: parts[appIdx >= 0 ? appIdx : 1] || `APP-2026-${1000 + i}`,
        customerReference: parts[custIdx >= 0 ? custIdx : 2] || "Customer Account",
        branchCode: parts[branchIdx >= 0 ? branchIdx : 3] || "LDH",
        product: (parts[productIdx >= 0 ? productIdx : 4] || "BUSINESS_LOAN").toUpperCase(),
        dsaCode: (parts[dsaIdx >= 0 ? dsaIdx : 5] || "ABC-FIN").toUpperCase(),
        disbursalAmount: Number(parts[amountIdx >= 0 ? amountIdx : 6]) || 1000000,
        disbursalDate: parts[dateIdx >= 0 ? dateIdx : 7] || new Date().toISOString().split("T")[0],
      });
    }

    validateAndSetRows(rows, filename);
  };

  const validateAndSetRows = (rows: any[], filename: string) => {
    setUploadedFileName(filename);
    const existingFileIds = new Set(disbursals.map((d) => (d.fileId || "").toUpperCase()).filter(Boolean));
    const existingAppIds = new Set(disbursals.map((d) => (d.applicationId || "").toUpperCase()).filter(Boolean));
    const validDsaCodes = new Set(dsas.map((d) => (d.dsaCode || "").toUpperCase()).filter(Boolean));

    const issues: string[] = [];
    const enriched = rows.map((r, idx) => {
      let error = "";
      let warning = "";

      if (r.fileId && existingFileIds.has(r.fileId.toUpperCase())) {
        warning = "Duplicate File ID already exists in MGM database.";
      } else if (r.applicationId && existingAppIds.has(r.applicationId.toUpperCase())) {
        warning = "Application ID matches an existing record.";
      }

      if (r.dsaCode && !validDsaCodes.has(r.dsaCode.toUpperCase())) {
        error = `Unrecognized Partner Code '${r.dsaCode}'. Please empanel in DSA Master first.`;
      }

      if (error) issues.push(`Row ${idx + 1}: ${error}`);

      // Preview calculation for this row
      const matchedDsa = dsas.find((d) => (d.dsaCode || "").toUpperCase() === (r.dsaCode || "").toUpperCase());
      const branch =
        branches.find((b) => (b.code || "").toUpperCase() === (r.branchCode || "").toUpperCase()) || branches[0];

      let calc = null;
      if (matchedDsa) {
        calc = StorageService.calculateCommission({
          loanAmount: r.disbursalAmount,
          product: r.product,
          dsaId: matchedDsa.id,
          branchId: branch.id,
          disbursalDate: r.disbursalDate,
        });
      }

      return {
        ...r,
        error,
        warning,
        calc,
        matchedDsa,
        branch,
      };
    });

    setParsedRows(enriched);
    setValidationIssues(issues);
  };

  const handleCommitBulkImport = () => {
    if (parsedRows.length === 0) return;
    if (validationIssues.length > 0) {
      if (!window.confirm(`There are ${validationIssues.length} validation errors. Only valid rows will be imported. Proceed?`)) {
        return;
      }
    }

    setIsProcessing(true);
    let successCount = 0;

    parsedRows.forEach((row) => {
      if (row.error) return; // Skip errored rows

      const calc =
        row.calc ||
        StorageService.calculateCommission({
          loanAmount: row.disbursalAmount,
          product: row.product,
          dsaId: row.matchedDsa?.id || dsas[0].id,
          branchId: row.branch.id,
          disbursalDate: row.disbursalDate,
        });

      const disbursalRecord: Disbursal = {
        id: `DISB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fileId: row.fileId,
        applicationId: row.applicationId,
        customerReference: row.customerReference,
        branchId: row.branch.id,
        branchName: row.branch.name,
        product: row.product,
        dsaId: row.matchedDsa?.id || dsas[0].id,
        dsaName: row.matchedDsa?.name || "Empaneled Partner",
        dsaCode: row.dsaCode,
        disbursalAmount: Number(row.disbursalAmount),
        disbursalDate: row.disbursalDate,
        status: "CALCULATED",
        commissionRuleId: calc.appliedRuleId,
        commissionRuleVersion: calc.appliedRuleVersion,
        commissionRatePercentage: calc.appliedRatePercentage,
        grossCommission: calc.grossCommission,
        tdsAmount: calc.tdsAmount,
        netCommission: calc.netCommission,
        createdAt: new Date().toISOString(),
      };

      StorageService.addDisbursal(disbursalRecord);
      successCount++;
    });

    setIsProcessing(false);
    setParsedRows([]);
    setUploadedFileName("");
    setActiveTab("REGISTER");

    alert(`Successfully processed and calculated commissions for ${successCount} loan disbursals! Generated associated Commission Payables.`);
  };

  const getProductLabel = (p: string) => {
    const map: Record<string, string> = {
      BUSINESS_LOAN: "Business Loan",
      PERSONAL_LOAN: "Personal Loan",
      LOAN_AGAINST_PROPERTY: "Loan Against Property (LAP)",
      MICRO_ENTERPRISE_LOAN: "Micro Enterprise Loan",
      USED_CAR_LOAN: "Used Car Loan",
      HOME_LOAN: "Home Loan",
      "Business Loan": "Business Loan",
      "Personal Loan": "Personal Loan",
      "Loan Against Property": "Loan Against Property (LAP)",
      "Micro Enterprise Loan": "Micro Enterprise Loan",
      "Used Car Loan": "Used Car Loan",
      "All Products": "All Loan Products",
    };
    return map[p] || (p ? p.replace(/_/g, " ") : "General Product");
  };

  const totalDisbursalVolume = disbursals.reduce((sum, d) => sum + (d.disbursalAmount || 0), 0);
  const totalGrossCommission = disbursals.reduce((sum, d) => sum + (d.grossCommission || 0), 0);
  const totalNetCommission = disbursals.reduce((sum, d) => sum + (d.netCommission || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Disbursals &amp; Commission Calculation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {disbursals.length} Disbursals Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Reconcile loan disbursals from core banking/LOS, auto-evaluate tiered partner slabs, and generate payable vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-white/10 p-1 border border-white/15">
            <button
              onClick={() => setActiveTab("REGISTER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "REGISTER"
                  ? "bg-purple-600 text-white shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              Disbursal Register
            </button>
            <button
              onClick={() => setActiveTab("BULK_UPLOAD")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "BULK_UPLOAD"
                  ? "bg-purple-600 text-white shadow"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Excel Upload</span>
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30 transition border border-white/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Disbursal</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            Total Sourced Loan Volume
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            ₹{(totalDisbursalVolume / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-[11px] text-white/50">{disbursals.length} Disbursed accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            Total Gross Commission
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            ₹{totalGrossCommission.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-white/50">Avg Rate: {(totalGrossCommission / (totalDisbursalVolume || 1) * 100).toFixed(2)}%</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-emerald-400/70 uppercase tracking-wider">
            Net Commission Payable (Post 5% TDS)
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            ₹{totalNetCommission.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-300/70">TDS Retained: ₹{(totalGrossCommission - totalNetCommission).toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* TAB 1: DISBURSAL REGISTER */}
      {activeTab === "REGISTER" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="File ID, customer, partner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60 transition"
                />
              </div>

              {/* Branch */}
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
              >
                <option value="ALL" className="bg-slate-900">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900">
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Product */}
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
              >
                <option value="ALL" className="bg-slate-900">All Loan Products</option>
                <option value="BUSINESS_LOAN" className="bg-slate-900">Business Loan</option>
                <option value="PERSONAL_LOAN" className="bg-slate-900">Personal Loan</option>
                <option value="LOAN_AGAINST_PROPERTY" className="bg-slate-900">Loan Against Property (LAP)</option>
                <option value="MICRO_ENTERPRISE_LOAN" className="bg-slate-900">Micro Enterprise Loan</option>
                <option value="USED_CAR_LOAN" className="bg-slate-900">Used Car Loan</option>
              </select>

              {/* DSA */}
              <select
                value={selectedDsa}
                onChange={(e) => setSelectedDsa(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
              >
                <option value="ALL" className="bg-slate-900">All Channel Partners</option>
                {dsas.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900">
                    {d.name} ({d.dsaCode})
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="CALCULATED" className="bg-slate-900">Calculated</option>
                <option value="MISSING_DSA" className="bg-slate-900">Missing DSA</option>
                <option value="MISSING_RULE" className="bg-slate-900">Missing Rule</option>
                <option value="DUPLICATE" className="bg-slate-900">Duplicate</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-white/80">
                <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40 font-bold border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">File &amp; App ID</th>
                    <th className="py-3 px-4">Customer Account</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Channel Partner</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-right">Disbursal Amount</th>
                    <th className="py-3 px-4 text-center">Applied Rate</th>
                    <th className="py-3 px-4 text-right">Net Commission</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredDisbursals.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-white/40">
                        No disbursals found matching selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDisbursals.map((d) => (
                      <tr key={d.id} className="hover:bg-white/[0.04] transition">
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{d.fileId}</span>
                          </div>
                          <div className="text-[10px] text-white/40">{d.applicationId}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{d.customerReference}</div>
                          <div className="text-[10px] text-white/40">{d.disbursalDate}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-white/80 font-medium">{d.branchName}</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-purple-300">{d.dsaName}</div>
                          <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/10 text-white/60">
                            {d.dsaCode}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-[11px] text-white/70">
                          {getProductLabel(d.product)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ₹{(d.disbursalAmount || 0).toLocaleString("en-IN")}
                        </td>

                        <td className="py-3 px-4 text-center font-mono">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                            {(d.commissionRatePercentage ?? 0).toFixed(2)}%
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right font-mono">
                          <div className="font-black text-emerald-400">
                            ₹{(d.netCommission || 0).toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-white/40">Gross: ₹{(d.grossCommission || 0).toLocaleString("en-IN")}</div>
                        </td>

                        <td className="py-3 px-4">
                          {d.status === "CALCULATED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              CALCULATED
                            </span>
                          )}
                          {d.status === "DUPLICATE" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              DUPLICATE
                            </span>
                          )}
                          {d.status === "MISSING_DSA" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <AlertCircle className="w-3 h-3" />
                              NO DSA
                            </span>
                          )}
                          {d.status !== "CALCULATED" && d.status !== "DUPLICATE" && d.status !== "MISSING_DSA" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {d.status || "READY"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK EXCEL UPLOAD */}
      {activeTab === "BULK_UPLOAD" && (
        <div className="space-y-6">
          {/* File drop zone & helper buttons */}
          <div className="p-8 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-dashed border-white/20 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/20 flex items-center justify-center text-purple-300 shadow-xl">
              <FileSpreadsheet className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-white">
                Upload Disbursals Batch File (.csv / .xlsx)
              </h3>
              <p className="text-xs text-white/50 mt-1 max-w-md mx-auto">
                Upload daily or monthly core loan disbursals. The engine will parse headers, validate partners, calculate tiered slabs, and flag duplicates.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition border border-white/20 inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>Select Disbursals CSV</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLoadDemoBatch}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition inline-flex items-center gap-2 backdrop-blur-md"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Load 5 Production Sample Rows</span>
              </button>

              <button
                onClick={handleDownloadSampleCSV}
                className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold border border-white/10 transition inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {uploadedFileName && (
              <div className="pt-2 text-xs font-mono text-purple-300">
                Selected File: <span className="text-white font-bold">{uploadedFileName}</span> ({parsedRows.length} rows detected)
              </div>
            )}
          </div>

          {/* Parsed Rows Validation Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Pre-Upload Validation Grid ({parsedRows.length} Disbursals Ready)
                  </h3>
                  <p className="text-xs text-white/50">
                    Review automatic commission allocations and warnings before committing into Payables.
                  </p>
                </div>

                <button
                  onClick={handleCommitBulkImport}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-900/40 transition border border-white/20 flex items-center gap-2 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calculate &amp; Import All {parsedRows.length} Records</span>
                </button>
              </div>

              {validationIssues.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{validationIssues.length} Validation Warnings Detected:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/80">
                    {validationIssues.slice(0, 3).map((iss, i) => (
                      <li key={i}>{iss}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-white/80">
                    <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40 font-bold border-b border-white/10">
                      <tr>
                        <th className="py-3 px-4">File ID</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">DSA Partner</th>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4 text-right">Loan Amount</th>
                        <th className="py-3 px-4 text-center">Matched Rule &amp; Rate</th>
                        <th className="py-3 px-4 text-right">Net Commission</th>
                        <th className="py-3 px-4">Validation Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.04] transition">
                          <td className="py-3 px-4 font-mono font-bold text-white">{r.fileId}</td>
                          <td className="py-3 px-4 font-semibold text-white/90">{r.customerReference}</td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-purple-300">{r.dsaCode}</span>
                            {r.matchedDsa && <div className="text-[10px] text-white/40">{r.matchedDsa.name}</div>}
                          </td>
                          <td className="py-3 px-4 text-[11px] text-white/70">{r.product}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-white">
                            ₹{Number(r.disbursalAmount).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {r.calc ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                                {r.calc.appliedRatePercentage.toFixed(2)}%
                              </span>
                            ) : (
                              <span className="text-white/40">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-black text-emerald-400">
                            {r.calc ? `₹${r.calc.netCommission.toLocaleString("en-IN")}` : "-"}
                          </td>
                          <td className="py-3 px-4">
                            {r.error ? (
                              <span className="text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                                {r.error}
                              </span>
                            ) : r.warning ? (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                {r.warning}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                                READY TO IMPORT
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Single Add Disbursal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">Add Single Loan Disbursal</h3>
                <p className="text-xs text-white/50">
                  Enter loan reference, applicant details, and source DSA partner to compute payout.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">File ID *</label>
                  <input
                    type="text"
                    required
                    value={singleForm.fileId}
                    onChange={(e) => setSingleForm({ ...singleForm, fileId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Application ID *</label>
                  <input
                    type="text"
                    required
                    value={singleForm.applicationId}
                    onChange={(e) => setSingleForm({ ...singleForm, applicationId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white/70 font-semibold mb-1">Customer / Entity Reference *</label>
                  <input
                    type="text"
                    required
                    value={singleForm.customerReference}
                    onChange={(e) => setSingleForm({ ...singleForm, customerReference: e.target.value })}
                    placeholder="e.g. Vardhman Textiles Corp"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Operating Branch *</label>
                  <select
                    value={singleForm.branchId}
                    onChange={(e) => setSingleForm({ ...singleForm, branchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Loan Product *</label>
                  <select
                    value={singleForm.product}
                    onChange={(e) => setSingleForm({ ...singleForm, product: e.target.value as LoanProductType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="BUSINESS_LOAN">Business Loan</option>
                    <option value="PERSONAL_LOAN">Personal Loan</option>
                    <option value="LOAN_AGAINST_PROPERTY">Loan Against Property (LAP)</option>
                    <option value="MICRO_ENTERPRISE_LOAN">Micro Enterprise Loan</option>
                    <option value="USED_CAR_LOAN">Used Car Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Channel Partner (DSA) *</label>
                  <select
                    value={singleForm.dsaId}
                    onChange={(e) => setSingleForm({ ...singleForm, dsaId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    {dsas.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.dsaCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Disbursal Amount (₹) *</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={singleForm.disbursalAmount}
                    onChange={(e) => setSingleForm({ ...singleForm, disbursalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Real-time Calculation Preview Card */}
              {previewCalculation && (
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300">Live Commission Allocation Preview</span>
                    <span className="font-mono text-[10px] text-white/60">{previewCalculation.appliedRuleName}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-black/30">
                      <span className="text-white/40 block text-[10px]">Applied Rate</span>
                      <span className="font-black text-emerald-400 font-mono">
                        {previewCalculation.appliedRatePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="p-2 rounded bg-black/30">
                      <span className="text-white/40 block text-[10px]">Gross Comm.</span>
                      <span className="font-bold text-white font-mono">
                        ₹{previewCalculation.grossCommission.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/20 border border-emerald-500/30">
                      <span className="text-emerald-300 block text-[10px] font-bold">Net Payout</span>
                      <span className="font-black text-emerald-300 font-mono">
                        ₹{previewCalculation.netCommission.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition"
                >
                  Record Disbursal &amp; Compute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
