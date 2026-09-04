import React, { useState, useEffect } from "react";
import {
  Percent,
  Search,
  Plus,
  Building2,
  Calendar,
  Layers,
  History,
  X,
  Edit2,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  Calculator,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import {
  CommissionRule,
  CommissionSlab,
  CommissionRuleType,
  LoanProductType,
  DSAPartner,
} from "../../../types";

interface CommissionRulesViewProps {
  onNavigate?: (view: string, params?: any) => void;
}

export const CommissionRulesView: React.FC<CommissionRulesViewProps> = () => {
  const [rules, setRules] = useState<CommissionRule[]>(StorageService.getCommissionRules());
  const [dsas] = useState<DSAPartner[]>(StorageService.getDSAs());
  const branches = StorageService.getBranches();
  const currentUser = StorageService.getCurrentUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // View state for modals
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CommissionRule>>({
    name: "",
    product: "BUSINESS_LOAN",
    ruleType: "PRODUCT_SPECIFIC",
    branchId: undefined,
    dsaId: undefined,
    effectiveFrom: new Date().toISOString().split("T")[0],
    slabs: [
      { minAmount: 0, maxAmount: 1000000, ratePercentage: 1.25 },
      { minAmount: 1000000, maxAmount: 2500000, ratePercentage: 1.5 },
      { minAmount: 2500000, maxAmount: null, ratePercentage: 1.75 },
    ],
    changeReason: "",
    status: "ACTIVE",
  });
  const [ruleEditReason, setRuleEditReason] = useState("");

  // Simulator State
  const [simDsaId, setSimDsaId] = useState<string>(dsas[0]?.id || "");
  const [simProduct, setSimProduct] = useState<LoanProductType>("BUSINESS_LOAN");
  const [simAmount, setSimAmount] = useState<number>(1500000);
  const [simBranchId, setSimBranchId] = useState<string>(branches[0]?.id || "");
  const [simResult, setSimResult] = useState<any>(null);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setRules(StorageService.getCommissionRules());
    });
    return unsub;
  }, []);

  // Run simulation whenever simulator inputs change
  useEffect(() => {
    if (showSimulator && simAmount > 0) {
      handleRunSimulation();
    }
  }, [simDsaId, simProduct, simAmount, simBranchId, showSimulator]);

  const handleRunSimulation = () => {
    const selectedDsaObj = dsas.find((d) => d.id === simDsaId);
    const result = StorageService.calculateCommission({
      loanAmount: Number(simAmount) || 0,
      product: simProduct,
      dsaId: simDsaId,
      branchId: simBranchId,
      disbursalDate: new Date().toISOString().split("T")[0],
    });

    setSimResult({
      ...result,
      dsaName: selectedDsaObj?.name || "Selected DSA",
    });
  };

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.dsaName && r.dsaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.branchName && r.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProduct = selectedProduct === "ALL" || r.product === selectedProduct;
    const matchesType = selectedType === "ALL" || r.ruleType === selectedType;
    const matchesStatus = selectedStatus === "ALL" || r.status === selectedStatus;

    return matchesSearch && matchesProduct && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "New Commission Scheme",
      product: "BUSINESS_LOAN",
      ruleType: "PRODUCT_SPECIFIC",
      branchId: undefined,
      dsaId: undefined,
      effectiveFrom: new Date().toISOString().split("T")[0],
      slabs: [
        { minAmount: 0, maxAmount: 1000000, ratePercentage: 1.25 },
        { minAmount: 1000000, maxAmount: 2500000, ratePercentage: 1.5 },
        { minAmount: 2500000, maxAmount: null, ratePercentage: 1.75 },
      ],
      changeReason: "Initial version created",
      status: "ACTIVE",
    });
    setShowAddModal(true);
  };

  const getRuleSlabs = (rule: CommissionRule): CommissionSlab[] => {
    if (rule.slabs && rule.slabs.length > 0) {
      return rule.slabs;
    }
    return [
      {
        minAmount: rule.slabMin ?? 0,
        maxAmount: rule.slabMax ?? Infinity,
        commissionPercentage: rule.commissionPercentage ?? 1.0,
        ratePercentage: rule.commissionPercentage ?? 1.0,
      },
    ];
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
    return map[p] || (p ? p.replace(/_/g, " ") : "All Products");
  };

  const getTypeBadge = (type: CommissionRuleType | string) => {
    switch (type) {
      case "DSA_SPECIFIC":
        return {
          label: "DSA OVERRIDE (P1)",
          style: "bg-purple-500/20 text-purple-200 border-purple-400/30 font-bold",
        };
      case "BRANCH_SPECIFIC":
        return {
          label: "BRANCH (P2)",
          style: "bg-blue-500/20 text-blue-200 border-blue-400/30 font-bold",
        };
      case "PRODUCT_SPECIFIC":
        return {
          label: "PRODUCT (P3)",
          style: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30 font-bold",
        };
      case "GLOBAL_FALLBACK":
      case "GLOBAL":
      default:
        return {
          label: "FALLBACK (P4)",
          style: "bg-slate-500/20 text-slate-200 border-slate-400/30 font-bold",
        };
    }
  };

  const handleOpenEdit = (rule: CommissionRule) => {
    const slabs = getRuleSlabs(rule);
    setFormData({
      ...rule,
      slabs: slabs.map((s) => ({ ...s })),
    });
    setRuleEditReason("");
    setShowEditModal(true);
  };

  const handleCloneRule = (rule: CommissionRule) => {
    const slabs = getRuleSlabs(rule);
    setFormData({
      ...rule,
      id: undefined,
      name: `${rule.name} (Copy)`,
      version: 1,
      effectiveFrom: new Date().toISOString().split("T")[0],
      effectiveTo: undefined,
      slabs: slabs.map((s) => ({ ...s })),
      changeReason: `Cloned from ${rule.name} (v${rule.version})`,
      versionHistory: [],
    });
    setShowAddModal(true);
  };

  const handleAddSlab = () => {
    const slabs = formData.slabs || [];
    const lastSlab = slabs[slabs.length - 1];
    const newMin = lastSlab ? (lastSlab.maxAmount || lastSlab.minAmount + 1000000) : 0;
    const newSlabs = [...slabs, { minAmount: newMin, maxAmount: null, ratePercentage: 1.0 }];
    setFormData({ ...formData, slabs: newSlabs });
  };

  const handleRemoveSlab = (index: number) => {
    const slabs = formData.slabs || [];
    if (slabs.length <= 1) {
      alert("A rule must have at least one valid commission slab.");
      return;
    }
    const updated = slabs.filter((_, i) => i !== index);
    setFormData({ ...formData, slabs: updated });
  };

  const handleSlabChange = (index: number, field: keyof CommissionSlab, value: any) => {
    const slabs = formData.slabs ? [...formData.slabs] : [];
    if (!slabs[index]) return;

    slabs[index] = {
      ...slabs[index],
      [field]: value === "" || value === null ? null : Number(value),
    };
    setFormData({ ...formData, slabs });
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slabs || formData.slabs.length === 0) {
      alert("Please provide a valid scheme name and at least one commission slab.");
      return;
    }

    // Determine priority
    let priority = 10;
    if (formData.ruleType === "DSA_SPECIFIC") priority = 1;
    else if (formData.ruleType === "BRANCH_SPECIFIC") priority = 2;
    else if (formData.ruleType === "PRODUCT_SPECIFIC") priority = 3;
    else priority = 4;

    const matchedDsa = dsas.find((d) => d.id === formData.dsaId);
    const matchedBranch = branches.find((b) => b.id === formData.branchId);

    const newRule: CommissionRule = {
      id: `RULE-${formData.product?.slice(0, 3)}-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      product: formData.product || "BUSINESS_LOAN",
      ruleType: formData.ruleType || "PRODUCT_SPECIFIC",
      priority,
      branchId: formData.branchId,
      branchName: matchedBranch?.name,
      dsaId: formData.dsaId,
      dsaName: matchedDsa?.name,
      effectiveFrom: formData.effectiveFrom || new Date().toISOString().split("T")[0],
      effectiveTo: formData.effectiveTo,
      version: 1,
      changeReason: formData.changeReason || "Initial creation",
      status: formData.status || "ACTIVE",
      slabs: formData.slabs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      versionHistory: [
        {
          version: 1,
          effectiveFrom: formData.effectiveFrom || new Date().toISOString().split("T")[0],
          changeReason: formData.changeReason || "Initial rule version created",
          changedBy: currentUser.name,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          slabs: formData.slabs,
        },
      ],
    };

    StorageService.addCommissionRule(newRule);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.slabs) return;

    if (!ruleEditReason.trim()) {
      alert("Please enter a documented reason for this rule/slab version update.");
      return;
    }

    const existing = rules.find((r) => r.id === formData.id);
    if (!existing) return;

    const matchedDsa = dsas.find((d) => d.id === formData.dsaId);
    const matchedBranch = branches.find((b) => b.id === formData.branchId);

    const newVersion = existing.version + 1;
    const historyItem = {
      version: newVersion,
      effectiveFrom: formData.effectiveFrom || new Date().toISOString().split("T")[0],
      effectiveTo: formData.effectiveTo,
      changeReason: ruleEditReason,
      changedBy: currentUser.name,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      slabs: formData.slabs,
    };

    const updated: CommissionRule = {
      ...existing,
      ...formData,
      version: newVersion,
      changeReason: ruleEditReason,
      branchName: matchedBranch?.name,
      dsaName: matchedDsa?.name,
      updatedAt: new Date().toISOString(),
      versionHistory: [historyItem, ...(existing.versionHistory || [])],
    };

    StorageService.updateCommissionRule(updated);
    setShowEditModal(false);
    if (selectedRule?.id === updated.id) {
      setSelectedRule(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Percent className="w-6 h-6 text-purple-400" />
              Commission Schemes &amp; Slabs Versioning
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              {rules.length} Rules Defined
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Dynamic tiered commission calculation engine with multi-level priority (DSA Override &gt; Branch &gt; Product &gt; Global Fallback) and immutable version changelogs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSimulator(true);
              handleRunSimulation();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-400/30 transition backdrop-blur-md active:scale-95"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Test Calculator</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30 transition border border-white/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Scheme</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search scheme, product, partner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/60 transition"
            />
          </div>

          {/* Product Filter */}
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

          {/* Rule Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
          >
            <option value="ALL" className="bg-slate-900">All Rule Priority Types</option>
            <option value="DSA_SPECIFIC" className="bg-slate-900">DSA Specific Override (P1)</option>
            <option value="BRANCH_SPECIFIC" className="bg-slate-900">Branch Specific (P2)</option>
            <option value="PRODUCT_SPECIFIC" className="bg-slate-900">Product Specific (P3)</option>
            <option value="GLOBAL_FALLBACK" className="bg-slate-900">Global Fallback (P4)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400/60 transition"
          >
            <option value="ALL" className="bg-slate-900">All Statuses</option>
            <option value="ACTIVE" className="bg-slate-900">Active Only</option>
            <option value="INACTIVE" className="bg-slate-900">Inactive Only</option>
          </select>
        </div>

        {/* Priority Order Explainer Banner */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/70">Engine Priority Order:</span>
            <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold">1. DSA Override</span>
            <span>&gt;</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono font-bold">2. Branch</span>
            <span>&gt;</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">3. Product</span>
            <span>&gt;</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-300 font-mono font-bold">4. Fallback</span>
          </div>
          <span>TDS Rate: Standard Section 194H @ 5.00%</span>
        </div>
      </div>

      {/* Rules List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRules.map((rule) => {
          const typeBadge = getTypeBadge(rule.ruleType);
          return (
            <div
              key={rule.id}
              className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 space-y-4 shadow-xl hover:border-white/20 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top badges */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] border mb-1.5 ${typeBadge.style}`}>
                      {typeBadge.label}
                    </span>
                    <h3 className="font-black text-sm text-white leading-snug">{rule.name}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white/10 text-purple-200 border border-white/15 shrink-0">
                    v{rule.version}
                  </span>
                </div>

                {/* Scope Metadata */}
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40">Product:</span>
                    <span className="font-bold text-white">{getProductLabel(rule.product)}</span>
                  </div>
                  {rule.dsaName && (
                    <div className="flex justify-between">
                      <span className="text-white/40">Partner Scope:</span>
                      <span className="font-semibold text-purple-300">{rule.dsaName}</span>
                    </div>
                  )}
                  {rule.branchName && (
                    <div className="flex justify-between">
                      <span className="text-white/40">Branch Scope:</span>
                      <span className="font-semibold text-blue-300">{rule.branchName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/40">Effective Since:</span>
                    <span className="font-mono text-white/70">{rule.effectiveFrom}</span>
                  </div>
                </div>

                {/* Slabs breakdown */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Disbursal Volume Slabs &amp; Rates
                  </div>
                  <div className="space-y-1">
                    {getRuleSlabs(rule).map((slab, idx) => {
                      const rate = slab.ratePercentage ?? slab.commissionPercentage ?? 0;
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-mono"
                        >
                          <span className="text-white/70">
                            ₹{(slab.minAmount / 100000).toFixed(1)}L -{" "}
                            {slab.maxAmount && slab.maxAmount < 100000000 ? `₹${(slab.maxAmount / 100000).toFixed(1)}L` : "Above"}
                          </span>
                          <span className="font-bold text-emerald-400 text-xs px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                            {rate.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Last change note */}
                <div className="text-[11px] text-white/50 italic bg-white/[0.02] p-2 rounded-lg border border-white/5">
                  &ldquo;{rule.changeReason || "Active production scheme"}&rdquo;
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <button
                  onClick={() => {
                    setSelectedRule(rule);
                    setShowHistoryModal(true);
                  }}
                  className="flex items-center gap-1 text-purple-300 hover:text-purple-200 font-semibold"
                  title="View Version History"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>v{rule.version} History</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCloneRule(rule)}
                    className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
                    title="Clone Scheme"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-300" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(rule)}
                    className="px-2.5 py-1 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/15"
                  >
                    Edit &amp; Bump
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Test Calculator / Simulator Modal */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Commission Simulation &amp; Priority Test Bench</h3>
                  <p className="text-xs text-white/50">
                    Verify how loan disbursals match against priority rules, slab thresholds, and Section 194H TDS.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulator(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-white/70 font-semibold mb-1">Select Channel Partner</label>
                <select
                  value={simDsaId}
                  onChange={(e) => setSimDsaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                >
                  {dsas.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.dsaCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Loan Product</label>
                <select
                  value={simProduct}
                  onChange={(e) => setSimProduct(e.target.value as LoanProductType)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="BUSINESS_LOAN">Business Loan</option>
                  <option value="PERSONAL_LOAN">Personal Loan</option>
                  <option value="LOAN_AGAINST_PROPERTY">Loan Against Property (LAP)</option>
                  <option value="MICRO_ENTERPRISE_LOAN">Micro Enterprise Loan</option>
                  <option value="USED_CAR_LOAN">Used Car Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Disbursed Loan Amount (₹)</label>
                <input
                  type="number"
                  step="50000"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  placeholder="e.g. 1500000"
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-white/70 font-semibold mb-1">Operating Branch</label>
                <select
                  value={simBranchId}
                  onChange={(e) => setSimBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-emerald-400"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Card */}
            {simResult && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900 to-blue-900/30 border border-white/15 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white">Rule Evaluation Result</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-purple-200 border border-white/15">
                    {simResult.appliedRuleName} (v{simResult.appliedRuleVersion})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">Applied Slab Rate</span>
                    <span className="font-black text-base text-emerald-400 font-mono">
                      {simResult.appliedRatePercentage.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">Gross Commission</span>
                    <span className="font-bold text-sm text-white font-mono">
                      ₹{simResult.grossCommission.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-white/40 block text-[10px]">TDS (Sec 194H @ 5%)</span>
                    <span className="font-bold text-sm text-rose-400 font-mono">
                      -₹{simResult.tdsAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                    <span className="text-emerald-300 block text-[10px] font-bold">Net Payout</span>
                    <span className="font-black text-base text-emerald-300 font-mono">
                      ₹{simResult.netCommission.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-white/60 bg-black/30 p-2.5 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span>Priority Type Matched:</span>
                    <span className="font-bold text-white">{simResult.ruleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calculation Formula:</span>
                    <span className="font-mono text-purple-300">
                      ₹{simAmount.toLocaleString("en-IN")} × {simResult.appliedRatePercentage}% = ₹{simResult.grossCommission.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowSimulator(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showHistoryModal && selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-purple-400" />
                  Commission Scheme Version Audit
                </h3>
                <p className="text-xs text-white/50">
                  {selectedRule.name} • {getProductLabel(selectedRule.product)}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                const historyList = selectedRule.versionHistory || [];
                const versionsList = (selectedRule.versions || []).map((v) => ({
                  version: v.version,
                  timestamp: v.changedAt,
                  changedBy: v.changedBy,
                  changeReason: v.changeReason,
                  slabs: [
                    {
                      minAmount: selectedRule.slabMin ?? 0,
                      maxAmount: selectedRule.slabMax ?? null,
                      ratePercentage: v.commissionPercentage,
                    },
                  ],
                }));
                const allRevisions = historyList.length > 0 ? historyList : versionsList;

                if (allRevisions.length === 0) {
                  return (
                    <div className="text-center py-8 text-white/40 text-xs">
                      Initial version (v{selectedRule.version || 1}) active. No previous revisions recorded.
                    </div>
                  );
                }

                return allRevisions.map((ver, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-400/30">
                          Version {ver.version}
                        </span>
                        <span className="text-white/40 text-[11px]">{ver.timestamp}</span>
                      </div>
                      <span className="text-white/70 font-semibold text-[11px]">
                        Author: {ver.changedBy}
                      </span>
                    </div>

                    <p className="text-white font-medium text-xs">
                      &ldquo;{ver.changeReason}&rdquo;
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                      {ver.slabs?.map((s: any, sIdx: number) => {
                        const rate = s.ratePercentage ?? s.commissionPercentage ?? 0;
                        return (
                          <div key={sIdx} className="p-1.5 rounded bg-black/30 border border-white/5 flex justify-between">
                            <span className="text-white/50">
                              ₹{(s.minAmount / 100000).toFixed(0)}L{s.maxAmount ? `-${(s.maxAmount / 100000).toFixed(0)}L` : "+"}
                            </span>
                            <span className="text-emerald-400 font-bold">{rate}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit / Bump Rule Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/20 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-black text-white">
                  {showAddModal ? "Create New Commission Scheme" : `Update Scheme & Bump to Version ${(formData.version || 1) + 1}`}
                </h3>
                <p className="text-xs text-white/50">
                  Configure volume slabs, percentage payout rates, and targeting priority rules.
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
                  <label className="block text-white/70 font-semibold mb-1">Scheme Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. LAP Standard Payout v2"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Loan Product *</label>
                  <select
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value as LoanProductType })}
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
                  <label className="block text-white/70 font-semibold mb-1">Rule Hierarchy Type *</label>
                  <select
                    value={formData.ruleType}
                    onChange={(e) => setFormData({ ...formData, ruleType: e.target.value as CommissionRuleType })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  >
                    <option value="PRODUCT_SPECIFIC">Product Specific (Default P3)</option>
                    <option value="DSA_SPECIFIC">DSA Specific Override (High P1)</option>
                    <option value="BRANCH_SPECIFIC">Branch Specific (Regional P2)</option>
                    <option value="GLOBAL_FALLBACK">Global Fallback (P4)</option>
                  </select>
                </div>

                {formData.ruleType === "DSA_SPECIFIC" && (
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Target DSA Partner *</label>
                    <select
                      value={formData.dsaId || ""}
                      onChange={(e) => setFormData({ ...formData, dsaId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Select Target Partner...</option>
                      {dsas.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.dsaCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.ruleType === "BRANCH_SPECIFIC" && (
                  <div>
                    <label className="block text-white/70 font-semibold mb-1">Target Branch *</label>
                    <select
                      value={formData.branchId || ""}
                      onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                    >
                      <option value="">Select Target Branch...</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-white/70 font-semibold mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={formData.effectiveFrom || ""}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Slabs Builder */}
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-300 uppercase tracking-wider">
                    Tiered Volume Slabs
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSlab}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Tier Slab</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.slabs?.map((slab, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-2"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <label className="text-[10px] text-white/40 block mb-0.5">Min Amount (₹)</label>
                        <input
                          type="number"
                          step="100000"
                          value={slab.minAmount}
                          onChange={(e) => handleSlabChange(idx, "minAmount", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                        />
                      </div>

                      <div className="flex-1 w-full sm:w-auto">
                        <label className="text-[10px] text-white/40 block mb-0.5">Max Amount (Leave blank for unbounded)</label>
                        <input
                          type="number"
                          step="100000"
                          placeholder="No upper limit"
                          value={slab.maxAmount ?? ""}
                          onChange={(e) => handleSlabChange(idx, "maxAmount", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono"
                        />
                      </div>

                      <div className="w-28">
                        <label className="text-[10px] text-white/40 block mb-0.5">Rate (%)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={slab.ratePercentage}
                          onChange={(e) => handleSlabChange(idx, "ratePercentage", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono font-bold text-emerald-400"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveSlab(idx)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition self-end sm:self-center"
                        title="Delete Slab"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision note prompt */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <label className="block text-white/80 font-semibold text-xs">
                  {showAddModal ? "Creation Notes" : "Reason for Version Revision (Audit Required) *"}
                </label>
                <input
                  type="text"
                  required={showEditModal}
                  value={showAddModal ? formData.changeReason || "" : ruleEditReason}
                  onChange={(e) => {
                    if (showAddModal) {
                      setFormData({ ...formData, changeReason: e.target.value });
                    } else {
                      setRuleEditReason(e.target.value);
                    }
                  }}
                  placeholder="e.g. Increased LAP tier 2 rate to 1.75% for festive commercial push"
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
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
                  {showAddModal ? "Create Scheme" : `Publish Version ${(formData.version || 1) + 1}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
