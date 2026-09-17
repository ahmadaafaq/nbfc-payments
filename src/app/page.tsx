"use client";

import React, { useState, useEffect, Suspense } from "react";
import App from "../App";

function LoadingFallback() {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-slate-200">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 animate-spin opacity-80" />
        <div className="absolute inset-1 rounded-xl bg-slate-950 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-purple-500 animate-pulse" />
        </div>
      </div>
      <p className="text-sm font-medium tracking-wide text-slate-400">
        Loading MGM Payment Operations...
      </p>
    </div>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  );
}
