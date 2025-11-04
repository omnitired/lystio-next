import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";

type HeaderMode = "rent" | "buy" | "ai";

interface HeaderProps {
  mode?: HeaderMode;
  onModeChange?: (mode: HeaderMode) => void;
}

interface ToggleOption {
  value: HeaderMode;
  label: string | React.ReactNode;
}

const toggleOptions: ToggleOption[] = [
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
  {
    value: "ai",
    label: (
      <>
        <span className="text-black">Lystio </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#a540f3] to-[#5110e8] font-semibold">
          AI
        </span>
      </>
    ),
  },
];

export function Header({ mode = "rent", onModeChange }: HeaderProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeIndex = toggleOptions.findIndex((opt) => opt.value === mode);
    const activeButton = buttonsRef.current[activeIndex];

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [mode]);

  return (
    <header className="bg-white h-20 relative flex items-center justify-center">
      {/* Logo */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center">
          <Image src="/lystio-logo.svg" alt="Lystio Logo" width={80} height={37} />
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-bg-light border border-border-light rounded-full p-1 flex gap-1 relative">
        {/* Animated Indicator */}
        <div
          className="absolute top-1 bg-white border border-white rounded-full transition-all duration-300 ease-out"
          style={{
            left: `${indicatorStyle.left}px`,
            width: `${indicatorStyle.width}px`,
            height: "calc(100% - 8px)",
          }}
        />

        {/* Toggle Buttons */}
        {toggleOptions.map((option, index) => (
          <button
            key={option.value}
            ref={(el) => {
              buttonsRef.current[index] = el;
            }}
            onClick={() => onModeChange?.(option.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors relative z-10 font-[family-name:var(--font-plus-jakarta-sans)] ${
              mode === option.value
                ? "text-text-primary"
                : "text-black hover:bg-white/50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </header>
  );
}
