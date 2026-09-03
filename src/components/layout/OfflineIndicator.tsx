import React, { useState, useEffect } from "react";
import { WifiOff, AlertCircle } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 right-4 z-50 max-w-md p-3.5 rounded-xl bg-rose-600 text-white shadow-2xl flex items-start gap-3 border border-rose-500 animate-bounce"
    >
      <div className="p-1 rounded-lg bg-rose-700">
        <WifiOff className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-bold flex items-center gap-1.5">
          <span>You are offline</span>
          <span className="text-[10px] bg-rose-800 px-1.5 py-0.2 rounded font-mono">READ-ONLY</span>
        </div>
        <p className="text-[11px] text-rose-100 mt-0.5 leading-snug">
          Payment submission and approval require an active connection. Financial operations are disabled until network is restored.
        </p>
      </div>
    </div>
  );
};
