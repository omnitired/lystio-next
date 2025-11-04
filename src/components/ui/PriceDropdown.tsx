import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";

interface PriceDropdownProps {
  onClose?: () => void;
  onApply?: (min: string | null, max: string | null, showPriceOnRequest: boolean) => void;
  onPriceUpdate?: (min: string, max: string, showPriceOnRequest: boolean) => void;
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

export function PriceDropdown({ onClose, onApply, onPriceUpdate, isOpen = true }: PriceDropdownProps) {
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

  // Notify parent when showPriceOnRequest changes
  useEffect(() => {
    onPriceUpdate?.(minPrice, maxPrice, showPriceOnRequest);
  }, [showPriceOnRequest]);

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
                  onPriceUpdate?.(price, maxPrice, showPriceOnRequest);
                  setActiveDropdown("max");
                } else if (activeDropdown === "max") {
                  setMaxPrice(price);
                  onPriceUpdate?.(minPrice, price, showPriceOnRequest);
                  setActiveDropdown(null);
                }
              }}
              disabled={isDisabled}
              className={`flex gap-2.5 items-center justify-between px-3 py-2 rounded text-left ${
                isSelected ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${isMax ? "flex-row-reverse text-right" : "flex-row"}` }
            >
              <span className={`flex-1 text-sm font-medium text-black leading-[1.6]`}>
                {price}
              </span>
              {isSelected && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.5868 13.4148L7.75775 10.5868L6.34375 12.0008L10.5868 16.2438L17.6567 9.17281L16.2437 7.75781L10.5868 13.4148Z" fill="#A540F3"/>
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
        className="flex gap-2 items-center p-3 border-t border-[#f2f2f2] w-full text-left cursor-pointer "
      >
        <div className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded-sm border-brand-purple-200 ${showPriceOnRequest ? "bg-brand-purple" : "bg-white"}`}>
          {showPriceOnRequest && (
            <svg width="10" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
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
