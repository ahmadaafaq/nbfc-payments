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
} from "../types";
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_DEBIT_ACCOUNTS,
  INITIAL_BATCHES,
  INITIAL_NOTIFICATIONS,
  generateInitialPayments,
} from "./seedData";

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

  // Reset demo data helper
  static resetToDemoData() {
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.EXPORTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.BRANCHES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    this.getBranches();
    this.getUsers();
    this.getDebitAccounts();
    this.getPayments();
    this.getBatches();
    this.getNotifications();
    this.notify();
  }
}
