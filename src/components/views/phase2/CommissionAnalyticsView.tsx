import React from "react";
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Users,
  Building2,
  Award,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import { LoanProductType } from "../../../types";

export const CommissionAnalyticsView: React.FC = () => {
  const dsas = StorageService.getDSAs();
  const disbursals = StorageService.getDisbursals();
  const payables = StorageService.getCommissionPayables();
  const branches = StorageService.getBranches();

  // Total metrics
  const totalVolume = disbursals.reduce((s, d) => s + (d.disbursalAmount || 0), 0);
  const totalGross = disbursals.reduce((s, d) => s + (d.grossCommission || 0), 0);
  const totalNet = disbursals.reduce((s, d) => s + (d.netCommission || 0), 0);
  const totalTds = totalGross - totalNet;

  // Partner rankings
  const partnerMap: Record<string, { name: string; code: string; branch: string; volume: number; commission: number; count: number }> = {};
  dsas.forEach((d) => {
    partnerMap[d.id] = {
      name: d.name,
      code: d.dsaCode,
      branch: d.branchName,
      volume: 0,
      commission: 0,
      count: 0,
    };
  });

  disbursals.forEach((d) => {
    if (partnerMap[d.dsaId]) {
      partnerMap[d.dsaId].volume += d.disbursalAmount || 0;
      partnerMap[d.dsaId].commission += d.netCommission || 0;
      partnerMap[d.dsaId].count += 1;
    }
  });

  const rankedPartners = Object.values(partnerMap).sort((a, b) => b.volume - a.volume);
  const topPartner = rankedPartners[0];

  // Product Distribution
  const productVolumeMap: Record<string, { volume: number; commission: number; count: number }> = {
    BUSINESS_LOAN: { volume: 0, commission: 0, count: 0 },
    LOAN_AGAINST_PROPERTY: { volume: 0, commission: 0, count: 0 },
    PERSONAL_LOAN: { volume: 0, commission: 0, count: 0 },
    MICRO_ENTERPRISE_LOAN: { volume: 0, commission: 0, count: 0 },
    USED_CAR_LOAN: { volume: 0, commission: 0, count: 0 },
  };

  disbursals.forEach((d) => {
    if (!productVolumeMap[d.product]) {
      productVolumeMap[d.product] = { volume: 0, commission: 0, count: 0 };
    }
    productVolumeMap[d.product].volume += d.disbursalAmount || 0;
    productVolumeMap[d.product].commission += d.netCommission || 0;
    productVolumeMap[d.product].count += 1;
  });

  // Branch Performance
  const branchMap: Record<string, { name: string; volume: number; commission: number }> = {};
  branches.forEach((b) => {
    branchMap[b.id] = { name: b.name, volume: 0, commission: 0 };
  });

  disbursals.forEach((d) => {
    if (branchMap[d.branchId]) {
      branchMap[d.branchId].volume += d.disbursalAmount || 0;
      branchMap[d.branchId].commission += d.netCommission || 0;
    }
  });

  const getProductLabel = (key: string) => {
    const map: Record<string, string> = {
      BUSINESS_LOAN: "Business Loan",
      LOAN_AGAINST_PROPERTY: "Loan Against Property",
      PERSONAL_LOAN: "Personal Loan",
      MICRO_ENTERPRISE_LOAN: "Micro Enterprise Loan",
      USED_CAR_LOAN: "Used Car Loan",
      "Business Loan": "Business Loan",
      "Loan Against Property": "Loan Against Property",
      "Personal Loan": "Personal Loan",
    };
    return map[key] || (key ? key.replace(/_/g, " ") : key);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Channel Partner Commission Analytics
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
            Phase 2 Executive View
          </span>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mt-1">
          High-level volume metrics, partner tier rankings, product profitability distribution, and statutory TDS deductions.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            Total Sourced Loan Portfolio
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            ₹{(totalVolume / 10000000).toFixed(2)} Cr
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Across 3 operating hubs</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
            Net Partner Commission
          </span>
          <div className="text-xl sm:text-2xl font-black text-purple-300 font-mono">
            ₹{totalNet.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-white/50">
            Effective Payout Rate: {((totalNet / (totalVolume || 1)) * 100).toFixed(2)}%
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
            TDS Retained (Sec 194H)
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            ₹{totalTds.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-white/50">5% standard withholding</p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-1 shadow-lg">
          <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
            Top Channel Partner
          </span>
          <div className="text-lg font-black text-white truncate">
            {topPartner?.name || "ABC Finance"}
          </div>
          <p className="text-[11px] text-amber-300 font-mono font-bold">
            ₹{topPartner ? (topPartner.volume / 100000).toFixed(1) : "0"} Lakhs Sourced
          </p>
        </div>
      </div>

      {/* Analytics Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Channel Partners League */}
        <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Channel Partner Performance League
            </h3>
            <span className="text-[10px] font-mono text-white/40">By Total Disbursal Volume</span>
          </div>

          <div className="space-y-2.5">
            {rankedPartners.slice(0, 5).map((partner, index) => {
              const share = totalVolume > 0 ? (partner.volume / totalVolume) * 100 : 0;
              return (
                <div key={partner.code} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          index === 0
                            ? "bg-amber-400 text-slate-950 font-black shadow"
                            : index === 1
                            ? "bg-slate-300 text-slate-950 font-black"
                            : index === 2
                            ? "bg-amber-600 text-white font-black"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="font-bold text-white">{partner.name}</span>
                      <span className="text-[10px] font-mono text-white/40">({partner.code})</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-white">
                        ₹{(partner.volume / 100000).toFixed(1)}L
                      </span>
                      <span className="text-[10px] text-purple-300 ml-2">
                        (₹{partner.commission.toLocaleString("en-IN")})
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      style={{ width: `${Math.max(8, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Volume Distribution */}
        <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Product-Wise Disbursals &amp; Commission
            </h3>
            <span className="text-[10px] font-mono text-white/40">Volume Contribution</span>
          </div>

          <div className="space-y-3">
            {Object.entries(productVolumeMap).map(([prodKey, data]) => {
              const share = totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0;
              if (data.volume === 0) return null;
              return (
                <div key={prodKey} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white/90">{getProductLabel(prodKey)}</span>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400">
                        ₹{(data.volume / 100000).toFixed(1)} Lakhs
                      </span>
                      <span className="text-[10px] text-white/40 ml-2 font-sans">
                        {share.toFixed(1)}% share
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.max(6, share)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Branch Performance */}
      <div className="p-5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          Regional Hub Performance (Ludhiana • Navi Mumbai • Kota)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(branchMap).map(([branchId, data]) => (
            <div key={branchId} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
              <span className="text-xs font-bold text-white block">{data.name}</span>
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-white/40">Disbursed:</span>
                <span className="font-bold text-white">₹{(data.volume / 100000).toFixed(1)} Lakhs</span>
              </div>
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-white/40">Net Commission:</span>
                <span className="font-black text-purple-300">₹{data.commission.toLocaleString("en-IN")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
