import React from "react";

type HeaderMode = "rent" | "buy" | "ai";

interface HeaderProps {
  mode?: HeaderMode;
  onModeChange?: (mode: HeaderMode) => void;
}

export function Header({ mode = "rent", onModeChange }: HeaderProps) {
  return (
    <header className="bg-white h-20 relative flex items-center justify-center border-b border-border-light">
      {/* Logo */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2">
        <div className="w-20 h-[37.36px] flex items-center justify-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-[#a540f3] to-[#5110e8] bg-clip-text text-transparent">
            lystio
          </span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-bg-light border border-border-light rounded-full p-1 flex gap-1">
        <button
          onClick={() => onModeChange?.("rent")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            mode === "rent"
              ? "bg-white border border-white text-text-primary"
              : "text-black hover:bg-white/50"
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => onModeChange?.("buy")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            mode === "buy"
              ? "bg-white border border-white text-text-primary"
              : "text-black hover:bg-white/50"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => onModeChange?.("ai")}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            mode === "ai"
              ? "bg-white border border-white text-text-primary"
              : "text-black hover:bg-white/50"
          }`}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#a540f3] to-[#5110e8]">
            Lystio AI
          </span>
        </button>
      </div>
    </header>
  );
}
