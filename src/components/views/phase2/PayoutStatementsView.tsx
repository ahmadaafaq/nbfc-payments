import React, { useState } from "react";
import {
  Printer,
  Download,
  Building2,
  Calendar,
  FileCheck,
  CheckCircle2,
  User,
  CreditCard,
  Percent,
  Search,
  ChevronDown,
} from "lucide-react";
import { StorageService } from "../../../services/storageService";
import { DSAPartner, CommissionPayable } from "../../../types";

export const PayoutStatementsView: React.FC = () => {
  const dsas = StorageService.getDSAs();
  const payables = StorageService.getCommissionPayables();

  const [selectedDsaId, setSelectedDsaId] = useState<string>(dsas[0]?.id || "");
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-09");

  const currentDsa = dsas.find((d) => d.id === selectedDsaId) || dsas[0];

  // Filter payables for selected partner
  const partnerPayables = payables.filter((p) => p.dsaId === selectedDsaId);

  // Financial aggregates
  const totalVolume = partnerPayables.reduce((s, p) => s + (p.disbursalAmount || 0), 0);
  const totalGross = partnerPayables.reduce((s, p) => s + (p.grossCommission || 0), 0);
  const totalTds = partnerPayables.reduce((s, p) => s + (p.tdsAmount || 0), 0);
  const totalNet = partnerPayables.reduce((s, p) => s + (p.netPayable || 0), 0);
  const disbursedTotal = partnerPayables
    .filter((p) => p.status === "DISBURSED" || p.status === "PAYMENT_GENERATED")
    .reduce((s, p) => s + (p.netPayable || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      "Voucher ID",
      "File ID",
      "Customer Name",
      "Product",
      "Loan Disbursal Amount",
      "Commission Rate %",
      "Gross Commission",
      "TDS (Sec 194H 5%)",
      "Net Payable",
      "Status",
    ];

    const rows = partnerPayables.map((p) => [
      p.id,
      p.fileId,
      `"${(p.customerReference || "").replace(/"/g, '""')}"`,
      p.product,
      p.disbursalAmount || 0,
      p.appliedRatePercentage || 0,
      p.grossCommission || 0,
      p.tdsAmount || 0,
      p.netPayable || 0,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `MGM_Payout_Statement_${currentDsa?.dsaCode || "DSA"}_${selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Printer className="w-6 h-6 text-purple-400" />
              Payout Statements &amp; Invoicing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Tax Compliant (Sec 194H)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Generate formal partner payout settlement statements with MGM NBFC corporate headers, TDS certificates, and itemized account vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition backdrop-blur-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Statement CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-900/30 transition border border-white/20 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Print Formal Statement</span>
          </button>
        </div>
      </div>

      {/* Selector Strip (Hidden on Print) */}
      <div className="p-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-wrap items-center gap-4 text-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-white/60 font-semibold">Select Partner:</span>
          <select
            value={selectedDsaId}
            onChange={(e) => setSelectedDsaId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-bold"
          >
            {dsas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.dsaCode}) - {d.branchName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-white/60 font-semibold">Billing Period:</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none focus:border-purple-400 font-bold"
          >
            <option value="2026-09">September 2026 (Active Payout Cycle)</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
          </select>
        </div>
      </div>

      {/* Printable Statement Sheet Canvas */}
      <div
        id="printable-statement-sheet"
        className="rounded-2xl bg-slate-900/90 border border-white/15 p-6 sm:p-10 text-slate-100 shadow-2xl space-y-8 print:bg-white print:text-slate-900 print:border-none print:p-0 print:shadow-none"
      >
        {/* Statement Header with Corporate Letterhead */}
        <div className="border-b border-white/10 pb-6 print:border-slate-300">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-base flex items-center justify-center shadow-lg border border-white/20 print:border-slate-800">
                  MGM
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight text-white print:text-slate-950">
                    MGM FINANCIERS PRIVATE LIMITED
                  </h2>
                  <p className="text-[11px] text-white/60 print:text-slate-600 font-medium">
                    RBI Registered Non-Banking Financial Company (NBFC - ND)
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-white/50 print:text-slate-600 mt-3 space-y-0.5">
                <p>Corporate Office: MGM Financial Tower, Ferozepur Road, Ludhiana, Punjab - 141001</p>
                <p>CIN: U65923PB1995PTC017892 • RBI Reg. No: B-08.00192</p>
                <p>Website: www.mgmfinanciers.com • Helpline: 1800-180-2442</p>
              </div>
            </div>

            <div className="sm:text-right text-xs">
              <div className="inline-block px-3 py-1 rounded-full text-[11px] font-black bg-purple-500/20 text-purple-300 border border-purple-400/30 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                CHANNEL PARTNER PAYOUT STATEMENT
              </div>
              <div className="mt-2 space-y-1 font-mono text-[11px]">
                <div>Statement No: <span className="text-white print:text-slate-900 font-bold">STMT-2026-09-{currentDsa?.dsaCode || "001"}</span></div>
                <div>Statement Date: <span className="text-white print:text-slate-900">04 September 2026</span></div>
                <div>Cycle Period: <span className="text-purple-300 print:text-slate-800 font-bold">01 Sept 2026 - 30 Sept 2026</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner & Bank Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-purple-300 print:text-purple-900 tracking-wider block">
              Channel Partner Details
            </span>
            <div className="font-bold text-white print:text-slate-900 text-sm">{currentDsa?.name}</div>
            <div className="text-white/60 print:text-slate-600">{currentDsa?.legalName}</div>
            <div className="pt-1 text-[11px] space-y-0.5">
              <div>Partner Code: <span className="font-mono text-white print:text-slate-900 font-bold">{currentDsa?.dsaCode}</span></div>
              <div>PAN: <span className="font-mono text-white print:text-slate-900">{currentDsa?.pan}</span> {currentDsa?.gstin ? `• GSTIN: ${currentDsa?.gstin}` : ""}</div>
              <div>Operating Hub: <span className="text-white print:text-slate-900">{currentDsa?.branchName}</span></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-emerald-300 print:text-emerald-900 tracking-wider block">
              Registered Settlement Account
            </span>
            <div className="font-bold text-white print:text-slate-900 text-sm">{currentDsa?.bankName}</div>
            <div className="text-white/60 print:text-slate-600">A/C Name: {currentDsa?.accountHolderName}</div>
            <div className="pt-1 text-[11px] space-y-0.5">
              <div>Account No: <span className="font-mono text-white print:text-slate-900 font-bold">{currentDsa?.accountNumber}</span></div>
              <div>IFSC Code: <span className="font-mono text-white print:text-slate-900 font-bold">{currentDsa?.ifsc}</span></div>
              <div>Verification Status: <span className="text-emerald-400 print:text-emerald-700 font-bold">RBI VERIFIED</span></div>
            </div>
          </div>
        </div>

        {/* Executive Settlement Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200">
            <span className="text-[10px] font-sans font-bold text-white/40 print:text-slate-500 uppercase block">
              Disbursed Volume
            </span>
            <span className="text-base font-black text-white print:text-slate-900">
              ₹{totalVolume.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-sans text-white/50 print:text-slate-500 block">
              {partnerPayables.length} Sourced accounts
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200">
            <span className="text-[10px] font-sans font-bold text-white/40 print:text-slate-500 uppercase block">
              Gross Commission
            </span>
            <span className="text-base font-black text-purple-300 print:text-slate-900">
              ₹{totalGross.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-sans text-white/50 print:text-slate-500 block">
              Pre-tax commission
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/5 print:bg-slate-50 border border-white/10 print:border-slate-200">
            <span className="text-[10px] font-sans font-bold text-rose-400 print:text-rose-700 uppercase block">
              TDS (Sec 194H @ 5%)
            </span>
            <span className="text-base font-black text-rose-400 print:text-rose-700">
              -₹{totalTds.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-sans text-white/50 print:text-slate-500 block">
              Deposited to IT Dept
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/20 print:bg-emerald-50 border border-emerald-500/30 print:border-emerald-200">
            <span className="text-[10px] font-sans font-bold text-emerald-300 print:text-emerald-800 uppercase block">
              Net Payable Amount
            </span>
            <span className="text-lg font-black text-emerald-400 print:text-emerald-800">
              ₹{totalNet.toLocaleString("en-IN")}
            </span>
            <span className="text-[10px] font-sans text-emerald-200 print:text-emerald-700 block">
              Net settlement payout
            </span>
          </div>
        </div>

        {/* Itemized Table of Disbursals */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 print:text-slate-700">
            Itemized Loan Disbursals &amp; Commission Allocation
          </h4>

          <div className="border border-white/10 print:border-slate-300 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-white/5 print:bg-slate-100 text-[10px] font-bold text-white/50 print:text-slate-700 uppercase border-b border-white/10 print:border-slate-300">
                <tr>
                  <th className="py-2.5 px-3">Voucher / File ID</th>
                  <th className="py-2.5 px-3">Borrower Entity</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Disbursed (₹)</th>
                  <th className="py-2.5 px-3 text-center">Rate %</th>
                  <th className="py-2.5 px-3 text-right">Gross (₹)</th>
                  <th className="py-2.5 px-3 text-right">TDS 5% (₹)</th>
                  <th className="py-2.5 px-3 text-right">Net (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-200 text-white/80 print:text-slate-900 font-mono text-[11px]">
                {partnerPayables.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-white/40 print:text-slate-500 font-sans">
                      No active disbursals or payables recorded for this partner in the current cycle.
                    </td>
                  </tr>
                ) : (
                  partnerPayables.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] print:hover:bg-transparent">
                      <td className="py-2.5 px-3 font-bold text-white print:text-slate-900">
                        {p.fileId}
                        <div className="text-[9px] text-white/40 print:text-slate-500 font-normal">{p.id}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-white/90 print:text-slate-900">
                        {p.customerReference}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-[10px] text-white/60 print:text-slate-600">
                        {(p.product || "").replace(/_/g, " ")}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white print:text-slate-900">
                        ₹{(p.disbursalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-400 print:text-emerald-700">
                        {(p.appliedRatePercentage ?? 0).toFixed(2)}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        ₹{(p.grossCommission || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400 print:text-rose-700">
                        -₹{(p.tdsAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400 print:text-emerald-800">
                        ₹{(p.netPayable || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-white/5 print:bg-slate-100 font-mono font-bold text-white print:text-slate-900 border-t border-white/10 print:border-slate-300">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3 font-sans uppercase text-[10px]">
                    Total Settlement Allocation
                  </td>
                  <td className="py-2.5 px-3 text-right">₹{totalVolume.toLocaleString("en-IN")}</td>
                  <td></td>
                  <td className="py-2.5 px-3 text-right">₹{totalGross.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 px-3 text-right text-rose-400 print:text-rose-700">-₹{totalTds.toLocaleString("en-IN")}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400 print:text-emerald-800 text-xs">
                    ₹{totalNet.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Regulatory & Tax Disclosure Notes */}
        <div className="text-[11px] text-white/50 print:text-slate-600 space-y-1 pt-4 border-t border-white/10 print:border-slate-300">
          <p className="font-bold text-white/70 print:text-slate-800">Important Notes &amp; Statutory Compliance:</p>
          <p>1. Tax Deduction at Source (TDS) is deducted strictly under Section 194H of the Income Tax Act, 1961 @ 5.00%.</p>
          <p>2. Form 16A TDS Certificates will be issued quarterly via the TRACES portal to the registered partner PAN.</p>
          <p>3. Payments are remitted via RTGS / NEFT / NACH to the verified bank account shown above.</p>
        </div>

        {/* Signatures & Approvals */}
        <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-white/60 print:text-slate-700">
          <div className="space-y-12">
            <div className="h-10 border-b border-white/20 print:border-slate-400" />
            <div>
              <p className="font-bold text-white print:text-slate-900">Prepared by</p>
              <p className="text-[10px] text-white/40 print:text-slate-500">MGM Channel Operations Desk</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="h-10 border-b border-white/20 print:border-slate-400" />
            <div>
              <p className="font-bold text-white print:text-slate-900">Verified by Finance Controller</p>
              <p className="text-[10px] text-white/40 print:text-slate-500">Ratul Mohindra / Suraj Verma</p>
            </div>
          </div>

          <div className="space-y-12 col-span-2 sm:col-span-1">
            <div className="h-10 border-b border-white/20 print:border-slate-400" />
            <div>
              <p className="font-bold text-white print:text-slate-900">Channel Partner Sign-off</p>
              <p className="text-[10px] text-white/40 print:text-slate-500">{currentDsa?.contactPerson || "Authorized Signatory"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
