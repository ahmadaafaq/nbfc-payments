import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  History,
  X,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  Sliders,
  DollarSign,
  Lock,
  Unlock,
  Eye,
  FileCheck,
  Send,
  Layers,
  ChevronRight,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import {
  CommissionPayable,
  CommissionPayableStatus,
  CommissionAdjustment,
  LoanProductType,
  DSAPartner,
} from "../../../types";

interface CommissionPayablesViewProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const CommissionPayablesView: React.FC<CommissionPayablesViewProps> = ({ onNavigate }) => {
  const [payables, setPayables] = useState<CommissionPayable[]>(StorageService.getCommissionPayables());
  const [dsas] = useState<DSAPartner[]>(StorageService.getDSAs());
  const branches = StorageService.getBranches();
  const currentUser = StorageService.getCurrentUser();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedDsa, setSelectedDsa] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");

  // Selection for batch actions
  const [selectedPayableIds, setSelectedPayableIds] = useState<string[]>([]);

  // Modals & Drawers
  const [selectedPayable, setSelectedPayable] = useState<CommissionPayable | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [holdActionType, setHoldActionType] = useState<"HOLD" | "RELEASE">("HOLD");
  const [holdReason, setHoldReason] = useState("");

  // Adjustment Form
  const [adjType, setAdjType] = useState<"TDS" | "RECOVERY" | "ADVANCE_ADJUSTMENT" | "BONUS" | "MANUAL_DEDUCTION">("RECOVERY");
  const [adjAmount, setAdjAmount] = useState<number>(500);
  const [adjDescription, setAdjDescription] = useState("");

  // Generated payment alert
  const [generatedPaymentAlert, setGeneratedPaymentAlert] = useState<{
    paymentId: string;
    dsaName: string;
    amount: number;
  } | null>(null);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setPayables(StorageService.getCommissionPayables());
    });
    return unsub;
  }, []);

  const filteredPayables = payables.filter((p) => {
    const matchesSearch =
      (p.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.fileId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customerReference || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dsaName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.dsaCode && p.dsaCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch = selectedBranch === "ALL" || p.branchId === selectedBranch;
    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    const matchesDsa = selectedDsa === "ALL" || p.dsaId === selectedDsa;
    const matchesProduct = selectedProduct === "ALL" || p.product === selectedProduct;

    return matchesSearch && matchesBranch && matchesStatus && matchesDsa && matchesProduct;
  });

  // Metrics
  const totalNet = payables.reduce((s, p) => s + (p.netPayable || 0), 0);
  const readyList = payables.filter((p) => p.status === "READY_FOR_PAYOUT");
  const readyTotal = readyList.reduce((s, p) => s + (p.netPayable || 0), 0);
  const holdList = payables.filter((p) => p.status === "ON_HOLD");
  const holdTotal = holdList.reduce((s, p) => s + (p.netPayable || 0), 0);
  const dispatchedList = payables.filter((p) => p.status === "PAYMENT_GENERATED" || p.status === "DISBURSED");
  const dispatchedTotal = dispatchedList.reduce((s, p) => s + (p.netPayable || 0), 0);

  // Single Payment Generation (Phase 2 -> Phase 1 Link)
  const handleGeneratePayment = (payable: CommissionPayable) => {
    try {
      const paymentId = StorageService.generatePaymentFromCommissionPayable(payable.id);
      setGeneratedPaymentAlert({
        paymentId,
        dsaName: payable.dsaName,
        amount: payable.netPayable,
      });
      if (selectedPayable?.id === payable.id) {
        const updated = StorageService.getCommissionPayableById(payable.id);
        if (updated) setSelectedPayable(updated);
      }
    } catch (err: any) {
      alert(`Payment Generation Error: ${err.message}`);
    }
  };

  // Batch Payment Generation
  const handleBatchGenerate = () => {
    const eligibleIds = selectedPayableIds.filter((id) => {
      const p = payables.find((item) => item.id === id);
      return p && p.status === "READY_FOR_PAYOUT";
    });

    if (eligibleIds.length === 0) {
      alert("Please select payables in 'READY_FOR_PAYOUT' status.");
      return;
    }

    if (
      !window.confirm(
        `Generate Phase 1 payment requests for ${eligibleIds.length} commission payables? Each will attach an automated voucher and enter the Maker-Checker queue.`
      )
    ) {
      return;
    }

    let count = 0;
    eligibleIds.forEach((id) => {
      try {
        StorageService.generatePaymentFromCommissionPayable(id);
        count++;
      } catch (err) {
        console.error("Batch error on payable:", id, err);
      }
    });

    setSelectedPayableIds([]);
    alert(`Successfully generated ${count} payments into Phase 1 Checker Queue!`);
  };

  // Hold / Release Handlers
  const handleOpenHoldModal = (payable: CommissionPayable, action: "HOLD" | "RELEASE") => {
    setSelectedPayable(payable);
    setHoldActionType(action);
    setHoldReason(action === "HOLD" ? "Pending partner KYC renewal & PAN re-verification" : "Partner provided updated GST certificate and cleared audit");
    setShowHoldModal(true);
  };

  const handleSaveHoldAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;
    if (!holdReason.trim()) {
      alert("Compliance requires a documented reason for placing or releasing a commission hold.");
      return;
    }

    if (holdActionType === "HOLD") {
      StorageService.holdCommissionPayable(selectedPayable.id, holdReason);
    } else {
      StorageService.releaseCommissionPayable(selectedPayable.id, holdReason);
    }

    setShowHoldModal(false);
    const updated = StorageService.getCommissionPayableById(selectedPayable.id);
    if (updated) setSelectedPayable(updated);
  };

  // Adjustment Handlers
  const handleOpenAdjustment = (payable: CommissionPayable) => {
    setSelectedPayable(payable);
    setAdjType("RECOVERY");
    setAdjAmount(500);
    setAdjDescription("Recovery for past customer loan pre-closure within 90 days");
    setShowAdjustmentModal(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayable) return;
    if (adjAmount <= 0) {
      alert("Adjustment amount must be greater than zero.");
      return;
    }

    const adjustment: CommissionAdjustment = {
      id: `ADJ-${Date.now().toString().slice(-4)}`,
      type: adjType,
      amount: Number(adjAmount),
      description: adjDescription || "Finance audit manual adjustment",
      appliedBy: currentUser.name,
      appliedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    StorageService.addCommissionAdjustment(selectedPayable.id, adjustment);
    setShowAdjustmentModal(false);
    const updated = StorageService.getCommissionPayableById(selectedPayable.id);
    if (updated) setSelectedPayable(updated);
  };

  // Select all checkbox
  const handleToggleSelectAll = () => {
    if (selectedPayableIds.length === filteredPayables.length) {
      setSelectedPayableIds([]);
    } else {
      setSelectedPayableIds(filteredPayables.map((p) => p.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    if (selectedPayableIds.includes(id)) {
      setSelectedPayableIds(selectedPayableIds.filter((item) => item !== id));
    } else {
      setSelectedPayableIds([...selectedPayableIds, id]);
    }
  };

  const getStatusBadge = (status: CommissionPayableStatus) => {
    switch (status) {
      case "READY_FOR_PAYOUT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            READY FOR PAYOUT
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Lock className="w-3 h-3" />
            ON HOLD
          </span>
        );
      case "PAYMENT_GENERATED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Send className="w-3 h-3" />
            CHECKER QUEUED
          </span>
        );
      case "DISBURSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            DISBURSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-purple-400" />
              Commission Payables &amp; Hold Desk
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {payables.length} Payables
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Reconcile calculated payouts, place/release partner holds, inject TDS/recovery adjustments, and trigger Phase 1 bank disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedPayableIds.length > 0 && (
            <button
              onClick={handleBatchGenerate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/30 transition border border-white/20 active:scale-95 animate-in fade-in"
            >
              <Send className="w-4 h-4" />
              <span>Batch Generate ({selectedPayableIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Direct Success Banner when Payment is Generated */}
      {generatedPaymentAlert && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-emerald-900/60 border border-white/20 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-300 border border-purple-400/30 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-white text-sm">
                  {generatedPaymentAlert.paymentId}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PHASE 1 CREATED
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Commission voucher generated for <strong className="text-white">{generatedPaymentAlert.dsaName}</strong> (₹{generatedPaymentAlert.amount.toLocaleString("en-IN")}) and routed to Checker Queue with AI verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onNavigate && (
              <button
                onClick={() =>
                  onNavigate("checker-review", { paymentId: generatedPaymentAlert.paymentId })
                }
                className="px-4 py-2 rounded-xl bg-white text-purple-950 hover:bg-purple-50 font-black text-xs transition shadow flex items-center gap-1.5"
              >
                <span>Open Checker Review Desk</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setGeneratedPaymentAlert(null)}
              className="p-1.5 rounded-lg text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
            Total Commission Payables
          </span>
          <div className="text-xl font-black text-white font-mono">
            ₹{totalNet.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-white/50">{payables.length} Partner payout vouchers</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-emerald-400/70 uppercase tracking-wider">
            Ready for Payout
          </span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            ₹{readyTotal.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-300/70">{readyList.length} Clean accounts approved for release</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-amber-400/70 uppercase tracking-wider">
            On Hold / Compliance Lock
          </span>
          <div className="text-xl font-black text-amber-400 font-mono">
            ₹{holdTotal.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-amber-300/70">{holdList.length} Under audit or document review</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[11px] font-bold text-purple-400/70 uppercase tracking-wider">
            Dispatched to Phase 1
          </span>
          <div className="text-xl font-black text-purple-300 font-mono">
            ₹{dispatchedTotal.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-purple-200/70">{dispatchedList.length} Sent to Maker-Checker queue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Payable ID, File, DSA..."
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
            <option value="READY_FOR_PAYOUT" className="bg-slate-900">Ready for Payout</option>
            <option value="ON_HOLD" className="bg-slate-900">On Hold</option>
            <option value="PAYMENT_GENERATED" className="bg-slate-900">Checker Queued</option>
            <option value="DISBURSED" className="bg-slate-900">Disbursed</option>
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
            <option value="LOAN_AGAINST_PROPERTY" className="bg-slate-900">Loan Against Property</option>
            <option value="MICRO_ENTERPRISE_LOAN" className="bg-slate-900">Micro Enterprise Loan</option>
          </select>
        </div>
      </div>

      {/* Payables Table */}
      <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-[11px] uppercase tracking-wider text-white/40 font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredPayables.length > 0 &&
                      selectedPayableIds.length === filteredPayables.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                </th>
                <th className="py-3 px-4">Payable Reference</th>
                <th className="py-3 px-4">Channel Partner</th>
                <th className="py-3 px-4">Customer Account</th>
                <th className="py-3 px-4 text-right">Loan Volume</th>
                <th className="py-3 px-4 text-center">Rule &amp; Rate</th>
                <th className="py-3 px-4 text-right">Net Payable</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayables.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-white/40">
                    No commission payables matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredPayables.map((p) => {
                  const isSelected = selectedPayableIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-white/[0.04] transition ${
                        isSelected ? "bg-purple-900/15" : ""
                      }`}
                    >
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(p.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{p.id}</span>
                        </div>
                        <div className="text-[10px] text-white/40">{p.fileId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{p.dsaName}</div>
                        <div className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                          <span>{p.dsaCode}</span>
                          <span>•</span>
                          <span>{p.branchName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white/90">{p.customerReference}</div>
                        <div className="text-[10px] text-white/40">{(p.product || "").replace(/_/g, " ")}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        ₹{(p.disbursalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          {(p.appliedRatePercentage ?? 0).toFixed(2)}%
                        </span>
                        <div className="text-[9px] text-white/40 mt-0.5 font-sans">v{p.commissionRuleVersion || 1}</div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <div className="font-black text-emerald-400 text-sm">
                          ₹{(p.netPayable || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="text-[10px] text-white/40">
                          TDS: ₹{(p.tdsAmount || 0).toLocaleString("en-IN")}
                        </div>
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(p.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Hold / Release button */}
                          {p.status === "ON_HOLD" ? (
                            <button
                              onClick={() => handleOpenHoldModal(p, "RELEASE")}
                              className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition"
                              title="Release Hold"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : p.status === "READY_FOR_PAYOUT" ? (
                            <button
                              onClick={() => handleOpenHoldModal(p, "HOLD")}
                              className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/20 transition"
                              title="Place on Hold"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          ) : null}

                          {/* Adjustment button */}
                          <button
                            onClick={() => handleOpenAdjustment(p)}
                            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
                            title="Add Adjustment / Deduction"
                          >
                            <Sliders className="w-3.5 h-3.5 text-blue-300" />
                          </button>

                          {/* Generate Payment Button (Phase 2 -> Phase 1) */}
                          {p.status === "READY_FOR_PAYOUT" && (
                            <button
                              onClick={() => handleGeneratePayment(p)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white transition shadow border border-white/15 active:scale-95 flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Pay</span>
                            </button>
                          )}

                          {p.status === "PAYMENT_GENERATED" && p.paymentId && onNavigate && (
                            <button
                              onClick={() => onNavigate("checker-review", { paymentId: p.paymentId })}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition border border-purple-400/30 flex items-center gap-1"
                            >
                              <span>View Checker</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}

                          {/* Detailed Sheet */}
                          <button
                            onClick={() => {
                              setSelectedPayable(p);
                              setShowDetailDrawer(true);
                            }}
                            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
                            title="View Full Calculation Breakdown"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

      {/* Detailed Calculation Drawer */}
      {showDetailDrawer && selectedPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30 font-bold">
                    {selectedPayable.id}
                  </span>
                  <h3 className="text-base font-black text-white">Commission Payout Breakdown Sheet</h3>
                </div>
                <p className="text-xs text-white/50 mt-0.5">
                  File ID: {selectedPayable.fileId} • Customer: {selectedPayable.customerReference}
                </p>
              </div>
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Partner & Bank overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">
                  Beneficiary Channel Partner
                </span>
                <div className="font-bold text-white text-sm">{selectedPayable.dsaName}</div>
                <div className="text-white/60">Partner Code: <span className="font-mono text-white">{selectedPayable.dsaCode}</span></div>
                <div className="text-white/60">Registered Branch: <span className="text-white">{selectedPayable.branchName}</span></div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                  Disbursal Source
                </span>
                <div className="text-white/60">Product: <span className="font-bold text-white">{selectedPayable.product}</span></div>
                <div className="text-white/60">Loan Amount: <span className="font-mono font-bold text-white">₹{selectedPayable.disbursalAmount.toLocaleString("en-IN")}</span></div>
                <div className="text-white/60">Rule: <span className="font-mono text-purple-300">{selectedPayable.commissionRuleId} (v{selectedPayable.commissionRuleVersion})</span></div>
              </div>
            </div>

            {/* Financial Ledger Math */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-white/80">
                <span>Disbursed Loan Volume</span>
                <span className="text-white font-bold">₹{selectedPayable.disbursalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Applied Tier Rate</span>
                <span className="text-emerald-400 font-bold">{selectedPayable.appliedRatePercentage.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-white">
                <span>Gross Commission</span>
                <span className="font-black text-sm">₹{selectedPayable.grossCommission.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>TDS Retention (Sec 194H @ 5.00%)</span>
                <span>-₹{selectedPayable.tdsAmount.toLocaleString("en-IN")}</span>
              </div>

              {/* Adjustments */}
              {selectedPayable.adjustments && selectedPayable.adjustments.length > 0 && (
                <div className="border-t border-white/10 pt-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-white/40">Custom Adjustments:</span>
                  {selectedPayable.adjustments.map((a) => (
                    <div key={a.id} className="flex justify-between text-amber-300 text-[11px]">
                      <span>{a.description} ({a.type})</span>
                      <span>
                        {a.type === "BONUS" ? "+" : "-"}₹{a.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between border-t border-white/20 pt-2.5 text-sm font-sans font-black text-emerald-400">
                <span>Net Payable Amount</span>
                <span className="font-mono text-base">₹{selectedPayable.netPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Hold reason if held */}
            {selectedPayable.status === "ON_HOLD" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" />
                  <span>Account Currently on Compliance Hold</span>
                </div>
                <p className="text-[11px] text-amber-200/90">&ldquo;{selectedPayable.holdReason}&rdquo;</p>
              </div>
            )}

            {/* Audit Trail */}
            <div>
              <span className="font-bold text-[11px] text-white/40 uppercase tracking-wider block mb-2">
                Payable Audit Trail ({selectedPayable.auditTrail?.length || 0} events)
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {selectedPayable.auditTrail?.map((aud) => (
                  <div key={aud.id} className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] flex justify-between">
                    <div>
                      <span className="font-semibold text-white">{aud.action.replace(/_/g, " ")}</span>
                      <div className="text-[10px] text-white/40">{aud.notes}</div>
                    </div>
                    <span className="text-white/40 font-mono text-[10px]">{aud.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                {selectedPayable.status === "READY_FOR_PAYOUT" && (
                  <button
                    onClick={() => {
                      handleGeneratePayment(selectedPayable);
                      setShowDetailDrawer(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition"
                  >
                    Generate Phase 1 Disbursement
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowDetailDrawer(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place / Release Hold Modal */}
      {showHoldModal && selectedPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {holdActionType === "HOLD" ? (
                  <Lock className="w-5 h-5 text-amber-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-emerald-400" />
                )}
                <h3 className="text-base font-black text-white">
                  {holdActionType === "HOLD" ? "Place Payout on Compliance Hold" : "Release Commission Hold"}
                </h3>
              </div>
              <button onClick={() => setShowHoldModal(false)} className="p-1 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHoldAction} className="space-y-3 text-xs">
              <p className="text-white/60">
                {holdActionType === "HOLD"
                  ? "Prevent automated payment generation for this payable until partner issues are verified."
                  : "Release this held payable back into active 'READY_FOR_PAYOUT' status."}
              </p>

              <div>
                <label className="block text-white/70 font-semibold mb-1">
                  Reason for {holdActionType === "HOLD" ? "Holding" : "Releasing"} *
                </label>
                <textarea
                  rows={3}
                  required
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowHoldModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 rounded-xl font-bold text-white shadow ${
                    holdActionType === "HOLD"
                      ? "bg-amber-600 hover:bg-amber-500"
                      : "bg-emerald-600 hover:bg-emerald-500"
                  }`}
                >
                  Confirm {holdActionType === "HOLD" ? "Hold" : "Release"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Adjustment Modal */}
      {showAdjustmentModal && selectedPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-black text-white">Add Payout Adjustment</h3>
              </div>
              <button onClick={() => setShowAdjustmentModal(false)} className="p-1 text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="RECOVERY">Recovery (Loan Pre-Closure / Clawback)</option>
                  <option value="ADVANCE_ADJUSTMENT">Advance Commission Adjustment</option>
                  <option value="BONUS">Quarterly Target Bonus (+)</option>
                  <option value="MANUAL_DEDUCTION">Administrative Deduction</option>
                  <option value="TDS">Additional TDS Surcharge</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Adjustment Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="50"
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Audit Justification / Note *</label>
                <input
                  type="text"
                  required
                  value={adjDescription}
                  onChange={(e) => setAdjDescription(e.target.value)}
                  placeholder="e.g. Account pre-settled in under 90 days as per contract clause 4"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdjustmentModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
