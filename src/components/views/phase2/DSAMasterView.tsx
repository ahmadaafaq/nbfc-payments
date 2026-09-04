import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Building2,
  Phone,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  History,
  X,
  Edit2,
  ChevronRight,
  Download,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import { DSAPartner, BankVerificationStatus, DSAStatus, UserRole } from "../../../types";

interface DSAMasterViewProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const DSAMasterView: React.FC<DSAMasterViewProps> = ({ onNavigate }) => {
  const [dsas, setDsas] = useState<DSAPartner[]>(StorageService.getDSAs());
  const branches = StorageService.getBranches();
  const currentUser = StorageService.getCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedVerification, setSelectedVerification] = useState<string>("ALL");

  const [selectedDsa, setSelectedDsa] = useState<DSAPartner | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showAccountReveal, setShowAccountReveal] = useState<Record<string, boolean>>({});

  // Form State for Add/Edit
  const [formData, setFormData] = useState<Partial<DSAPartner>>({
    dsaCode: "",
    name: "",
    legalName: "",
    contactPerson: "",
    mobile: "",
    email: "",
    branchId: branches[0]?.id || "branch-ludhiyana",
    pan: "",
    gstin: "",
    bankName: "HDFC Bank",
    accountNumber: "",
    ifsc: "",
    accountHolderName: "",
    bankVerificationStatus: "VERIFIED",
    commissionScheme: "Tier-1 Gold Channel Partner",
    status: "ACTIVE",
    notes: "",
  });
  const [bankChangeReason, setBankChangeReason] = useState("");

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setDsas(StorageService.getDSAs());
    });
    return unsub;
  }, []);

  const filteredDsas = dsas.filter((dsa) => {
    const matchesSearch =
      (dsa.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dsa.dsaCode || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dsa.contactPerson || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dsa.pan || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dsa.bankName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dsa.accountNumber || "").includes(searchTerm);

    const matchesBranch = selectedBranch === "ALL" || dsa.branchId === selectedBranch;
    const matchesStatus = selectedStatus === "ALL" || dsa.status === selectedStatus;
    const matchesVerification =
      selectedVerification === "ALL" || dsa.bankVerificationStatus === selectedVerification;

    return matchesSearch && matchesBranch && matchesStatus && matchesVerification;
  });

  const handleOpenAdd = () => {
    setFormData({
      dsaCode: "",
      name: "",
      legalName: "",
      contactPerson: "",
      mobile: "+91 ",
      email: "",
      branchId: branches[0]?.id || "branch-ludhiyana",
      pan: "",
      gstin: "",
      bankName: "HDFC Bank",
      accountNumber: "",
      ifsc: "",
      accountHolderName: "",
      bankVerificationStatus: "VERIFIED",
      commissionScheme: "Standard Retail & LAP Scheme",
      status: "ACTIVE",
      notes: "",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (dsa: DSAPartner) => {
    setFormData({ ...dsa });
    setBankChangeReason("");
    setShowEditModal(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dsaCode || !formData.accountNumber || !formData.ifsc) {
      alert("Please fill in all mandatory partner and banking fields.");
      return;
    }

    const branch = branches.find((b) => b.id === formData.branchId) || branches[0];
    const newDsa: DSAPartner = {
      id: `DSA-${branch.code}-${Date.now().toString().slice(-4)}`,
      dsaCode: (formData.dsaCode || "").toUpperCase(),
      name: formData.name || "",
      legalName: formData.legalName || formData.name || "",
      contactPerson: formData.contactPerson || "",
      mobile: formData.mobile || "",
      email: formData.email || "",
      branchId: branch.id,
      branchName: branch.name,
      pan: (formData.pan || "").toUpperCase(),
      gstin: formData.gstin ? formData.gstin.toUpperCase() : undefined,
      bankName: formData.bankName || "HDFC Bank",
      accountNumber: formData.accountNumber || "",
      ifsc: (formData.ifsc || "").toUpperCase(),
      accountHolderName: formData.accountHolderName || formData.name || "",
      bankVerificationStatus: formData.bankVerificationStatus || "VERIFIED",
      commissionScheme: formData.commissionScheme || "Standard Retail & LAP Scheme",
      status: formData.status || "ACTIVE",
      effectiveDate: new Date().toISOString().split("T")[0],
      notes: formData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bankAuditHistory: [],
    };

    StorageService.addDSA(newDsa);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id) return;

    const existing = dsas.find((d) => d.id === formData.id);
    const branch = branches.find((b) => b.id === formData.branchId) || branches[0];

    const isBankDetailChanged =
      existing &&
      (existing.accountNumber !== formData.accountNumber ||
        existing.ifsc !== formData.ifsc ||
        existing.bankName !== formData.bankName ||
        existing.accountHolderName !== formData.accountHolderName);

    if (isBankDetailChanged && !bankChangeReason.trim()) {
      alert("Bank account details have been modified. RBI compliance requires a documented audit reason for this change.");
      return;
    }

    const updated: DSAPartner = {
      ...(existing as DSAPartner),
      ...formData,
      branchName: branch.name,
      updatedAt: new Date().toISOString(),
    };

    StorageService.updateDSA(updated, currentUser.name);
    setShowEditModal(false);
    if (selectedDsa?.id === updated.id) {
      setSelectedDsa(updated);
    }
  };

  const toggleVerificationStatus = (dsa: DSAPartner, newStatus: BankVerificationStatus) => {
    const updated: DSAPartner = {
      ...dsa,
      bankVerificationStatus: newStatus,
      updatedAt: new Date().toISOString(),
    };
    StorageService.updateDSA(updated, currentUser.name);
    if (selectedDsa?.id === dsa.id) {
      setSelectedDsa(updated);
    }
  };

  const toggleAccountMask = (id: string) => {
    setShowAccountReveal((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskAccount = (acc: string, show: boolean) => {
    if (show || acc.length <= 4) return acc;
    return `•••• •••• ${acc.slice(-4)}`;
  };

  const exportDSAsToCSV = () => {
    const headers = [
      "DSA ID",
      "Code",
      "Name",
      "Legal Name",
      "Branch",
      "Contact Person",
      "Mobile",
      "Email",
      "PAN",
      "GSTIN",
      "Bank Name",
      "Account Number",
      "IFSC",
      "Account Holder",
      "Bank Verification",
      "Commission Scheme",
      "Status",
    ];

    const rows = filteredDsas.map((d) => [
      d.id,
      d.dsaCode,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.legalName.replace(/"/g, '""')}"`,
      d.branchName,
      `"${d.contactPerson.replace(/"/g, '""')}"`,
      d.mobile,
      d.email,
      d.pan,
      d.gstin || "",
      `"${d.bankName}"`,
      d.accountNumber,
      d.ifsc,
      `"${d.accountHolderName.replace(/"/g, '""')}"`,
      d.bankVerificationStatus,
      `"${d.commissionScheme}"`,
      d.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MGM_Channel_Partners_Master_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-400" />
              DSA &amp; Channel Partner Master
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {dsas.length} Empaneled Partners
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Maintain verified channel partner profiles, banking credentials, and immutable IFSC/account audit trails for automated commission disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportDSAsToCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition backdrop-blur-md"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30 transition border border-white/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Empanel New DSA</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by DSA code, name, PAN, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60 transition"
            />
          </div>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
          >
            <option value="ALL" className="bg-slate-900">All Branches (All 3)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900">
                {b.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
          >
            <option value="ALL" className="bg-slate-900">All Operating Statuses</option>
            <option value="ACTIVE" className="bg-slate-900">Active Only</option>
            <option value="ON_HOLD" className="bg-slate-900">On Hold Only</option>
            <option value="INACTIVE" className="bg-slate-900">Inactive Only</option>
          </select>

          {/* Bank Verification Filter */}
          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
          >
            <option value="ALL" className="bg-slate-900">All Bank Statuses</option>
            <option value="VERIFIED" className="bg-slate-900">Verified Bank Details</option>
            <option value="PENDING_VERIFICATION" className="bg-slate-900">Pending Verification</option>
            <option value="FLAGGED" className="bg-slate-900">Flagged / Mismatched</option>
          </select>
        </div>

        {/* Quick summary strip */}
        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 px-1">
          <span>Showing {filteredDsas.length} of {dsas.length} partners</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {dsas.filter((d) => d.status === "ACTIVE").length} Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {dsas.filter((d) => d.status === "ON_HOLD").length} On Hold
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {dsas.filter((d) => d.bankVerificationStatus !== "VERIFIED").length} Unverified Banks
            </span>
          </div>
        </div>
      </div>

      {/* Main Partners Table */}
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40 font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">DSA Partner</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Tax IDs</th>
                <th className="py-3 px-4">Bank &amp; Account</th>
                <th className="py-3 px-4">Bank Verification</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDsas.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    No channel partners match the selected search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDsas.map((dsa) => {
                  const isAccountRevealed = !!showAccountReveal[dsa.id];
                  return (
                    <tr
                      key={dsa.id}
                      className="hover:bg-white/[0.04] transition group"
                    >
                      <td className="py-3 px-4 font-medium">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{dsa.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-purple-300 border border-white/15">
                                {dsa.dsaCode}
                              </span>
                            </div>
                            <div className="text-[10px] text-white/40 truncate max-w-xs">{dsa.legalName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-white/90 font-medium">{dsa.branchName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-white/90 font-medium">{dsa.contactPerson}</div>
                        <div className="text-[10px] text-white/40 flex items-center gap-2">
                          <span>{dsa.mobile}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>PAN: <span className="text-white font-semibold">{dsa.pan}</span></div>
                        {dsa.gstin && <div className="text-[10px] text-white/40">GST: {dsa.gstin}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span className="font-mono text-[11px]">
                            {maskAccount(dsa.accountNumber, isAccountRevealed)}
                          </span>
                          <button
                            onClick={() => toggleAccountMask(dsa.id)}
                            className="text-white/30 hover:text-white transition"
                            title={isAccountRevealed ? "Mask account number" : "Reveal full account number"}
                          >
                            {isAccountRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="text-[10px] text-white/50 flex items-center gap-1">
                          <span>{dsa.bankName}</span>
                          <span>•</span>
                          <span className="font-mono">{dsa.ifsc}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {dsa.bankVerificationStatus === "VERIFIED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            VERIFIED
                          </span>
                        )}
                        {dsa.bankVerificationStatus === "PENDING_VERIFICATION" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                        {dsa.bankVerificationStatus === "FLAGGED" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            FLAGGED
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-[11px] text-white/70 max-w-[140px] truncate">
                        {dsa.commissionScheme}
                      </td>

                      <td className="py-3 px-4">
                        {dsa.status === "ACTIVE" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                        {dsa.status === "ON_HOLD" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ON HOLD
                          </span>
                        )}
                        {dsa.status === "INACTIVE" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                            INACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedDsa(dsa);
                              setShowAuditModal(true);
                            }}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
                            title="View Bank Audit Trail"
                          >
                            <History className="w-3.5 h-3.5 text-purple-300" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(dsa)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
                            title="Edit Partner Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-300" />
                          </button>
                          <button
                            onClick={() => setSelectedDsa(dsa)}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DSA Details Drawer / Modal */}
      {selectedDsa && !showAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30 font-bold">
                    {selectedDsa.dsaCode}
                  </span>
                  <h3 className="text-lg font-black text-white">{selectedDsa.name}</h3>
                </div>
                <p className="text-xs text-white/50 mt-0.5">{selectedDsa.legalName}</p>
              </div>
              <button
                onClick={() => setSelectedDsa(null)}
                className="p-1.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-[11px] text-purple-300 uppercase tracking-wider">
                  Partner Overview
                </span>
                <div>
                  <span className="text-white/40">Registered Branch:</span>
                  <p className="font-semibold text-white">{selectedDsa.branchName}</p>
                </div>
                <div>
                  <span className="text-white/40">Contact Person:</span>
                  <p className="font-semibold text-white">{selectedDsa.contactPerson}</p>
                </div>
                <div>
                  <span className="text-white/40">Phone / Email:</span>
                  <p className="text-white">{selectedDsa.mobile} • {selectedDsa.email}</p>
                </div>
                <div>
                  <span className="text-white/40">PAN / GSTIN:</span>
                  <p className="font-mono text-white">{selectedDsa.pan} {selectedDsa.gstin ? `• ${selectedDsa.gstin}` : ""}</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-emerald-300 uppercase tracking-wider">
                    Bank Account Details
                  </span>
                  {selectedDsa.bankVerificationStatus === "VERIFIED" ? (
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/30">
                      {selectedDsa.bankVerificationStatus}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-white/40">Account Holder Name:</span>
                  <p className="font-semibold text-white">{selectedDsa.accountHolderName}</p>
                </div>
                <div>
                  <span className="text-white/40">Bank Name:</span>
                  <p className="font-semibold text-white">{selectedDsa.bankName}</p>
                </div>
                <div>
                  <span className="text-white/40">Account Number:</span>
                  <p className="font-mono font-bold text-white text-sm">{selectedDsa.accountNumber}</p>
                </div>
                <div>
                  <span className="text-white/40">IFSC Code:</span>
                  <p className="font-mono text-white">{selectedDsa.ifsc}</p>
                </div>
              </div>
            </div>

            {/* Verification actions */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-white">Bank Verification Control</span>
                <p className="text-white/50 text-[11px]">
                  Authorized finance checkers can verify or flag partner accounts before disbursement.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedDsa.bankVerificationStatus !== "VERIFIED" && (
                  <button
                    onClick={() => toggleVerificationStatus(selectedDsa, "VERIFIED")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                  >
                    Mark Verified
                  </button>
                )}
                {selectedDsa.bankVerificationStatus !== "FLAGGED" && (
                  <button
                    onClick={() => toggleVerificationStatus(selectedDsa, "FLAGGED")}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition"
                  >
                    Flag Account
                  </button>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAuditModal(true);
                }}
                className="flex items-center gap-1.5 text-xs text-purple-300 hover:text-purple-200 font-semibold"
              >
                <History className="w-4 h-4" />
                <span>View Bank Audit Trail ({selectedDsa.bankAuditHistory?.length || 0} modifications)</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedDsa);
                    setSelectedDsa(null);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setSelectedDsa(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Detail Audit Trail Modal */}
      {showAuditModal && selectedDsa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Immutable Bank Detail Audit Log
                </h3>
                <p className="text-xs text-white/50">
                  {selectedDsa.name} ({selectedDsa.dsaCode}) • Complete historical account record modifications
                </p>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(!selectedDsa.bankAuditHistory || selectedDsa.bankAuditHistory.length === 0) ? (
              <div className="py-12 text-center text-white/40 text-xs">
                No bank modifications recorded. Original verified account created at partner empanelment.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDsa.bankAuditHistory.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/40">{audit.timestamp}</span>
                      <span className="font-bold text-purple-300">Modified by: {audit.changedBy} ({audit.changedByRole})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-black/30 font-mono text-[11px]">
                      <div>
                        <span className="text-rose-400 font-bold block">Previous Account:</span>
                        <div className="text-white/70">{audit.previousBank}</div>
                        <div className="text-white/90 font-semibold">{audit.previousAccount}</div>
                        <div className="text-white/50">{audit.previousIfsc}</div>
                      </div>
                      <div>
                        <span className="text-emerald-400 font-bold block">New Account:</span>
                        <div className="text-white/70">{audit.newBank}</div>
                        <div className="text-white font-bold">{audit.newAccount}</div>
                        <div className="text-white/90">{audit.newIfsc}</div>
                      </div>
                    </div>

                    <div className="text-white/70 text-[11px]">
                      <span className="text-white/40">Audit Reason: </span>
                      {audit.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close Audit History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit DSA Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  {showAddModal ? "Empanel New Channel Partner / DSA" : `Edit Partner: ${formData.name}`}
                </h3>
                <p className="text-xs text-white/50">
                  Fill in official partner registration, legal credentials, and settlement bank accounts.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleSaveAdd : handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">DSA Partner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. ABC Finance"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">DSA Code (Identifier) *</label>
                  <input
                    type="text"
                    required
                    value={formData.dsaCode || ""}
                    onChange={(e) => setFormData({ ...formData, dsaCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. ABC-FIN"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white uppercase focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Legal Registered Entity Name</label>
                  <input
                    type="text"
                    value={formData.legalName || ""}
                    onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                    placeholder="e.g. ABC Financial Advisory Services LLP"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Operating Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
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
                  <label className="block text-white/70 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ""}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="e.g. Harpreet Singh Sodhi"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile || ""}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98140 00000"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="partner@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">PAN Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.pan || ""}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                    placeholder="e.g. AAAFB1928K"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white uppercase focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Settlement Banking Section */}
              <div className="pt-2 border-t border-white/10">
                <span className="font-bold text-emerald-300 text-xs uppercase tracking-wider block mb-2">
                  Settlement Bank Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.bankName || ""}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. HDFC Bank"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountHolderName || ""}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="e.g. ABC Financial Advisory Services LLP"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Account Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber || ""}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="e.g. 50200039281260"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 font-semibold mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      required
                      value={formData.ifsc || ""}
                      onChange={(e) => setFormData({ ...formData, ifsc: e.target.value.toUpperCase() })}
                      placeholder="e.g. HDFC0000034"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white uppercase font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              </div>

              {/* If editing and bank details changed, prompt for audit reason */}
              {showEditModal && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <label className="block text-amber-300 font-bold text-xs">
                    Audit Note / Change Reason (Required if banking details were edited)
                  </label>
                  <input
                    type="text"
                    value={bankChangeReason}
                    onChange={(e) => setBankChangeReason(e.target.value)}
                    placeholder="e.g. Updated to newly registered corporate current account after LLP transition"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-white/70 font-semibold mb-1">Commission Scheme</label>
                  <input
                    type="text"
                    value={formData.commissionScheme || ""}
                    onChange={(e) => setFormData({ ...formData, commissionScheme: e.target.value })}
                    placeholder="e.g. Tier-1 Gold Channel Partner"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Operational Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DSAStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_HOLD">ON HOLD</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition"
                >
                  {showAddModal ? "Empanel Partner" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
