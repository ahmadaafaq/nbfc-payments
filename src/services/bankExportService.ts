import * as XLSX from "xlsx";
import { Payment, BankExportRecord } from "../types";

export interface BankFileValidationResult {
  isEligible: boolean;
  eligiblePayments: Payment[];
  ineligiblePayments: Array<{ payment: Payment; reason: string }>;
  totalAmount: number;
}

export interface BankAdapter {
  id: "IDFC_FIRST" | "STANDARD_CMS";
  name: string;
  description: string;
  fileExtension: "xlsx" | "csv";
  generatePayload(payments: Payment[]): {
    data: any[];
    headers: string[];
    fileName: string;
  };
}

export class BankExportService {
  /**
   * Safety verification before generating bank file
   */
  static validatePaymentsForBankExport(payments: Payment[]): BankFileValidationResult {
    const eligible: Payment[] = [];
    const ineligible: Array<{ payment: Payment; reason: string }> = [];
    let total = 0;

    for (const p of payments) {
      if (p.status !== "APPROVED") {
        ineligible.push({
          payment: p,
          reason: `Payment is in status '${p.status}', not 'APPROVED'. Only approved payments can be exported.`,
        });
        continue;
      }

      if (!p.accountNumber || p.accountNumber.length < 9) {
        ineligible.push({
          payment: p,
          reason: "Invalid or missing beneficiary account number.",
        });
        continue;
      }

      if (!p.ifsc || p.ifsc.length !== 11) {
        ineligible.push({
          payment: p,
          reason: "Invalid or missing IFSC code.",
        });
        continue;
      }

      if (p.netAmount <= 0) {
        ineligible.push({
          payment: p,
          reason: "Payment amount must be greater than zero.",
        });
        continue;
      }

      eligible.push(p);
      total += p.netAmount;
    }

    return {
      isEligible: ineligible.length === 0 && eligible.length > 0,
      eligiblePayments: eligible,
      ineligiblePayments: ineligible,
      totalAmount: total,
    };
  }

  /**
   * IDFC FIRST Bank Bulk Upload Adapter
   * Formatted strictly to standard CMS Excel template
   */
  static generateIDFCFirstExport(payments: Payment[]): { blob: Blob; fileName: string } {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `MGM_IDFC_CMS_${dateStr}_${String(Math.floor(Math.random() * 900) + 100)}.xlsx`;

    // Map internal normalized payment model to IDFC FIRST Bank CMS columns
    const rows = payments.map((p, index) => ({
      "Sr No": index + 1,
      "Debit Account No": p.debitAccountNumber || "10084729104",
      "Beneficiary Name": p.beneficiaryName,
      "Beneficiary Account No": p.accountNumber,
      "IFSC Code": p.ifsc.toUpperCase(),
      "Transaction Type": p.netAmount >= 200000 ? "RTGS" : p.method || "NEFT",
      "Amount": p.netAmount,
      "Currency": "INR",
      "Payment Date": p.paymentDate,
      "Customer Reference No": p.fileId || p.id,
      "Payment Details / Remarks": (p.purpose || "Payment from MGM Financiers").slice(0, 50),
      "Beneficiary Email": p.beneficiaryEmail || "",
      "MGM Internal Payment ID": p.id,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Set column widths for readability
    worksheet["!cols"] = [
      { wch: 8 },  // Sr No
      { wch: 20 }, // Debit Account No
      { wch: 28 }, // Beneficiary Name
      { wch: 22 }, // Beneficiary Account No
      { wch: 14 }, // IFSC Code
      { wch: 16 }, // Transaction Type
      { wch: 14 }, // Amount
      { wch: 10 }, // Currency
      { wch: 14 }, // Payment Date
      { wch: 22 }, // Customer Reference No
      { wch: 35 }, // Payment Details / Remarks
      { wch: 28 }, // Beneficiary Email
      { wch: 22 }, // MGM Internal Payment ID
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "IDFC_CMS_Upload");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    return { blob, fileName };
  }

  /**
   * Standard CMS CSV Adapter (compatible with SBI, PNB, HDFC bulk portals)
   */
  static generateStandardCMSCSV(payments: Payment[]): { blob: Blob; fileName: string } {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `MGM_STANDARD_CMS_${dateStr}.csv`;

    const headers = [
      "Record Type",
      "Payment Ref",
      "Debit Account",
      "Beneficiary Name",
      "Beneficiary Account",
      "IFSC",
      "Amount",
      "Currency",
      "Value Date",
      "Remarks",
      "Email",
    ];

    const csvRows = [headers.join(",")];

    for (const p of payments) {
      const row = [
        "N",
        p.id,
        `"${p.debitAccountNumber}"`,
        `"${p.beneficiaryName.replace(/"/g, '""')}"`,
        `"${p.accountNumber}"`,
        p.ifsc,
        p.netAmount.toFixed(2),
        "INR",
        p.paymentDate,
        `"${(p.purpose || "Payment").replace(/"/g, '""')}"`,
        `"${p.beneficiaryEmail || ""}"`,
      ];
      csvRows.push(row.join(","));
    }

    const blob = new Blob([csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    return { blob, fileName };
  }

  /**
   * Helper to trigger download in browser
   */
  static triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
