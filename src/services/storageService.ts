import {
  Branch,
  UserProfile,
  DebitAccount,
  Payment,
  PaymentBatch,
  BankExportRecord,
  InAppNotification,
  UserRole,
  PaymentStatus,
  BankStatus,
  AppPhase,
  DSAPartner,
  CommissionRule,
  Disbursal,
  CommissionPayable,
  CommissionAdjustment,
  AuditLogEntry,
} from "../types";
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_DEBIT_ACCOUNTS,
  INITIAL_BATCHES,
  INITIAL_NOTIFICATIONS,
  generateInitialPayments,
  generateSampleVoucherSvg,
} from "./seedData";
import {
  INITIAL_DSAS,
  INITIAL_COMMISSION_RULES,
  generateInitialPhase2Data,
  matchCommissionRule,
} from "./phase2SeedData";
import { AIVerificationService } from "./aiVerificationService";

const STORAGE_KEYS = {
  BRANCHES: "mgm_branches_v1",
  USERS: "mgm_users_v1",
  ACCOUNTS: "mgm_debit_accounts_v1",
  PAYMENTS: "mgm_payments_v1",
  BATCHES: "mgm_batches_v1",
  EXPORTS: "mgm_bank_exports_v1",
  NOTIFICATIONS: "mgm_notifications_v1",
  CURRENT_USER_ID: "mgm_current_user_id_v1",
  CURRENT_BRANCH_ID: "mgm_current_branch_id_v1",
  THEME: "mgm_theme_v1",
  SELECTED_PHASE: "mgm_selected_phase_v1",
  DSAS: "mgm_phase2_dsas_v1",
  COMMISSION_RULES: "mgm_phase2_rules_v1",
  DISBURSALS: "mgm_phase2_disbursals_v1",
  COMMISSION_PAYABLES: "mgm_phase2_payables_v1",
};

export class StorageService {
  // Listeners for reactive updates
  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify() {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (err) {
        console.error("Storage listener error:", err);
      }
    }
  }

  // Branches
  static getBranches(): Branch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    if (!raw) {
      this.saveBranches(INITIAL_BRANCHES);
      return INITIAL_BRANCHES;
    }
    try {
      const parsed: Branch[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveBranches(INITIAL_BRANCHES);
        return INITIAL_BRANCHES;
      }
      return parsed;
    } catch {
      return INITIAL_BRANCHES;
    }
  }

  static saveBranches(branches: Branch[]) {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    this.notify();
  }

  static addBranch(branch: Branch) {
    const branches = this.getBranches();
    const updated = [...branches, branch];
    this.saveBranches(updated);
  }

  static updateBranch(updated: Branch) {
    const branches = this.getBranches().map((b) => (b.id === updated.id ? updated : b));
    this.saveBranches(branches);
  }

  static deleteBranch(branchId: string): boolean {
    const branches = this.getBranches();
    if (branches.length <= 1) {
      return false; // Preserve at least one active branch
    }
    const filtered = branches.filter((b) => b.id !== branchId);
    this.saveBranches(filtered);
    return true;
  }

  // Users
  static getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      this.saveUsers(INITIAL_USERS);
      return INITIAL_USERS;
    }
    try {
      const parsed: UserProfile[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveUsers(INITIAL_USERS);
        return INITIAL_USERS;
      }
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  }

  static saveUsers(users: UserProfile[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify();
  }

  static addUser(user: UserProfile) {
    const users = this.getUsers();
    const updated = [...users, user];
    this.saveUsers(updated);
  }

  static updateUser(updated: UserProfile) {
    const users = this.getUsers().map((u) => (u.id === updated.id ? updated : u));
    this.saveUsers(users);
  }

  static deleteUser(userId: string): boolean {
    const users = this.getUsers();
    if (users.length <= 1) {
      return false; // Preserve at least one user
    }
    const filtered = users.filter((u) => u.id !== userId);
    this.saveUsers(filtered);
    return true;
  }

  static getCurrentUser(): UserProfile {
    const users = this.getUsers();
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (savedId) {
      const found = users.find((u) => u.id === savedId);
      if (found) return found;
    }
    // Default to Ratul Mohindra (Admin at the top)
    const adminUser = users.find((u) => u.role === "ADMIN") || users[0];
    return adminUser;
  }

  static setCurrentUser(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    this.notify();
  }

  // Branch Selection
  static getCurrentBranch(): Branch {
    const branches = this.getBranches();
    const savedId = localStorage.getItem(STORAGE_KEYS.CURRENT_BRANCH_ID);
    if (savedId) {
      const found = branches.find((b) => b.id === savedId);
      if (found) return found;
    }
    return branches[0]; // Ludhiyana (Main)
  }

  static setCurrentBranch(branchId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BRANCH_ID, branchId);
    this.notify();
  }

  // Debit Accounts
  static getDebitAccounts(): DebitAccount[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      this.saveDebitAccounts(INITIAL_DEBIT_ACCOUNTS);
      return INITIAL_DEBIT_ACCOUNTS;
    }
    try {
      const parsed: DebitAccount[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveDebitAccounts(INITIAL_DEBIT_ACCOUNTS);
        return INITIAL_DEBIT_ACCOUNTS;
      }
      return parsed;
    } catch {
      return INITIAL_DEBIT_ACCOUNTS;
    }
  }

  static saveDebitAccounts(accounts: DebitAccount[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    this.notify();
  }

  static addDebitAccount(account: DebitAccount) {
    const accounts = this.getDebitAccounts();
    const updated = [...accounts, account];
    this.saveDebitAccounts(updated);
  }

  static updateDebitAccount(updated: DebitAccount) {
    const accounts = this.getDebitAccounts().map((a) => (a.id === updated.id ? updated : a));
    this.saveDebitAccounts(accounts);
  }

  static deleteDebitAccount(accountId: string): boolean {
    const accounts = this.getDebitAccounts();
    if (accounts.length <= 1) {
      return false; // Preserve at least one corporate account
    }
    const filtered = accounts.filter((a) => a.id !== accountId);
    this.saveDebitAccounts(filtered);
    return true;
  }

  // Payments
  static getPayments(): Payment[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      const initial = generateInitialPayments();
      this.savePayments(initial);
      return initial;
    }
    try {
      const parsed: Payment[] = JSON.parse(raw);
      let migrated = false;
      const updated = parsed.map((p) => {
        let changed = false;
        let branchId = p.branchId;
        let branchName = p.branchName;
        if (branchId === "branch-ludhiana" || branchName === "Ludhiana (Main)") {
          branchId = "branch-ludhiyana";
          branchName = "Ludhiyana (Main)";
          changed = true;
        } else if (branchId === "branch-jalandhar" || branchName === "Jalandhar Branch") {
          branchId = "branch-navimumbai";
          branchName = "Navi Mumbai";
          changed = true;
        } else if (branchId === "branch-chandigarh" || branchName === "Chandigarh Branch") {
          branchId = "branch-kota";
          branchName = "Kota";
          changed = true;
        }
        if (changed) {
          migrated = true;
          return { ...p, branchId, branchName };
        }
        return p;
      });
      if (migrated) {
        this.savePayments(updated);
        return updated;
      }
      return parsed;
    } catch {
      return generateInitialPayments();
    }
  }

  static savePayments(payments: Payment[]) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    this.notify();
  }

  static getPaymentById(id: string): Payment | undefined {
    return this.getPayments().find((p) => p.id === id);
  }

  static createPayment(payment: Payment) {
    const payments = [payment, ...this.getPayments()];
    this.savePayments(payments);
    this.addNotification({
      title: "New Payment Created",
      message: `Payment ${payment.id} for ₹${payment.netAmount.toLocaleString("en-IN")} submitted for checker review.`,
      type: "info",
      paymentId: payment.id,
    });
  }

  static updatePayment(updated: Payment) {
    const payments = this.getPayments().map((p) => (p.id === updated.id ? updated : p));
    this.savePayments(payments);

    // If payment was settled (SUCCESSFUL) and belongs to a batch, check if all payments in that batch are now settled
    if (updated.status === "SUCCESSFUL" && updated.batchId) {
      const batchPayments = payments.filter((p) => p.batchId === updated.batchId);
      if (batchPayments.length > 0 && batchPayments.every((p) => p.status === "SUCCESSFUL")) {
        const batch = this.getBatches().find((b) => b.id === updated.batchId);
        if (batch && batch.status !== "BANK_SUBMITTED") {
          this.updateBatch({
            ...batch,
            status: "BANK_SUBMITTED",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  /**
   * Maker-Checker Approval
   * Enforces Maker != Checker
   */
  static approvePayment(
    paymentId: string,
    checker: UserProfile,
    approvalNotes?: string
  ): { success: boolean; error?: string } {
    const payment = this.getPaymentById(paymentId);
    if (!payment) return { success: false, error: "Payment not found" };

    if (payment.makerId === checker.id && checker.role !== "ADMIN") {
      return {
        success: false,
        error: "Segregation of Duties Violation: Maker cannot approve their own payment submission.",
      };
    }

    if (payment.status !== "PENDING_CHECKER") {
      return {
        success: false,
        error: `Payment is in '${payment.status}' state and cannot be approved.`,
      };
    }

    const now = new Date().toISOString();
    const updatedPayment: Payment = {
      ...payment,
      status: "APPROVED",
      checkerId: checker.id,
      checkerName: checker.name,
      approvedAt: now,
      updatedAt: now,
      auditTrail: [
        ...payment.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: checker.id,
          userName: checker.name,
          userRole: checker.role,
          action: "PAYMENT_APPROVED",
          details: `Approved by Checker ${checker.name}. ${approvalNotes || "All document checks confirmed."}`,
        },
      ],
    };

    this.updatePayment(updatedPayment);
    this.addNotification({
      title: "Payment Approved",
      message: `Payment ${payment.id} for ₹${payment.netAmount.toLocaleString("en-IN")} approved by ${checker.name}.`,
      type: "success",
      paymentId: payment.id,
    });

    return { success: true };
  }

  /**
   * Checker Rejection with Mandatory Reason
   */
  static rejectPayment(
    paymentId: string,
    checker: UserProfile,
    reason: string,
    notes: string
  ): { success: boolean; error?: string } {
    const payment = this.getPaymentById(paymentId);
    if (!payment) return { success: false, error: "Payment not found" };

    if (payment.makerId === checker.id && checker.role !== "ADMIN") {
      return {
        success: false,
        error: "Segregation of Duties Violation: Maker cannot reject their own payment as a checker.",
      };
    }

    const now = new Date().toISOString();
    const updatedPayment: Payment = {
      ...payment,
      status: "REJECTED",
      checkerId: checker.id,
      checkerName: checker.name,
      rejectionReason: reason,
      rejectionNotes: notes,
      updatedAt: now,
      auditTrail: [
        ...payment.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: checker.id,
          userName: checker.name,
          userRole: checker.role,
          action: "PAYMENT_REJECTED",
          details: `Rejected by Checker ${checker.name}. Reason: ${reason}. Notes: ${notes}`,
        },
      ],
    };

    this.updatePayment(updatedPayment);
    this.addNotification({
      title: "Payment Rejected",
      message: `Payment ${payment.id} was rejected by ${checker.name}. Reason: ${reason}`,
      type: "danger",
      paymentId: payment.id,
    });

    return { success: true };
  }

  /**
   * Checker Send Back to Maker
   */
  static sendBackPayment(
    paymentId: string,
    checker: UserProfile,
    notes: string
  ): { success: boolean; error?: string } {
    const payment = this.getPaymentById(paymentId);
    if (!payment) return { success: false, error: "Payment not found" };

    const now = new Date().toISOString();
    const updatedPayment: Payment = {
      ...payment,
      status: "DRAFT",
      rejectionReason: "Returned for Clarification / Resubmission",
      rejectionNotes: notes,
      updatedAt: now,
      auditTrail: [
        ...payment.auditTrail,
        {
          id: `audit-${Date.now()}`,
          timestamp: now,
          userId: checker.id,
          userName: checker.name,
          userRole: checker.role,
          action: "PAYMENT_SENT_BACK",
          details: `Sent back to Maker by ${checker.name}. Clarification requested: ${notes}`,
        },
      ],
    };

    this.updatePayment(updatedPayment);
    this.addNotification({
      title: "Payment Returned to Maker",
      message: `Payment ${payment.id} returned for clarification: ${notes}`,
      type: "warning",
      paymentId: payment.id,
    });

    return { success: true };
  }

  static sendBackToMaker(
    paymentId: string,
    checker: UserProfile,
    notes: string
  ): { success: boolean; error?: string } {
    return this.sendBackPayment(paymentId, checker, notes);
  }

  // Batches
  static getBatches(): PaymentBatch[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BATCHES);
    if (!raw) {
      this.saveBatches(INITIAL_BATCHES);
      return INITIAL_BATCHES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BATCHES;
    }
  }

  static saveBatches(batches: PaymentBatch[]) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
    this.notify();
  }

  static createBatch(batch: PaymentBatch) {
    const batches = [batch, ...this.getBatches()];
    this.saveBatches(batches);
  }

  static updateBatch(updated: PaymentBatch) {
    const batches = this.getBatches().map((b) => (b.id === updated.id ? updated : b));
    this.saveBatches(batches);
  }

  // Bank Exports History
  static getBankExports(): BankExportRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPORTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveBankExport(record: BankExportRecord) {
    const exportsList = [record, ...this.getBankExports()];
    localStorage.setItem(STORAGE_KEYS.EXPORTS, JSON.stringify(exportsList));
    this.notify();
  }

  // Notifications
  static getNotifications(): InAppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      this.saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  static saveNotifications(notifs: InAppNotification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  static addNotification(notif: Omit<InAppNotification, "id" | "timestamp" | "read">) {
    const newNotif: InAppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: "Just now",
      read: false,
    };
    this.saveNotifications([newNotif, ...this.getNotifications()]);
  }

  static markAllNotificationsAsRead() {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    this.saveNotifications(notifs);
  }

  // Theme Preference
  static getTheme(): "light" | "dark" {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === "dark" || saved === "light") return saved;
    // Dark mode is default
    return "dark";
  }

  static setTheme(theme: "light" | "dark") {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
    this.notify();
  }

  // ==========================================================================
  // PHASE SELECTOR PERSISTENCE (PHASE 1 vs PHASE 2)
  // ==========================================================================
  static getSelectedPhase(): AppPhase {
    const raw = localStorage.getItem(STORAGE_KEYS.SELECTED_PHASE);
    if (raw === "PHASE_1" || raw === "PHASE_2") return raw;
    // Default to PHASE_2 so the user can immediately experience Phase 2 Commission Automation
    return "PHASE_2";
  }

  static setSelectedPhase(phase: AppPhase) {
    localStorage.setItem(STORAGE_KEYS.SELECTED_PHASE, phase);
    this.notify();
  }

  // ==========================================================================
  // PHASE 2: DSA / CHANNEL PARTNERS MASTER CRUD
  // ==========================================================================
  static getDSAs(): DSAPartner[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DSAS);
    if (!raw) {
      this.saveDSAs(INITIAL_DSAS);
      return INITIAL_DSAS;
    }
    try {
      const parsed: DSAPartner[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveDSAs(INITIAL_DSAS);
        return INITIAL_DSAS;
      }
      return parsed;
    } catch {
      return INITIAL_DSAS;
    }
  }

  static saveDSAs(dsas: DSAPartner[]) {
    localStorage.setItem(STORAGE_KEYS.DSAS, JSON.stringify(dsas));
    this.notify();
  }

  static addDSA(dsa: DSAPartner) {
    const dsas = this.getDSAs();
    const updated = [dsa, ...dsas];
    this.saveDSAs(updated);
    this.addNotification({
      title: "New Channel Partner Registered",
      message: `${dsa.name} (${dsa.dsaCode}) added to ${dsa.branchName}.`,
      type: "success",
    });
  }

  static updateDSA(updated: DSAPartner, changedBy?: string) {
    const currentList = this.getDSAs();
    const existing = currentList.find((d) => d.id === updated.id);

    // If sensitive bank details changed, log audit record
    if (
      existing &&
      (existing.accountNumber !== updated.accountNumber ||
        existing.ifsc !== updated.ifsc ||
        existing.bankName !== updated.bankName ||
        existing.accountHolderName !== updated.accountHolderName)
    ) {
      const auditLog = updated.bankAuditHistory || [];
      const newAuditRecord = {
        id: `BA-${Date.now()}`,
        dsaId: updated.id,
        previousAccount: existing.accountNumber,
        newAccount: updated.accountNumber,
        previousIfsc: existing.ifsc,
        newIfsc: updated.ifsc,
        previousBank: existing.bankName,
        newBank: updated.bankName,
        previousHolderName: existing.accountHolderName,
        newHolderName: updated.accountHolderName,
        changedBy: changedBy || "Admin User",
        changedByRole: "ADMIN" as UserRole,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
        reason: "DSA bank account details updated via Partner Master.",
        verificationStatus: updated.bankVerificationStatus,
      };
      updated.bankAuditHistory = [newAuditRecord, ...auditLog];
    }

    const next = currentList.map((d) => (d.id === updated.id ? updated : d));
    this.saveDSAs(next);
  }

  static deleteDSA(dsaId: string): boolean {
    const currentList = this.getDSAs();
    const filtered = currentList.filter((d) => d.id !== dsaId);
    this.saveDSAs(filtered);
    return true;
  }

  // ==========================================================================
  // PHASE 2: COMMISSION RULES & VERSIONING
  // ==========================================================================
  static getCommissionRules(): CommissionRule[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMISSION_RULES);
    if (!raw) {
      this.saveCommissionRules(INITIAL_COMMISSION_RULES);
      return INITIAL_COMMISSION_RULES;
    }
    try {
      const parsed: CommissionRule[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.saveCommissionRules(INITIAL_COMMISSION_RULES);
        return INITIAL_COMMISSION_RULES;
      }
      return parsed;
    } catch {
      return INITIAL_COMMISSION_RULES;
    }
  }

  static saveCommissionRules(rules: CommissionRule[]) {
    localStorage.setItem(STORAGE_KEYS.COMMISSION_RULES, JSON.stringify(rules));
    this.notify();
  }

  static addCommissionRule(rule: CommissionRule) {
    const rules = this.getCommissionRules();
    const updated = [rule, ...rules];
    this.saveCommissionRules(updated);
    this.addNotification({
      title: "Commission Rule Created",
      message: `${rule.name} configured for ${rule.product} (${rule.commissionPercentage}%).`,
      type: "info",
    });
  }

  static updateCommissionRule(updated: CommissionRule, changeReason: string = "Rule configuration update") {
    const rules = this.getCommissionRules();
    const existing = rules.find((r) => r.id === updated.id);

    if (existing && existing.commissionPercentage !== updated.commissionPercentage) {
      // Increment rule version and preserve historical version log
      const newVersion = (existing.version || 1) + 1;
      const versionHistory = updated.versions || [];
      const newVersionRecord = {
        id: `RV-${Date.now()}`,
        ruleId: updated.id,
        version: existing.version,
        commissionPercentage: existing.commissionPercentage,
        effectiveFrom: existing.effectiveFrom,
        effectiveUntil: new Date().toISOString().split("T")[0],
        changedBy: "Ratul Mohindra",
        changedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        changeReason,
      };
      updated.version = newVersion;
      updated.versions = [newVersionRecord, ...versionHistory];
      updated.updatedAt = new Date().toISOString();
    }

    const next = rules.map((r) => (r.id === updated.id ? updated : r));
    this.saveCommissionRules(next);
  }

  static deleteCommissionRule(ruleId: string): boolean {
    const rules = this.getCommissionRules();
    const filtered = rules.filter((r) => r.id !== ruleId);
    this.saveCommissionRules(filtered);
    return true;
  }

  // ==========================================================================
  // PHASE 2: DISBURSALS
  // ==========================================================================
  static getDisbursals(): Disbursal[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DISBURSALS);
    if (!raw) {
      const initial = generateInitialPhase2Data();
      this.saveDisbursals(initial.disbursals);
      this.saveCommissionPayables(initial.payables);
      return initial.disbursals;
    }
    try {
      const parsed: Disbursal[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initial = generateInitialPhase2Data();
        this.saveDisbursals(initial.disbursals);
        this.saveCommissionPayables(initial.payables);
        return initial.disbursals;
      }
      return parsed;
    } catch {
      const initial = generateInitialPhase2Data();
      return initial.disbursals;
    }
  }

  static saveDisbursals(disbursals: Disbursal[]) {
    localStorage.setItem(STORAGE_KEYS.DISBURSALS, JSON.stringify(disbursals));
    this.notify();
  }

  static addDisbursal(disbursal: Disbursal): { disbursal: Disbursal; payable?: CommissionPayable } {
    const disbursals = this.getDisbursals();
    const rules = this.getCommissionRules();
    const dsas = this.getDSAs();

    // Check duplicate
    const isDuplicate = disbursals.some(
      (d) =>
        d.fileId.toLowerCase() === disbursal.fileId.toLowerCase() ||
        (d.applicationId && d.applicationId === disbursal.applicationId)
    );

    if (isDuplicate) {
      disbursal.status = "DUPLICATE";
    }

    const dsa = dsas.find((d) => d.id === disbursal.dsaId);
    if (!dsa) {
      disbursal.status = "MISSING_DSA";
    }

    // Match Commission Rule
    const match = matchCommissionRule(
      rules,
      disbursal.dsaId,
      disbursal.product,
      disbursal.disbursalAmount,
      disbursal.branchId
    );

    let createdPayable: CommissionPayable | undefined = undefined;

    if (match.rule && !isDuplicate && dsa) {
      disbursal.status = "CALCULATED";
      disbursal.applicableRuleId = match.rule.id;
      disbursal.applicableRuleName = match.rule.name;
      disbursal.applicableRuleVersion = match.rule.version;
      disbursal.commissionRate = match.rule.commissionPercentage;

      const gross = Math.round((disbursal.disbursalAmount * match.rule.commissionPercentage) / 100);
      const tds = Math.round(gross * 0.05); // Standard 5% TDS
      const net = gross - tds;

      disbursal.grossCommission = gross;
      disbursal.netCommission = net;

      // Create Commission Payable
      const payableId = `CP-00${Math.floor(1000 + Math.random() * 9000)}`;
      createdPayable = {
        id: payableId,
        disbursalId: disbursal.id,
        fileId: disbursal.fileId,
        applicationId: disbursal.applicationId,
        dsaId: dsa.id,
        dsaName: dsa.name,
        dsaAccountNumber: dsa.accountNumber,
        dsaIfsc: dsa.ifsc,
        dsaBankName: dsa.bankName,
        dsaAccountHolderName: dsa.accountHolderName,
        branchId: disbursal.branchId,
        branchName: disbursal.branchName,
        product: disbursal.product,
        customerReference: disbursal.customerReference,
        disbursalDate: disbursal.disbursalDate,
        disbursalAmount: disbursal.disbursalAmount,
        commissionRuleId: match.rule.id,
        commissionRuleName: match.rule.name,
        commissionRuleVersion: match.rule.version,
        commissionRate: match.rule.commissionPercentage,
        grossCommission: gross,
        adjustments: [
          {
            id: `ADJ-${Date.now()}`,
            type: "TDS",
            amount: tds,
            reason: "Section 194H TDS deduction @ 5%",
            adjustedBy: "System Calculation Engine",
            adjustedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
          },
        ],
        totalAdjustments: tds,
        netPayable: net,
        status: dsa.status === "ON_HOLD" || dsa.bankVerificationStatus !== "VERIFIED" ? "ON_HOLD" : "READY_FOR_PAYOUT",
        holdReason:
          dsa.status === "ON_HOLD" || dsa.bankVerificationStatus !== "VERIFIED"
            ? "DSA account or bank details require verification before release."
            : undefined,
        calculatedAt: new Date().toISOString(),
        calculatedBy: "System Rule Engine",
        auditTrail: [
          {
            id: `AUD-${Date.now()}-1`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            userId: "user-neha",
            userName: "Neha Sharma",
            userRole: "MAKER",
            action: "DISBURSAL_CREATED",
            details: `Manual Disbursal entry for File #${disbursal.fileId}, ₹${disbursal.disbursalAmount.toLocaleString("en-IN")}`,
          },
          {
            id: `AUD-${Date.now()}-2`,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            userId: "system",
            userName: "System Engine",
            userRole: "ADMIN",
            action: "COMMISSION_CALCULATED",
            details: `Applied Rule: ${match.rule.name} (v${match.rule.version}) @ ${match.rule.commissionPercentage}%, Net Payable: ₹${net.toLocaleString("en-IN")}`,
          },
        ],
      };

      this.addCommissionPayable(createdPayable);
    } else if (!match.rule && !isDuplicate) {
      disbursal.status = "MISSING_RULE";
    }

    this.saveDisbursals([disbursal, ...disbursals]);
    return { disbursal, payable: createdPayable };
  }

  static bulkAddDisbursals(newDisbursals: Disbursal[]): { importedCount: number; payablesCount: number } {
    let importedCount = 0;
    let payablesCount = 0;

    for (const d of newDisbursals) {
      const res = this.addDisbursal(d);
      importedCount++;
      if (res.payable) payablesCount++;
    }

    return { importedCount, payablesCount };
  }

  // ==========================================================================
  // PHASE 2: COMMISSION PAYABLES
  // ==========================================================================
  static getCommissionPayables(): CommissionPayable[] {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMISSION_PAYABLES);
    if (!raw) {
      const initial = generateInitialPhase2Data();
      this.saveCommissionPayables(initial.payables);
      return initial.payables;
    }
    try {
      const parsed: CommissionPayable[] = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const initial = generateInitialPhase2Data();
        this.saveCommissionPayables(initial.payables);
        return initial.payables;
      }
      return parsed;
    } catch {
      const initial = generateInitialPhase2Data();
      return initial.payables;
    }
  }

  static saveCommissionPayables(payables: CommissionPayable[]) {
    localStorage.setItem(STORAGE_KEYS.COMMISSION_PAYABLES, JSON.stringify(payables));
    this.notify();
  }

  static addCommissionPayable(payable: CommissionPayable) {
    const payables = this.getCommissionPayables();
    const updated = [payable, ...payables];
    this.saveCommissionPayables(updated);
  }

  static updateCommissionPayable(updated: CommissionPayable) {
    const payables = this.getCommissionPayables().map((p) => (p.id === updated.id ? updated : p));
    this.saveCommissionPayables(payables);
  }

  static setPayableHold(
    payableId: string,
    onHold: boolean,
    reason: string,
    user: UserProfile
  ) {
    const payables = this.getCommissionPayables();
    const payable = payables.find((p) => p.id === payableId);
    if (!payable) return;

    payable.status = onHold ? "ON_HOLD" : "READY_FOR_PAYOUT";
    payable.holdReason = onHold ? reason : undefined;
    payable.holdSetBy = onHold ? user.name : undefined;
    payable.holdSetAt = onHold ? new Date().toISOString().replace("T", " ").substring(0, 16) : undefined;

    payable.auditTrail.unshift({
      id: `AUD-HOLD-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: onHold ? "PAYABLE_PLACED_ON_HOLD" : "PAYABLE_HOLD_RELEASED",
      details: onHold ? `Placed on Hold: ${reason}` : `Hold released by ${user.name}: ${reason}`,
    });

    this.saveCommissionPayables(payables);
  }

  static addAdjustmentToPayable(
    payableId: string,
    adjustment: Omit<CommissionAdjustment, "id" | "adjustedAt">,
    user: UserProfile
  ) {
    const payables = this.getCommissionPayables();
    const payable = payables.find((p) => p.id === payableId);
    if (!payable) return;

    const newAdjustment: CommissionAdjustment = {
      ...adjustment,
      id: `ADJ-${Date.now()}`,
      adjustedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    payable.adjustments = [newAdjustment, ...(payable.adjustments || [])];
    payable.totalAdjustments = payable.adjustments.reduce((sum, a) => sum + a.amount, 0);
    payable.netPayable = Math.max(0, payable.grossCommission - payable.totalAdjustments);

    payable.auditTrail.unshift({
      id: `AUD-ADJ-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "ADJUSTMENT_ADDED",
      details: `Added ${adjustment.type} adjustment of ₹${adjustment.amount.toLocaleString("en-IN")}: ${adjustment.reason}. New Net Payable: ₹${payable.netPayable.toLocaleString("en-IN")}`,
    });

    this.saveCommissionPayables(payables);
  }

  static getCommissionPayableById(payableId: string): CommissionPayable | undefined {
    return this.getCommissionPayables().find((p) => p.id === payableId);
  }

  static holdCommissionPayable(payableId: string, reason: string) {
    this.setPayableHold(payableId, true, reason, this.getCurrentUser());
  }

  static releaseCommissionPayable(payableId: string, reason: string) {
    this.setPayableHold(payableId, false, reason, this.getCurrentUser());
  }

  static addCommissionAdjustment(payableId: string, adjustment: CommissionAdjustment) {
    this.addAdjustmentToPayable(
      payableId,
      {
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason || adjustment.description || "Manual adjustment",
        description: adjustment.description || adjustment.reason,
        adjustedBy: adjustment.adjustedBy || adjustment.appliedBy || this.getCurrentUser().name,
        appliedBy: adjustment.appliedBy || adjustment.adjustedBy || this.getCurrentUser().name,
      },
      this.getCurrentUser()
    );
  }

  static calculateCommission(params: {
    loanAmount: number;
    product: string;
    dsaId?: string;
    branchId?: string;
    disbursalDate?: string;
  }): {
    appliedRuleId: string;
    appliedRuleName: string;
    appliedRuleVersion: number;
    appliedRatePercentage: number;
    grossCommission: number;
    tdsAmount: number;
    netCommission: number;
    priority: number;
    ruleType: string;
  } {
    const rules = this.getCommissionRules();
    const match = matchCommissionRule(
      rules,
      params.dsaId,
      params.product,
      params.loanAmount,
      params.branchId
    );

    const rule = match.rule || {
      id: "RULE-DEFAULT",
      name: "Global Fallback Tier",
      version: 1,
      commissionPercentage: 1.0,
      ruleType: "GLOBAL",
    };

    const rate = rule.commissionPercentage;
    const gross = Math.round((params.loanAmount * rate) / 100);
    const tds = Math.round(gross * 0.05); // 5% TDS under Sec 194H
    const net = gross - tds;

    return {
      appliedRuleId: rule.id,
      appliedRuleName: rule.name,
      appliedRuleVersion: rule.version,
      appliedRatePercentage: rate,
      grossCommission: gross,
      tdsAmount: tds,
      netCommission: net,
      priority: match.rule?.priority || (match.rule?.ruleType === "DSA_SPECIFIC" ? 1 : match.rule?.ruleType === "BRANCH_SPECIFIC" ? 2 : match.rule?.ruleType === "PRODUCT_SPECIFIC" ? 3 : 4),
      ruleType: rule.ruleType,
    };
  }

  static generatePaymentFromCommissionPayable(payableId: string): string {
    const res = this.generatePaymentFromPayable(payableId, this.getCurrentUser());
    if (!res.success || !res.payment) {
      throw new Error(res.error || "Failed to generate Phase 1 payment request.");
    }
    return res.payment.id;
  }

  // ==========================================================================
  // PHASE 2 → PHASE 1 PAYMENT GENERATION ENGINE INTEGRATION
  // ==========================================================================
  static generatePaymentFromPayable(
    payableId: string,
    currentUser: UserProfile
  ): { success: boolean; payment?: Payment; error?: string } {
    const payables = this.getCommissionPayables();
    const payable = payables.find((p) => p.id === payableId);

    if (!payable) {
      return { success: false, error: "Commission payable record not found." };
    }

    if (payable.status === "ON_HOLD") {
      return { success: false, error: `Cannot generate payment: Payable is ON HOLD (${payable.holdReason || "Under review"}).` };
    }

    if (payable.status === "PAYMENT_GENERATED" || payable.status === "APPROVED" || payable.status === "PAID") {
      return { success: false, error: "Payment has already been generated for this payable record." };
    }

    if (payable.netPayable <= 0) {
      return { success: false, error: "Cannot generate payment with zero or negative net payable amount." };
    }

    const dsas = this.getDSAs();
    const dsa = dsas.find((d) => d.id === payable.dsaId);
    if (!dsa) {
      return { success: false, error: "DSA partner profile missing." };
    }

    if (!payable.dsaAccountNumber || !payable.dsaIfsc) {
      return { success: false, error: "DSA bank account details are missing." };
    }

    // Create Payment ID in Phase 1 format
    const todayStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const paymentId = `PAY-${todayStr}-${randomSuffix}`;
    const voucherNo = `VCH-${randomSuffix}`;

    // Get default debit account
    const debitAccounts = this.getDebitAccounts();
    const defaultDebit = debitAccounts.find((a) => a.isDefault) || debitAccounts[0];

    // Generate Payment Voucher SVG for Document Deck & AI Verification
    const sampleVoucherSvg = generateSampleVoucherSvg({
      title: "DSA COMMISSION PAYOUT VOUCHER",
      beneficiary: payable.dsaAccountHolderName || payable.dsaName,
      accountNo: payable.dsaAccountNumber,
      ifsc: payable.dsaIfsc,
      amount: payable.netPayable,
      bankName: payable.dsaBankName,
      voucherNo,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      purpose: `Channel Commission Payout - File #${payable.fileId} (${payable.product})`,
    });
    const voucherDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(sampleVoucherSvg)}`;

    // Prepare Phase 1 Payment Object
    const newPayment: Payment = {
      id: paymentId,
      fileId: payable.fileId,
      category: "DSA_COMMISSION",
      categoryLabel: "DSA Channel Commission",
      method: payable.netPayable >= 200000 ? "RTGS" : "NEFT",
      branchId: payable.branchId,
      branchName: payable.branchName,
      paymentDate: new Date().toISOString().split("T")[0],
      purpose: `Channel Partner Commission - File #${payable.fileId} (${payable.product} @ ${payable.commissionRate}%)`,
      remarks: `Automated commission payout generated from Phase 2 Commission Payable #${payable.id}. DSA: ${payable.dsaName}`,

      // Beneficiary details from DSA
      beneficiaryName: payable.dsaAccountHolderName || payable.dsaName,
      accountNumber: payable.dsaAccountNumber,
      ifsc: payable.dsaIfsc,
      bankName: payable.dsaBankName,
      beneficiaryEmail: dsa.email,
      beneficiaryPhone: dsa.mobile,

      // Financials
      disbursalAmount: payable.disbursalAmount,
      commissionPercentage: payable.commissionRate,
      grossCommission: payable.grossCommission,
      tdsAdjustment: payable.totalAdjustments,
      netAmount: payable.netPayable,
      currency: "INR",

      // Debit Account
      debitAccountId: defaultDebit?.id,
      debitAccountName: defaultDebit?.accountIdentifier,
      debitAccountNumber: defaultDebit?.accountNumber,

      // Maker-Checker state
      status: "PENDING_CHECKER",
      bankStatus: "NOT_GENERATED",
      makerId: currentUser.id,
      makerName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Documents
      documents: [
        {
          id: `DOC-VCH-${Date.now()}`,
          name: `Commission_Voucher_${payable.fileId}.svg`,
          type: "DISBURSAL_VOUCHER",
          quality: "GOOD",
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.name,
          dataUrl: voucherDataUrl,
          notes: "Auto-generated DSA commission settlement voucher with RBI audit stamp.",
        },
      ],

      // Audit Trail
      auditTrail: [
        {
          id: `AUD-PAY-${Date.now()}-1`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "COMMISSION_PAYMENT_GENERATED",
          details: `Generated payment ${paymentId} from Commission Payable #${payable.id} for DSA ${payable.dsaName}, Net: ₹${payable.netPayable.toLocaleString("en-IN")}`,
        },
        {
          id: `AUD-PAY-${Date.now()}-2`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "SUBMITTED_TO_CHECKER",
          details: "Payment submitted to Checker approval queue with automated AI optical verification.",
        },
      ],

      // Phase 2 Traceability
      sourceType: "COMMISSION_PAYABLE",
      commissionPayableId: payable.id,
      disbursalId: payable.disbursalId,
      dsaId: payable.dsaId,
      dsaName: payable.dsaName,
      commissionRuleId: payable.commissionRuleId,
      commissionRuleVersion: payable.commissionRuleVersion,
      customerReference: payable.customerReference,
    };

    // Execute AI Optical Verification on new payment
    const aiResult = AIVerificationService.getLocalVerificationFallback(newPayment);
    newPayment.aiVerification = aiResult;

    // Save Payment in Phase 1 engine
    this.createPayment(newPayment);

    // Update Commission Payable status
    payable.status = "PAYMENT_GENERATED";
    payable.paymentId = paymentId;
    payable.auditTrail.unshift({
      id: `AUD-GEN-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: "PAYMENT_GENERATED",
      details: `Generated Phase 1 Payment #${paymentId} for ₹${payable.netPayable.toLocaleString("en-IN")}. Routed to Checker Queue.`,
    });
    this.saveCommissionPayables(payables);

    this.addNotification({
      title: "Commission Payment Generated",
      message: `Payment ${paymentId} (₹${payable.netPayable.toLocaleString("en-IN")}) generated for ${payable.dsaName} and sent to Checker.`,
      type: "success",
      paymentId,
      payableId: payable.id,
    });

    return { success: true, payment: newPayment };
  }

  static batchGeneratePayments(
    payableIds: string[],
    currentUser: UserProfile
  ): { successCount: number; errors: string[] } {
    let successCount = 0;
    const errors: string[] = [];

    for (const pid of payableIds) {
      const res = this.generatePaymentFromPayable(pid, currentUser);
      if (res.success) {
        successCount++;
      } else if (res.error) {
        errors.push(`${pid}: ${res.error}`);
      }
    }

    return { successCount, errors };
  }

  // ==========================================================================
  // RESET DEMO DATA HELPER
  // ==========================================================================
  static resetToDemoData() {
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.EXPORTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.BRANCHES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.DSAS);
    localStorage.removeItem(STORAGE_KEYS.COMMISSION_RULES);
    localStorage.removeItem(STORAGE_KEYS.DISBURSALS);
    localStorage.removeItem(STORAGE_KEYS.COMMISSION_PAYABLES);
    
    this.getBranches();
    this.getUsers();
    this.getDebitAccounts();
    this.getPayments();
    this.getBatches();
    this.getNotifications();
    this.getDSAs();
    this.getCommissionRules();
    this.getDisbursals();
    this.getCommissionPayables();
    this.notify();
  }
}
