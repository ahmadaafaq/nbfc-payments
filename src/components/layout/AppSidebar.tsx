import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CreditCard,
  Layers,
  CheckSquare,
  FileSpreadsheet,
  ArrowLeftRight,
  BarChart3,
  Sparkles,
  Settings,
  PlusCircle,
  Code2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Percent,
  FileText,
  Printer,
  TrendingUp,
  Sliders,
} from "lucide-react";
import { StorageService } from "../../services/storageService";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
  roles?: string[];
}

interface AppSidebarProps {
  currentView: string;
  onNavigate: (viewId: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  pendingCount?: number;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onNavigate,
  isMobileOpen,
  setIsMobileOpen,
  pendingCount = 6,
  isCollapsed = false,
  setIsCollapsed,
}) => {
  const currentUser = StorageService.getCurrentUser();

  const phase2Views = [
    "dsa-master",
    "commission-rules",
    "disbursals",
    "commission-payables",
    "payout-statements",
    "commission-analytics",
  ];

  const [selectedPhase, setSelectedPhase] = useState<"PHASE_1" | "PHASE_2">(
    phase2Views.includes(currentView) ? "PHASE_2" : "PHASE_1"
  );

  useEffect(() => {
    if (phase2Views.includes(currentView)) {
      setSelectedPhase("PHASE_2");
    } else {
      setSelectedPhase("PHASE_1");
    }
  }, [currentView]);

  const phase1Items: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
    },
    {
      id: "batches",
      label: "Payment Batches",
      icon: Layers,
    },
    {
      id: "checker-queue",
      label: "Checker Queue",
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-500/40 font-bold",
    },
    {
      id: "bank-files",
      label: "Bank Files",
      icon: FileSpreadsheet,
    },
    {
      id: "reconciliation",
      label: "Reconciliation",
      icon: ArrowLeftRight,
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
    },
    {
      id: "ai-verification",
      label: "AI Verification",
      icon: Sparkles,
      badge: "Gemini",
      badgeColor: "bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/20 dark:text-purple-300 font-bold dark:border-purple-400/30",
    },
    {
      id: "admin",
      label: "Administration",
      icon: Settings,
    },
  ];

  const phase2Items: NavItem[] = [
    {
      id: "dsa-master",
      label: "DSA Channel Partners",
      icon: Users,
    },
    {
      id: "commission-rules",
      label: "Commission Schemes",
      icon: Percent,
    },
    {
      id: "disbursals",
      label: "Disbursals & Upload",
      icon: FileText,
    },
    {
      id: "commission-payables",
      label: "Payables & Hold Desk",
      icon: CreditCard,
      badge: "Auto TDS",
      badgeColor: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold dark:border-emerald-400/30",
    },
    {
      id: "payout-statements",
      label: "Payout Statements",
      icon: Printer,
    },
    {
      id: "commission-analytics",
      label: "Commission Analytics",
      icon: TrendingUp,
    },
  ];

  const activeNavItems = selectedPhase === "PHASE_1" ? phase1Items : phase2Items;

  const handleItemClick = (id: string) => {
    onNavigate(id);
    setIsMobileOpen(false);
  };

  const isMaker = currentUser.role === "MAKER" || currentUser.role === "ADMIN";

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] bg-slate-100/95 dark:bg-black/30 backdrop-blur-2xl border-r border-slate-200/90 dark:border-white/10 flex flex-col justify-between transition-all duration-300 lg:translate-x-0 ${
          isCollapsed ? "lg:w-18 p-2.5" : "lg:w-64 p-4"
        } ${
          isMobileOpen ? "translate-x-0 w-64 shadow-2xl p-4" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-3">
          {/* Top Collapse Toggle on Desktop */}
          {setIsCollapsed && (
            <div className="hidden lg:flex items-center justify-between pb-1">
              {!isCollapsed && (
                <span className="text-[11px] uppercase tracking-wider text-slate-600 dark:text-white/50 font-black px-2">
                  MGM Workspace
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`p-1.5 rounded-xl text-slate-700 dark:text-white/60 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition border border-transparent hover:border-slate-300 dark:hover:border-white/15 ${
                  isCollapsed ? "mx-auto" : "ml-auto"
                }`}
                title={isCollapsed ? "Expand Navigation Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Phase 1 vs Phase 2 Mode Toggle */}
          {!isCollapsed ? (
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] font-bold">
              <button
                onClick={() => {
                  setSelectedPhase("PHASE_1");
                  if (phase2Views.includes(currentView)) onNavigate("dashboard");
                }}
                className={`py-1.5 px-2 rounded-lg text-center transition ${
                  selectedPhase === "PHASE_1"
                    ? "bg-purple-600 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Phase 1: Ops
              </button>
              <button
                onClick={() => {
                  setSelectedPhase("PHASE_2");
                  if (!phase2Views.includes(currentView)) onNavigate("dsa-master");
                }}
                className={`py-1.5 px-2 rounded-lg text-center transition ${
                  selectedPhase === "PHASE_2"
                    ? "bg-purple-600 text-white shadow-sm font-black"
                    : "text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Phase 2: DSA
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const nextPhase = selectedPhase === "PHASE_1" ? "PHASE_2" : "PHASE_1";
                setSelectedPhase(nextPhase);
                onNavigate(nextPhase === "PHASE_1" ? "dashboard" : "dsa-master");
              }}
              title={`Switch to ${selectedPhase === "PHASE_1" ? "Phase 2: DSA Commission" : "Phase 1: Payment Ops"}`}
              className="w-full py-1.5 rounded-lg text-[10px] font-black bg-purple-600 text-white text-center shadow"
            >
              {selectedPhase === "PHASE_1" ? "P1" : "P2"}
            </button>
          )}

          {/* Primary Action Button */}
          {selectedPhase === "PHASE_1" && isMaker && (
            <button
              id="sidebar-create-payment-btn"
              onClick={() => handleItemClick("create-payment")}
              title="Create Payment"
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all shadow-md border active:scale-95 ${
                isCollapsed ? "py-2.5 px-2" : "py-2.5 px-4"
              } ${
                currentView === "create-payment"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-white/30 shadow-purple-900/50 ring-2 ring-purple-400/40"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-white/20 shadow-purple-900/30"
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Create Payment</span>}
            </button>
          )}

          {selectedPhase === "PHASE_2" && (
            <button
              id="sidebar-disbursals-btn"
              onClick={() => handleItemClick("disbursals")}
              title="Record Disbursal"
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all shadow-md border active:scale-95 ${
                isCollapsed ? "py-2.5 px-2" : "py-2.5 px-4"
              } ${
                currentView === "disbursals"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white border-white/30 shadow-purple-900/50 ring-2 ring-purple-400/40"
                  : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white border-white/20 shadow-purple-900/30"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Record Disbursal</span>}
            </button>
          )}

          {/* Nav List */}
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  title={item.label}
                  className={`w-full flex items-center rounded-xl text-xs transition-all group ${
                    isCollapsed
                      ? "justify-center py-2.5 px-2"
                      : "justify-between px-3.5 py-2.5"
                  } ${
                    isActive
                      ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/25 border border-purple-500"
                      : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/80 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/5 border border-transparent font-medium"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 dark:text-white/40 group-hover:text-slate-900 dark:group-hover:text-white"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] leading-none ${
                        isActive
                          ? "bg-white/20 text-white font-bold"
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge !== undefined && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-slate-950" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Quick Card: Powered by Codevamp Technologies */}
        {isCollapsed ? (
          <div className="pt-2 flex justify-center">
            <a
              href="https://www.codevampt.tech"
              target="_blank"
              rel="noopener noreferrer"
              title="Powered by Codevamp Technologies • www.codevampt.tech"
              className="p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-white/10 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-white/10 transition-colors flex items-center justify-center shadow-xs"
            >
              <Code2 className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white/70 space-y-1.5 shadow-sm transition-all">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-white/70 text-xs">
              <Code2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>Powered by</span>
            </div>
            <div className="font-black text-xs text-slate-950 dark:text-white">
              Codevamp Technologies
            </div>
            <a
              href="https://www.codevampt.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors underline"
            >
              <span>www.codevampt.tech</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-[10px] leading-relaxed text-slate-600 dark:text-white/50 font-medium">
              Enterprise FinTech &amp; Workflow Automation
            </p>
          </div>
        )}
      </aside>
    </>
  );
};

