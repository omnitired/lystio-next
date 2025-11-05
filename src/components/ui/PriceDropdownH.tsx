import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Dropdown } from "./Dropdown";
import { useHistogram, type HistogramParams } from "@/lib/searchCount";
import { formatPrice, generatePriceOptions, generateMaxPriceOptions, getNumericValue } from "@/lib/priceUtils";
import { Checkbox } from "./Checkbox";
import { useSlideAnimation } from "@/hooks/useSlideAnimation";

interface PriceDropdownProps {
  onClose?: () => void;
  onApply?: (min: string | null, max: string | null, showPriceOnRequest: boolean) => void;
  onPriceUpdate?: (min: string, max: string, showPriceOnRequest: boolean) => void;
  isOpen?: boolean;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialShowPriceOnRequest?: boolean;
  histogramParams?: HistogramParams | null;
}

export function PriceDropdown({ onClose, onApply, onPriceUpdate, isOpen = true, initialMinPrice, initialMaxPrice, initialShowPriceOnRequest, histogramParams }: PriceDropdownProps) {
  const { data: histogramData, isLoading: isLoadingHistogram } = useHistogram(histogramParams || null);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice || "No Minimum");
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice || "No Maximum");
  const [showPriceOnRequest, setShowPriceOnRequest] = useState(initialShowPriceOnRequest ?? false);
  const [activeDropdown, setActiveDropdown] = useState<"min" | "max" | null>(null);

  const optionsListRef = useRef<HTMLDivElement>(null);
  const previousDropdownType = useRef<"min" | "max" | null>(null);

  // Determine animation direction based on previous dropdown type
  const animationDirection = useMemo(() => {
    if (!previousDropdownType.current) return "down";
    return previousDropdownType.current === "min" ? "left" : "right";
  }, [activeDropdown]); // eslint-disable-line react-hooks/exhaustive-deps

  // Animate when switching between min/max
  useSlideAnimation(optionsListRef, activeDropdown, { direction: animationDirection });

  // Update previous dropdown type after animation
  useEffect(() => {
    if (activeDropdown) {
      previousDropdownType.current = activeDropdown;
    }
  }, [activeDropdown]);

  // Generate price options from histogram data
  const priceOptions = useMemo(() => {
    if (!histogramData?.range) {
      return ["No Minimum", "400€", "500€", "600€", "700€", "800€", "900€", "1.000€", "1.200€", "1.300€", "1.400€", "1.500€", "1.600€", "1.700€", "1.800€"];
    }
    return generatePriceOptions(histogramData.range[0], histogramData.range[1]);
  }, [histogramData]);

  const maxPriceOptions = useMemo(() => {
    if (!histogramData?.range) {
      return ["No Maximum", "400€", "500€", "600€", "700€", "800€", "900€", "1.000€", "1.200€", "1.300€", "1.400€", "1.500€", "1.600€", "1.700€", "1.800€"];
    }
    return generateMaxPriceOptions(histogramData.range[0], histogramData.range[1]);
  }, [histogramData]);

  // Get max histogram value for scaling
  const maxHistogramValue = useMemo(() => {
    if (!histogramData?.histogram) return 0;
    return Math.max(...histogramData.histogram);
  }, [histogramData]);

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

  // Notify parent when showPriceOnRequest changes
  useEffect(() => {
    onPriceUpdate?.(minPrice, maxPrice, showPriceOnRequest);
  }, [showPriceOnRequest]);

  return (
    <Dropdown isOpen={isOpen} onClose={onClose} className="w-full max-w-[424px]">
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
        {(activeDropdown === "min" ? priceOptions : activeDropdown === "max" ? maxPriceOptions : []).map((price, index) => {
          const isSelected = activeDropdown === "min" ? price === minPrice : price === maxPrice;
          const isDisabled = activeDropdown ? isOptionDisabled(price, activeDropdown) : false;
          const isMax = activeDropdown === "max";

          // Get histogram value for this index (skip "No Minimum/Maximum" option)
          const histogramIndex = index - 1;
          const histogramValue = histogramData?.histogram?.[histogramIndex] || 0;
          const barHeight = maxHistogramValue > 0 ? (histogramValue / maxHistogramValue) * 100 : 0;

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
              className={`flex gap-2.5 items-center px-3 py-2 text-left relative ${
                isSelected ? "bg-bg-light" : "hover-purple-subtle"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}` }
            >
              {/* For max dropdown: show arc on left (reversed) - positioned between options */}
              {isMax && index > 0 && histogramData && histogramValue > 0 && (
                <div className="absolute left-3 top-1/2 flex items-center gap-1.5 z-20">
                  {/* Arc SVG - reversed */}
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M18 2 Q10 12, 18 22"
                      stroke="#A440F1"
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.4"
                    />
                  </svg>

                  {/* Histogram count */}
                  <span className="text-xs font-medium text-text-secondary">
                    {histogramValue}
                  </span>
                </div>
              )}

              <span className={`flex-1 text-sm font-medium text-black leading-[1.6] relative z-10 ${isMax ? "text-right" : ""}`}>
                {price}
              </span>

              {/* For min dropdown: show arc on right - positioned between options */}
              {!isMax && histogramData && histogramValue >= 0 && index > 0 && (
                <div className="absolute left-32 top-[20px] flex items-center gap-1.5 z-20">
                  {/* Arc SVG */}
                  <Image src="/icons/arc-histogram.svg" alt="" width={14} height={40} />
                  <span className="text-xs font-medium text-text-secondary">
                    {histogramValue}
                  </span>
                </div>
              )}
              {isSelected && (
                <Image src="/icons/checkmark-purple.svg" alt="" width={24} height={24} className="relative z-10" />
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
        <Checkbox
          checked={showPriceOnRequest}
          variant="dropdown"
          className="rounded-sm"
        />
        <span className="flex-1 text-body-sm leading-[1.6]">
          Show listings with "Price on Request"
        </span>
      </button>
    </Dropdown>
  );
}
