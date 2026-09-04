import React, { useState, useEffect } from "react";
import { AppHeader } from "./components/layout/AppHeader";
import { AppSidebar } from "./components/layout/AppSidebar";
import { OfflineIndicator } from "./components/layout/OfflineIndicator";
import { DashboardView } from "./components/views/DashboardView";
import { PaymentsListView } from "./components/views/PaymentsListView";
import { CreatePaymentView } from "./components/views/CreatePaymentView";
import { CheckerQueueView } from "./components/views/CheckerQueueView";
import { CheckerReviewWorkspace } from "./components/views/CheckerReviewWorkspace";
import { BankFilesView } from "./components/views/BankFilesView";
import { PaymentBatchesView } from "./components/views/PaymentBatchesView";
import { ReconciliationView } from "./components/views/ReconciliationView";
import { ReportsView } from "./components/views/ReportsView";
import { AIConsoleView } from "./components/views/AIConsoleView";
import { AdminView } from "./components/views/AdminView";
import { DSAMasterView } from "./components/views/phase2/DSAMasterView";
import { CommissionRulesView } from "./components/views/phase2/CommissionRulesView";
import { DisbursalsView } from "./components/views/phase2/DisbursalsView";
import { CommissionPayablesView } from "./components/views/phase2/CommissionPayablesView";
import { PayoutStatementsView } from "./components/views/phase2/PayoutStatementsView";
import { CommissionAnalyticsView } from "./components/views/phase2/CommissionAnalyticsView";
import { StorageService } from "./services/storageService";
import { ToastContainer } from "./components/common/ToastNotification";
import { Menu, X } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("dashboard");
  const [viewParams, setViewParams] = useState<any>({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [theme, setTheme] = useState<"light" | "dark">(StorageService.getTheme());

  // Auto-collapse sidebar when on Checker Review Desk to give maximum screen real estate
  useEffect(() => {
    if (currentView === "checker-review") {
      setIsSidebarCollapsed(true);
    } else {
      setIsSidebarCollapsed(false);
    }
  }, [currentView]);

  // Initialize theme and service worker
  useEffect(() => {
    const currentTheme = StorageService.getTheme();
    StorageService.setTheme(currentTheme);
    setTheme(currentTheme);

    // Register service worker for PWA offline caching
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch((err) => {
          console.warn("Service Worker registration notice:", err);
        });
      });
    }

    // Subscribe to state changes for pending counts and theme updates
    const handleStorageUpdate = () => {
      const activeTheme = StorageService.getTheme();
      setTheme(activeTheme);
      const payments = StorageService.getPayments();
      const count = payments.filter((p) => p.status === "PENDING_CHECKER").length;
      setPendingCount(count);
    };

    handleStorageUpdate();
    const unsub = StorageService.subscribe(handleStorageUpdate);
    return unsub;
  }, []);

  const handleNavigate = (view: string, params?: any) => {
    setCurrentView(view);
    if (params) setViewParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render Active Main View
  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView onNavigate={handleNavigate} />;
      case "payments":
        return <PaymentsListView onNavigate={handleNavigate} />;
      case "create-payment":
        return <CreatePaymentView onNavigate={handleNavigate} />;
      case "checker-queue":
        return <CheckerQueueView onNavigate={handleNavigate} />;
      case "checker-review":
        return (
          <CheckerReviewWorkspace
            paymentId={viewParams?.paymentId || "PAY-LDH-2024-001"}
            onNavigate={handleNavigate}
          />
        );
      case "bank-files":
        return <BankFilesView onNavigate={handleNavigate} />;
      case "batches":
        return <PaymentBatchesView onNavigate={handleNavigate} />;
      case "reconciliation":
        return <ReconciliationView onNavigate={handleNavigate} />;
      case "reports":
        return <ReportsView />;
      case "ai-verification":
        return <AIConsoleView />;
      case "admin":
        return <AdminView />;
      // Phase 2: DSA Channel Partner & Commission Engine Views
      case "dsa-master":
        return <DSAMasterView onNavigate={handleNavigate} />;
      case "commission-rules":
        return <CommissionRulesView onNavigate={handleNavigate} />;
      case "disbursals":
        return <DisbursalsView onNavigate={handleNavigate} />;
      case "commission-payables":
        return <CommissionPayablesView onNavigate={handleNavigate} />;
      case "payout-statements":
        return <PayoutStatementsView />;
      case "commission-analytics":
        return <CommissionAnalyticsView />;
      default:
        return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div
      id="mgm-app-root"
      className={`min-h-screen relative font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden ${
        theme === "dark" ? "text-slate-100" : "text-slate-900"
      }`}
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)"
            : "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Ambient Frosted Glass Background Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        {theme === "dark" ? (
          <>
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-600/30 blur-[120px]" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[120px]" />
            <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-pink-500/20 blur-[100px]" />
            <div className="absolute top-[65%] left-[5%] w-[420px] h-[420px] rounded-full bg-indigo-500/20 blur-[130px]" />
          </>
        ) : (
          <>
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full bg-purple-300/30 blur-[120px]" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-blue-300/25 blur-[120px]" />
            <div className="absolute top-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-indigo-200/30 blur-[100px]" />
            <div className="absolute top-[65%] left-[5%] w-[420px] h-[420px] rounded-full bg-slate-300/25 blur-[130px]" />
          </>
        )}
      </div>

      {/* Top Header with Frosted Glass Surface */}
      <div className="relative z-40">
        <AppHeader onNavigate={handleNavigate} currentView={currentView} />
      </div>

      {/* Mobile Navigation Toggle Strip */}
      <div className="lg:hidden relative z-30 flex items-center justify-between px-4 py-2.5 bg-white/5 backdrop-blur-2xl border-b border-white/10">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-white/90 px-3 py-1.5 rounded-xl border border-white/15 bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Navigation Menu</span>
        </button>

        <span className="text-xs font-bold text-purple-300 tracking-wide capitalize">
          {currentView.replace(/-/g, " ")}
        </span>
      </div>

      {/* Main Layout Area */}
      <div className="relative z-10 flex">
        {/* Persistent Frosted Glass Sidebar */}
        <AppSidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          pendingCount={pendingCount}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />

        {/* Dynamic Content Pane with Frosted Glass Canvas */}
        <main
          id="main-content-pane"
          className={`flex-1 min-w-0 transition-all duration-300 ${
            currentView === "checker-review"
              ? "p-2 sm:p-4 lg:p-6 w-full max-w-none"
              : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"
          }`}
        >
          {renderContent()}
        </main>
      </div>

      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Floating In-App Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
