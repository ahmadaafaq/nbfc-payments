import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Users,
  CreditCard,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Search,
  Phone,
  MapPin,
  Mail,
  Briefcase,
  Layers,
  Wallet,
  Landmark,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Branch, UserProfile, DebitAccount, UserRole } from "../../types";
import { AmbientInfoButton } from "../common/AmbientInfoButton";
import { ConfirmModal } from "../common/ConfirmModal";
import { showToast } from "../common/ToastNotification";

export const AdminView: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>(StorageService.getBranches());
  const [users, setUsers] = useState<UserProfile[]>(StorageService.getUsers());
  const [accounts, setAccounts] = useState<DebitAccount[]>(StorageService.getDebitAccounts());

  // Listen to StorageService changes
  useEffect(() => {
    const unsubscribe = StorageService.subscribe(() => {
      setBranches(StorageService.getBranches());
      setUsers(StorageService.getUsers());
      setAccounts(StorageService.getDebitAccounts());
    });
    return unsubscribe;
  }, []);

  // --- BRANCH CRUD STATE ---
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState<Omit<Branch, "id">>({
    name: "",
    code: "",
    status: "ACTIVE",
    city: "",
    state: "",
    address: "",
    contactNumber: "",
  });
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

  // --- ACCOUNT CRUD STATE ---
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DebitAccount | null>(null);
  const [accountForm, setAccountForm] = useState<Omit<DebitAccount, "id">>({
    bankName: "IDFC FIRST Bank",
    accountNumber: "",
    accountIdentifier: "",
    accountName: "",
    ifsc: "",
    branchName: "",
    balance: 5000000,
    currency: "INR",
    isDefault: false,
  });
  const [accountToDelete, setAccountToDelete] = useState<DebitAccount | null>(null);

  // --- USER & ROLE MAPPING CRUD STATE ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState<Omit<UserProfile, "id">>({
    name: "",
    email: "",
    role: "MAKER",
    branchId: branches[0]?.id || "",
    branchName: branches[0]?.name || "",
    department: "Operations",
  });
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Active Tab for Admin Navigation
  const [activeTab, setActiveTab] = useState<"all" | "branches" | "accounts" | "users">("all");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");

  // ================= BRANCH HANDLERS =================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      name: "",
      code: "",
      status: "ACTIVE",
      city: "",
      state: "Punjab",
      address: "",
      contactNumber: "",
    });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name,
      code: branch.code,
      status: branch.status,
      city: branch.city,
      state: branch.state,
      address: branch.address,
      contactNumber: branch.contactNumber,
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.name.trim() || !branchForm.code.trim()) {
      showToast("Branch Name and Code are required", "danger");
      return;
    }

    if (editingBranch) {
      const updated: Branch = {
        ...editingBranch,
        ...branchForm,
      };
      StorageService.updateBranch(updated);
      showToast(`Branch ${updated.name} updated successfully`, "success");
    } else {
      const newBranch: Branch = {
        id: `br-${Date.now()}`,
        ...branchForm,
      };
      StorageService.addBranch(newBranch);
      showToast(`Branch ${newBranch.name} added successfully`, "success");
    }
    setIsBranchModalOpen(false);
  };

  const handleConfirmDeleteBranch = () => {
    if (!branchToDelete) return;
    const success = StorageService.deleteBranch(branchToDelete.id);
    if (success) {
      showToast(`Branch ${branchToDelete.name} deleted`, "info");
    } else {
      showToast("Cannot delete the last remaining branch", "danger");
    }
    setBranchToDelete(null);
  };

  // ================= ACCOUNT HANDLERS =================
  const handleOpenAddAccount = () => {
    setEditingAccount(null);
    setAccountForm({
      bankName: "IDFC FIRST Bank",
      accountNumber: "",
      accountIdentifier: "",
      accountName: "Disbursal Pool",
      ifsc: "IDFB0020101",
      branchName: "Corporate Banking Branch",
      balance: 5000000,
      currency: "INR",
      isDefault: accounts.length === 0,
    });
    setIsAccountModalOpen(true);
  };

  const handleOpenEditAccount = (acc: DebitAccount) => {
    setEditingAccount(acc);
    setAccountForm({
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      accountIdentifier: acc.accountIdentifier || "",
      accountName: acc.accountName || "",
      ifsc: acc.ifsc,
      branchName: acc.branchName,
      balance: acc.balance,
      currency: acc.currency,
      isDefault: acc.isDefault,
    });
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.bankName.trim() || !accountForm.accountNumber.trim() || !accountForm.ifsc.trim()) {
      showToast("Bank Name, Account Number and IFSC are required", "danger");
      return;
    }

    if (editingAccount) {
      const updated: DebitAccount = {
        ...editingAccount,
        ...accountForm,
        accountIdentifier: accountForm.accountIdentifier || `${accountForm.bankName} - ${accountForm.accountNumber.slice(-4)}`,
      };
      StorageService.updateDebitAccount(updated);
      showToast(`Account ${updated.accountName || updated.bankName} updated successfully`, "success");
    } else {
      const newAccount: DebitAccount = {
        id: `acc-${Date.now()}`,
        ...accountForm,
        accountIdentifier: accountForm.accountIdentifier || `${accountForm.bankName} - ${accountForm.accountNumber.slice(-4)}`,
      };
      StorageService.addDebitAccount(newAccount);
      showToast(`Corporate Account ${newAccount.accountName || newAccount.bankName} added successfully`, "success");
    }
    setIsAccountModalOpen(false);
  };

  const handleConfirmDeleteAccount = () => {
    if (!accountToDelete) return;
    const success = StorageService.deleteDebitAccount(accountToDelete.id);
    if (success) {
      showToast(`Corporate account deleted`, "info");
    } else {
      showToast("Cannot delete the last remaining corporate account", "danger");
    }
    setAccountToDelete(null);
  };

  // ================= USER & ROLE HANDLERS =================
  const handleOpenAddUser = () => {
    setEditingUser(null);
    const firstBranch = branches[0];
    setUserForm({
      name: "",
      email: "",
      role: "MAKER",
      branchId: firstBranch?.id || "",
      branchName: firstBranch?.name || "",
      department: "Treasury Operations",
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      branchId: user.branchId,
      branchName: user.branchName,
      department: user.department,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      showToast("Name and Email are required", "danger");
      return;
    }

    const selectedBranch = branches.find((b) => b.id === userForm.branchId) || branches[0];
    const branchName = selectedBranch ? selectedBranch.name : userForm.branchName;

    if (editingUser) {
      const updated: UserProfile = {
        ...editingUser,
        ...userForm,
        branchName,
      };
      StorageService.updateUser(updated);
      showToast(`User ${updated.name} updated successfully`, "success");
    } else {
      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        ...userForm,
        branchName,
      };
      StorageService.addUser(newUser);
      showToast(`User ${newUser.name} provisioned as ${newUser.role}`, "success");
    }
    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const success = StorageService.deleteUser(userToDelete.id);
    if (success) {
      showToast(`User ${userToDelete.name} removed`, "info");
    } else {
      showToast("Cannot delete the last remaining user", "danger");
    }
    setUserToDelete(null);
  };

  // Search filtering
  const q = searchQuery.toLowerCase();
  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.code.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q)
  );

  const filteredAccounts = accounts.filter(
    (a) =>
      a.bankName.toLowerCase().includes(q) ||
      (a.accountName && a.accountName.toLowerCase().includes(q)) ||
      a.accountNumber.includes(q) ||
      a.ifsc.toLowerCase().includes(q)
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.branchName.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q)
  );

  return (
    <div id="admin-view" className="space-y-6 animate-in fade-in duration-200 text-white">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-card border border-white/15 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight text-white">
              Administration &amp; Master Data Governance
            </h1>
            <AmbientInfoButton
              id="admin-screen-guide"
              title="Administration & Master Data Governance"
              subtitle="Dual-Control Policies, User Provisioning & Account Hierarchy"
              description="Full CRUD management console for operational branches, authorized corporate disbursement pools, and authorized personnel & dual-control role mappings per RBI IT governance mandates."
              roleNote="System Admin Only"
              slaNote="System Uptime: 99.99%"
              buttonLabel="Screen Guide"
              variant="screen"
              size="sm"
              steps={[
                {
                  step: 1,
                  label: "Branch Master CRUD",
                  detail: "Add, edit, or remove operational branches with branch code identifiers, contact info, and status.",
                },
                {
                  step: 2,
                  label: "Corporate Accounts CRUD",
                  detail: "Maintain institutional debit accounts (IDFC FIRST, HDFC, Axis) and disbursal liquidity balances.",
                },
                {
                  step: 3,
                  label: "Personnel & Role Mapping CRUD",
                  detail: "Provision and configure Maker, Checker, Admin, and Finance users with branch assignments.",
                },
              ]}
              keyFeatures={[
                {
                  title: "Add / Edit / Delete Capabilities",
                  desc: "Complete operational lifecycle control for all branches, accounts, and user roles.",
                },
                {
                  title: "Segregation of Duties",
                  desc: "Strict Maker vs. Checker role separation enforced across payment creation and approvals.",
                },
                {
                  title: "Real-time Persistence",
                  desc: "All configuration updates sync instantly across transaction submission and clearance flows.",
                },
              ]}
            />
          </div>
          <p className="text-xs text-white/60 mt-1">
            Manage MGM branch directories, corporate debit pools, and authorized personnel role mappings.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAddBranch}
            className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Branch</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddAccount}
            className="px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Account</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* 2. System Health & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl glass-card border border-white/10 shadow-lg">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === "all"
                ? "bg-purple-600 text-white shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            Overview ({branches.length + accounts.length + users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("branches")}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "branches"
                ? "bg-purple-600 text-white shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Branches ({branches.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "accounts"
                ? "bg-purple-600 text-white shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Corporate Accounts ({accounts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === "users"
                ? "bg-purple-600 text-white shadow-md font-bold"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Personnel &amp; Roles ({users.length})</span>
          </button>
        </div>

        {/* Search Box */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search branches, accounts, personnel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-white/40 focus:ring-1 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* 3. SECTION: Branches & Corporate Debit Accounts Grid */}
      {(activeTab === "all" || activeTab === "branches" || activeTab === "accounts") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* BRANCHES SECTION */}
          {(activeTab === "all" || activeTab === "branches") && (
            <div
              id="admin-branches-panel"
              className={`rounded-3xl glass-card p-6 space-y-4 shadow-xl border border-white/15 ${
                activeTab === "branches" ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-purple-300">
                  <Building2 className="w-4 h-4" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                    MGM Branch Directory ({filteredBranches.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBranch}
                  className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[11px] font-bold border border-purple-500/30 flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Branch</span>
                </button>
              </div>

              <div className="divide-y divide-white/5 text-xs space-y-2">
                {filteredBranches.map((b) => (
                  <div
                    key={b.id}
                    className="pt-2 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 p-2 rounded-2xl transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{b.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                          {b.code}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                            b.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                              : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/60 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>{b.address ? `${b.address}, ` : ""}{b.city}, {b.state}</span>
                      </div>
                      {b.contactNumber && (
                        <div className="text-[10px] text-white/40 flex items-center gap-1 font-mono">
                          <Phone className="w-2.5 h-2.5 text-blue-400" />
                          <span>{b.contactNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBranch(b)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition"
                        title="Edit Branch"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBranchToDelete(b)}
                        disabled={branches.length <= 1}
                        className={`p-1.5 rounded-lg border transition ${
                          branches.length <= 1
                            ? "opacity-30 cursor-not-allowed bg-white/5 border-white/5 text-white/30"
                            : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
                        }`}
                        title={branches.length <= 1 ? "Cannot delete the only branch" : "Delete Branch"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {filteredBranches.length === 0 && (
                  <div className="p-4 text-center text-white/50 text-xs">
                    No branches matched your search query.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CORPORATE DEBIT ACCOUNTS SECTION */}
          {(activeTab === "all" || activeTab === "accounts") && (
            <div
              id="admin-accounts-panel"
              className={`rounded-3xl glass-card p-6 space-y-4 shadow-xl border border-white/15 ${
                activeTab === "accounts" ? "lg:col-span-2" : ""
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-purple-300">
                  <CreditCard className="w-4 h-4" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                    Authorized Corporate Accounts ({filteredAccounts.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddAccount}
                  className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[11px] font-bold border border-blue-500/30 flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Account</span>
                </button>
              </div>

              <div className="divide-y divide-white/5 text-xs space-y-2">
                {filteredAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="pt-2 pb-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 p-2 rounded-2xl transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">
                          {acc.bankName} {acc.accountName ? `— ${acc.accountName}` : ""}
                        </span>
                        {acc.isDefault && (
                          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            DEFAULT POOL
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/50 font-mono">
                        A/C: {acc.accountNumber} • IFSC: {acc.ifsc}
                      </div>
                      <div className="text-[10px] text-white/40">
                        Branch: {acc.branchName || "Corporate Banking Division"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-bold block text-sm">
                          ₹{(acc.balance || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[9px] text-white/40">Available Liquidity</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditAccount(acc)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition"
                          title="Edit Corporate Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountToDelete(acc)}
                          disabled={accounts.length <= 1}
                          className={`p-1.5 rounded-lg border transition ${
                            accounts.length <= 1
                              ? "opacity-30 cursor-not-allowed bg-white/5 border-white/5 text-white/30"
                              : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
                          }`}
                          title={accounts.length <= 1 ? "Cannot delete the only account" : "Delete Account"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAccounts.length === 0 && (
                  <div className="p-4 text-center text-white/50 text-xs">
                    No corporate accounts matched your search query.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SECTION: Authorized Personnel & Role Mapping Table */}
      {(activeTab === "all" || activeTab === "users") && (
        <div
          id="admin-personnel-panel"
          className="rounded-3xl glass-card p-6 space-y-4 shadow-xl border border-white/15"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2 text-purple-300">
              <Users className="w-4 h-4" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                Authorized Personnel &amp; Role Mapping ({filteredUsers.length} Users)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleOpenAddUser}
              className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
            >
              <Plus className="w-3 h-3" />
              <span>Provision User</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-white/50 font-bold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Personnel Name</th>
                  <th className="p-3.5">Email / Login</th>
                  <th className="p-3.5">Assigned Role</th>
                  <th className="p-3.5">Branch Jurisdiction</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Governance Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/15 flex items-center justify-center font-bold text-[11px] text-purple-200">
                        {u.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-white/70">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                            : u.role === "CHECKER"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : u.role === "MAKER"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-white/80">{u.branchName || "All Branches"}</td>
                    <td className="p-3.5 text-white/60">{u.department || "Operations"}</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition"
                          title="Edit User Role"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          disabled={users.length <= 1}
                          className={`p-1.5 rounded-lg border transition ${
                            users.length <= 1
                              ? "opacity-30 cursor-not-allowed bg-white/5 border-white/5 text-white/30"
                              : "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
                          }`}
                          title={users.length <= 1 ? "Cannot delete the only user" : "Delete User"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-white/50 text-xs">
                      No personnel matched your search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT BRANCH ================= */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-white/20 bg-slate-950/95 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-300">
                <Building2 className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {editingBranch ? "Edit Branch Details" : "Add New Operational Branch"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Branch Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ludhiyana (Main)"
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Branch Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LUD, MUM, KOT"
                    value={branchForm.code}
                    onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Ludhiana"
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Punjab"
                    value={branchForm.state}
                    onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-1">Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. Ferozepur Road, Near Aarti Chowk"
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 161 240 1100"
                    value={branchForm.contactNumber}
                    onChange={(e) => setBranchForm({ ...branchForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Operational Status</label>
                  <select
                    value={branchForm.status}
                    onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                    className="w-full px-3 py-2 rounded-xl glass-dropdown text-white focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="ACTIVE" className="bg-slate-900 text-white">ACTIVE</option>
                    <option value="INACTIVE" className="bg-slate-900 text-white">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition shadow-md"
                >
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ACCOUNT ================= */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-white/20 bg-slate-950/95 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-blue-300">
                <CreditCard className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {editingAccount ? "Edit Corporate Account" : "Add Corporate Bank Account"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Bank Institution <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IDFC FIRST Bank, HDFC Bank"
                    value={accountForm.bankName}
                    onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Account Name / Pool Purpose
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Disbursal Pool"
                    value={accountForm.accountName}
                    onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Account Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10084729104"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    IFSC Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IDFB0020101"
                    value={accountForm.ifsc}
                    onChange={(e) => setAccountForm({ ...accountForm, ifsc: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Available Pool Liquidity (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000000"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white font-mono focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">Branch Office</label>
                  <input
                    type="text"
                    placeholder="e.g. Corporate Banking Branch"
                    value={accountForm.branchName}
                    onChange={(e) => setAccountForm({ ...accountForm, branchName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="account-is-default"
                  checked={accountForm.isDefault}
                  onChange={(e) => setAccountForm({ ...accountForm, isDefault: e.target.checked })}
                  className="rounded border-white/20 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="account-is-default" className="text-xs text-white/80 cursor-pointer">
                  Set as <strong>Default Disbursal Source Account</strong> for new batches
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold transition shadow-md"
                >
                  {editingAccount ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT USER & ROLE MAPPING ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-white/20 bg-slate-950/95 shadow-2xl p-6 space-y-4 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-purple-300">
                <Users className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">
                  {editingUser ? "Edit Personnel & Role Mapping" : "Provision New Personnel"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Email / Login ID <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rajesh@mgm.com"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Assigned Role (Dual-Control) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 rounded-xl glass-dropdown text-white focus:ring-1 focus:ring-purple-400"
                  >
                    <option value="MAKER" className="bg-slate-900 text-white">MAKER (Uploads &amp; Drafts)</option>
                    <option value="CHECKER" className="bg-slate-900 text-white">CHECKER (Audits &amp; Authorizes)</option>
                    <option value="ADMIN" className="bg-slate-900 text-white">ADMIN (System Governance)</option>
                    <option value="FINANCE" className="bg-slate-900 text-white">FINANCE (Bank Files &amp; Recon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-white/80 mb-1">
                    Branch Jurisdiction <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={userForm.branchId}
                    onChange={(e) => {
                      const sel = branches.find((b) => b.id === e.target.value);
                      setUserForm({
                        ...userForm,
                        branchId: e.target.value,
                        branchName: sel ? sel.name : "",
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl glass-dropdown text-white focus:ring-1 focus:ring-purple-400"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/80 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Treasury Operations, Loan Disbursal"
                  value={userForm.department}
                  onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl glass-input text-white focus:ring-1 focus:ring-purple-400"
                />
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[11px]">
                <strong>RBI Segregation Policy:</strong> Makers cannot approve their own transactions. Checkers will review all disbursements with independent optical AI verification.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold transition shadow-md"
                >
                  {editingUser ? "Save Changes" : "Provision Personnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= CONFIRM MODALS FOR DELETIONS ================= */}
      {/* 1. Branch Deletion */}
      <ConfirmModal
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={handleConfirmDeleteBranch}
        title="Delete Operational Branch"
        description={`Are you sure you want to delete branch "${branchToDelete?.name}" (${branchToDelete?.code})? Users assigned to this branch should be reassigned.`}
        confirmText="Confirm Delete"
        variant="danger"
      />

      {/* 2. Account Deletion */}
      <ConfirmModal
        isOpen={!!accountToDelete}
        onClose={() => setAccountToDelete(null)}
        onConfirm={handleConfirmDeleteAccount}
        title="Delete Corporate Account"
        description={`Are you sure you want to delete account "${accountToDelete?.bankName} - ${accountToDelete?.accountNumber}"? Disbursal batches linked to this account may require reconfiguration.`}
        confirmText="Confirm Delete"
        variant="danger"
      />

      {/* 3. User Deletion */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDeleteUser}
        title="Remove Authorized Personnel"
        description={`Are you sure you want to revoke access and delete user "${userToDelete?.name}" (${userToDelete?.email}, Role: ${userToDelete?.role})?`}
        confirmText="Confirm Delete"
        variant="danger"
      />
    </div>
  );
};
