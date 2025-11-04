import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

interface PriceDropdownProps {
  onClose?: () => void;
  onApply?: (min: string | null, max: string | null, showPriceOnRequest: boolean) => void;
  isOpen?: boolean;
}

const priceOptions = [
  "No Minimum",
  "400€",
  "500€",
  "600€",
  "700€",
  "800€",
  "900€",
  "1.000€",
  "1.200€",
  "1.300€",
  "1.400€",
  "1.500€",
  "1.600€",
  "1.700€",
  "1.800€",
];

const maxPriceOptions = [
  "No Maximum",
  "400€",
  "500€",
  "600€",
  "700€",
  "800€",
  "900€",
  "1.000€",
  "1.200€",
  "1.300€",
  "1.400€",
  "1.500€",
  "1.600€",
  "1.700€",
  "1.800€",
];

export function PriceDropdown({ onClose, onApply, isOpen = true }: PriceDropdownProps) {
  const [minPrice, setMinPrice] = useState<string>("No Minimum");
  const [maxPrice, setMaxPrice] = useState<string>("No Maximum");
  const [showPriceOnRequest, setShowPriceOnRequest] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"min" | "max" | null>("min");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);
  const previousDropdownType = useRef<"min" | "max" | null>(null);
  const hasAnimatedIn = useRef(false);

  const getNumericValue = (price: string): number => {
    if (price === "No Minimum" || price === "No Maximum") return 0;
    return parseInt(price.replace(/[^0-9]/g, ""));
  };

  const isOptionDisabled = (price: string, dropdownType: "min" | "max"): boolean => {
    if (dropdownType === "max") {
      const minValue = getNumericValue(minPrice);
      const optionValue = getNumericValue(price);
      if (price === "No Maximum") return false;
      if (minPrice === "No Minimum") return false;
      return optionValue <= minValue;
    }

    if (dropdownType === "min") {
      const maxValue = getNumericValue(maxPrice);
      const optionValue = getNumericValue(price);
      if (price === "No Minimum") return false;
      if (maxPrice === "No Maximum") return false;
      return optionValue >= maxValue;
    }

    return false;
  };

  // Animate dropdown opening
  useEffect(() => {
    if (dropdownRef.current && isOpen && !hasAnimatedIn.current) {
      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          scaleY: 0,
          transformOrigin: "top center",
        },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            hasAnimatedIn.current = true;
          },
        }
      );
    }
  }, [isOpen]);

  // Animate dropdown closing
  useEffect(() => {
    if (!isOpen && hasAnimatedIn.current && dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (onClose) {
            onClose();
          }
        },
      });
    }
  }, [isOpen]);

  // Animate when switching between min/max
  useEffect(() => {
    if (optionsListRef.current && activeDropdown && previousDropdownType.current !== activeDropdown) {
      if (previousDropdownType.current !== null) {
        // Animate the switch with clean slide
        const direction = previousDropdownType.current === "min" ? -10 : 10;

        gsap.fromTo(
          optionsListRef.current,
          {
            opacity: 0,
            y: direction,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }
      previousDropdownType.current = activeDropdown;
    }
  }, [activeDropdown]);

  return (
    <div ref={dropdownRef} className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] w-full max-w-[424px] z-50 font-[family-name:var(--font-plus-jakarta-sans)]">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <p className="text-base font-semibold text-text-primary leading-[1.5]">
          Price Range
        </p>
      </div>

      {/* Min/Max Inputs */}
      <div className="flex gap-3 items-center px-3 py-2">
        {/* Min Dropdown */}
        <div className="flex-1 flex flex-col gap-2 max-w-[200px] relative">
          <label className="text-sm font-medium text-black leading-[1.6]">
            Min
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === "min" ? null : "min")}
            className={`border ${
              activeDropdown === "min" ? "border-2 border-brand-purple" : "border-border-light"
            } rounded-lg h-11 px-2.5 flex items-center justify-between`}
          >
            <span
              className={`text-sm font-medium leading-[1.6] ${
                minPrice === "No Minimum" ? "text-black opacity-40" : "text-black"
              }`}
            >
              {minPrice}
            </span>
          </button>
        </div>

        {/* Max Dropdown */}
        <div className="flex-1 flex flex-col gap-2 max-w-[200px] relative">
          <label className="text-sm font-medium text-black leading-[1.6]">
            Max
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === "max" ? null : "max")}
            className={`border ${
              activeDropdown === "max" ? "border-2 border-brand-purple" : "border-border-light"
            } rounded-lg h-11 px-2.5 flex items-center justify-between`}
          >
            <span
              className={`text-sm font-medium leading-[1.6] ${
                maxPrice === "No Maximum" ? "text-black opacity-40" : "text-black"
              }`}
            >
              {maxPrice}
            </span>
          </button>
        </div>
      </div>

      {/* Price Options List */}
      <div className="bg-white overflow-hidden">
        <div ref={optionsListRef} className="flex flex-col py-2 overflow-auto max-h-[300px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {(activeDropdown === "min" ? priceOptions : activeDropdown === "max" ? maxPriceOptions : []).map((price) => {
          const isSelected = activeDropdown === "min" ? price === minPrice : price === maxPrice;
          const isDisabled = activeDropdown ? isOptionDisabled(price, activeDropdown) : false;
          const isMax = activeDropdown === "max";

          return (
            <button
              key={price}
              onClick={() => {
                if (isDisabled) return;
                if (activeDropdown === "min") {
                  setMinPrice(price);
                  setActiveDropdown("max");
                } else if (activeDropdown === "max") {
                  setMaxPrice(price);
                  setActiveDropdown(null);
                }
              }}
              disabled={isDisabled}
              className={`flex gap-2.5 items-center justify-between px-3 py-2 rounded ${
                isSelected ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              <span className={`flex-1 text-sm font-medium text-black leading-[1.6] ${
                isMax ? "text-right" : "text-left"
              }`}>
                {price}
              </span>
              {isSelected && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#A540F3"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
        </div>
      </div>

      {/* Checkbox */}
      <button
        onClick={() => setShowPriceOnRequest(!showPriceOnRequest)}
        className="flex gap-2 items-center p-3 border-t border-[#f2f2f2] w-full text-left cursor-pointer hover:bg-bg-light transition-colors"
      >
        <div className="w-4 h-4 flex items-center justify-center shrink-0 border rounded-xs border-border-light">
          {showPriceOnRequest && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8L6.5 11.5L13 5"
                stroke="#A540F3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        <span className="flex-1 text-sm font-medium text-text-primary leading-[1.6]">
          Show listings with "Price on Request"
        </span>
      </button>
    </div>
  );
}
