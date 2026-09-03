import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { StorageService } from "../../services/storageService";
import { Branch, UserProfile, InAppNotification, UserRole } from "../../types";
import { PWAInstallButton } from "../common/PWAInstallButton";

interface AppHeaderProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onNavigate }) => {
  const [branches, setBranches] = useState<Branch[]>(StorageService.getBranches());
  const [currentBranch, setCurrentBranch] = useState<Branch>(StorageService.getCurrentBranch());
  const [users, setUsers] = useState<UserProfile[]>(StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserProfile>(StorageService.getCurrentUser());
  const [theme, setThemeState] = useState<"light" | "dark">(StorageService.getTheme());
  const [notifications, setNotifications] = useState<InAppNotification[]>(StorageService.getNotifications());

  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const branchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      setBranches(StorageService.getBranches());
      setCurrentBranch(StorageService.getCurrentBranch());
      setUsers(StorageService.getUsers());
      setCurrentUser(StorageService.getCurrentUser());
      setNotifications(StorageService.getNotifications());
      setThemeState(StorageService.getTheme());
    });
    return unsub;
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setShowBranchMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    StorageService.setTheme(next);
  };

  const handleBranchSelect = (b: Branch) => {
    StorageService.setCurrentBranch(b.id);
    setShowBranchMenu(false);
  };

  const handleUserSelect = (u: UserProfile) => {
    StorageService.setCurrentUser(u.id);
    setShowUserMenu(false);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRoleBadge = (role: UserRole) => {
    const map: Record<UserRole, { label: string; color: string }> = {
      ADMIN: { label: "ADMIN", color: "bg-purple-500/20 text-purple-200 border-purple-400/30" },
      MAKER: { label: "MAKER", color: "bg-blue-500/20 text-blue-200 border-blue-400/30" },
      CHECKER: { label: "CHECKER", color: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" },
      FINANCE: { label: "FINANCE", color: "bg-amber-500/20 text-amber-200 border-amber-400/30" },
    };
    return map[role] || { label: role, color: "bg-white/10 text-white border-white/20" };
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header
      id="app-top-header"
      className="sticky top-0 z-40 w-full h-16 bg-white/[0.05] backdrop-blur-2xl border-b border-white/10 px-4 md:px-6 flex items-center justify-between transition-colors text-white shadow-xl"
    >
      {/* Left: Brand Identity & Mobile Title */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-purple-900/30 border border-white/20">
            MGM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm md:text-base tracking-tight text-white">
                MGM Payment Operations
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30">
                PHASE 1
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-medium hidden md:block">
              MGM Financiers Pvt Limited • NBFC
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="hidden lg:block h-6 w-px bg-white/10 mx-1" />

        {/* Branch Selector */}
        <div ref={branchRef} className="relative hidden sm:block">
          <button
            id="branch-selector-button"
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition text-left"
          >
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {currentBranch.name}
                </span>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-400/30">
                  ACTIVE
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </button>

          {showBranchMenu && (
            <div className="absolute left-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                Select MGM Branch (3 Active)
              </div>
              {branches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleBranchSelect(b)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition text-left ${
                    b.id === currentBranch.id
                      ? "bg-white/15 text-white font-bold border border-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div>
                    <div className="text-white font-medium">{b.name}</div>
                    <div className="text-[10px] text-white/40">{b.city}, {b.code}</div>
                  </div>
                  {b.id === currentBranch.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Demo Data Reset Quick Tool */}
        <button
          id="header-reset-demo-button"
          onClick={() => {
            if (window.confirm("Reset all MGM payments, batches, and audit logs to initial demo state?")) {
              StorageService.resetToDemoData();
            }
          }}
          title="Reset to fresh demo data"
          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition hidden lg:flex items-center gap-1.5 text-xs backdrop-blur-sm"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[11px] font-medium">Reset Demo</span>
        </button>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition backdrop-blur-md"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-300" />}
        </button>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            id="header-notifications-button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 border border-white/10 transition relative backdrop-blur-md"
            title="In-app Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-purple-900" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown overflow-hidden z-50 animate-in fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => StorageService.markAllNotificationsAsRead()}
                  className="text-[11px] text-purple-300 hover:text-purple-200 hover:underline font-medium"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (n.paymentId && onNavigate) {
                        onNavigate("checker-queue");
                        setShowNotifMenu(false);
                      }
                    }}
                    className={`p-3 text-left transition hover:bg-white/5 cursor-pointer ${
                      !n.read ? "bg-purple-500/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {n.type === "danger" ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-white">{n.title}</div>
                        <p className="text-[11px] text-white/60 mt-0.5 leading-normal">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-white/40 mt-1 block">{n.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role & User Switcher */}
        <div ref={userRef} className="relative">
          <button
            id="user-role-switcher-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition"
            title="Switch User Role (Maker / Checker / Admin / Finance)"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.color}`}
                >
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/40 ml-0.5" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-dropdown p-2 z-50 animate-in fade-in">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <div className="text-xs font-bold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-white/50">{currentUser.email}</div>
                <div className="text-[10px] text-purple-300 font-semibold mt-1">
                  Branch: {currentUser.branchName}
                </div>
              </div>

              <div className="px-2 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                Switch Operational Persona:
              </div>

              {users.map((u) => {
                const uRole = getRoleBadge(u.role);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleUserSelect(u)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left ${
                      u.id === currentUser.id
                        ? "bg-white/15 text-white font-bold border border-white/15"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{u.name}</div>
                      <div className="text-[10px] text-white/40">{u.department}</div>
                    </div>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${uRole.color}`}>
                      {uRole.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
