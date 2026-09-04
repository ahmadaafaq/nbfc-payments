import React from "react";

interface MGMLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

export const MGMLogo: React.FC<MGMLogoProps> = ({
  size = "md",
  showText = true,
  showSubtitle = true,
  showBadge = true,
  className = "",
}) => {
  // Size mapping for the logo mark icon container
  const iconDimensions = {
    xs: "w-7 h-7 rounded-lg text-[10px]",
    sm: "w-8 h-8 rounded-xl text-xs",
    md: "w-10 h-10 rounded-xl text-sm",
    lg: "w-12 h-12 rounded-2xl text-base",
    xl: "w-16 h-16 rounded-3xl text-xl",
  };

  const textStyles = {
    xs: { title: "text-xs", sub: "text-[9px]" },
    sm: { title: "text-sm", sub: "text-[10px]" },
    md: { title: "text-base", sub: "text-[11px]" },
    lg: { title: "text-lg", sub: "text-xs" },
    xl: { title: "text-2xl", sub: "text-sm" },
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Precision Geometric SVG Icon Mark */}
      <div
        className={`relative shrink-0 flex items-center justify-center p-0.5 bg-gradient-to-br from-purple-500 via-indigo-600 to-emerald-500 shadow-lg shadow-purple-900/30 ${iconDimensions[size]}`}
      >
        <div className="w-full h-full rounded-[inherit] bg-slate-950 flex items-center justify-center overflow-hidden relative">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute inset-0 bg-radial-gradient from-purple-500/30 via-transparent to-transparent opacity-80 pointer-events-none" />

          {/* SVG Monogram Mark */}
          <svg
            viewBox="0 0 100 100"
            className="w-[82%] h-[82%] drop-shadow-md transform transition-transform group-hover:scale-105"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="mgmIconWingL" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
              <linearGradient id="mgmIconWingR" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="mgmIconCenter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>

            {/* Left Pillar */}
            <path
              d="M18 78 L18 36 C18 31 23 28 27 30 L42 38 C45 40 47 43 47 47 L47 78 C47 81 44 83 41 82 L24 74 C20 72 18 69 18 66 Z"
              fill="url(#mgmIconWingL)"
            />

            {/* Right Pillar */}
            <path
              d="M82 78 L82 36 C82 31 77 28 73 30 L58 38 C55 40 53 43 53 47 L53 78 C53 81 56 83 59 82 L76 74 C80 72 82 69 82 66 Z"
              fill="url(#mgmIconWingR)"
            />

            {/* Central Apex Shield */}
            <path
              d="M50 18 L64 42 C66 45 64 48 61 48 L39 48 C36 48 34 45 36 42 Z"
              fill="url(#mgmIconCenter)"
            />

            {/* Core Verification Check Node */}
            <circle cx="50" cy="56" r="6" fill="#10b981" />
            <path
              d="M47 56 L49 58 L53 54"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Golden Foundation Arc */}
            <path
              d="M30 78 C42 85 58 85 70 78"
              stroke="#fbbf24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Text Block */}
      {showText && (
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight text-white flex items-center gap-1.5 ${textStyles[size].title}`}
            >
              <span>MGM</span>
              <span className="text-purple-300 font-extrabold">Payment Operations</span>
            </span>

            {showBadge && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-gradient-to-r from-purple-500/25 to-blue-500/25 text-purple-200 border border-purple-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                DSA AUTOMATION
              </span>
            )}
          </div>

          {showSubtitle && (
            <p className={`text-white/60 font-medium tracking-wide truncate ${textStyles[size].sub}`}>
              MGM Financiers Pvt Limited • NBFC Operations
            </p>
          )}
        </div>
      )}
    </div>
  );
};
