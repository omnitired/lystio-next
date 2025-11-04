import { useState, useRef, useEffect, useMemo } from "react";
import { gsap } from "gsap";
import { useHistogram, type HistogramParams } from "@/lib/searchCount";

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPriceUpdate?: (min: string, max: string, showPriceOnRequest: boolean) => void;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialShowPriceOnRequest?: boolean;
  histogramParams?: HistogramParams | null;
}

const formatPrice = (price: number): string => {
  const priceStr = price.toString();
  const parts = [];

  let i = priceStr.length;
  while (i > 0) {
    const start = Math.max(0, i - 3);
    parts.unshift(priceStr.slice(start, i));
    i = start;
  }

  return `${parts.join(',')}€`;
};

const generatePriceOptions = (min: number, max: number): string[] => {
  const options = ["No Minimum"];
  const step = (max - min) / 19;

  for (let i = 0; i < 19; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(formatPrice(roundedPrice));
  }

  options.push(formatPrice(max));
  return options;
};

const generateMaxPriceOptions = (min: number, max: number): string[] => {
  const options = ["No Maximum"];
  const step = (max - min) / 19;

  for (let i = 0; i < 19; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(formatPrice(roundedPrice));
  }

  options.push(formatPrice(max));
  return options;
};

export function PriceModal({
  isOpen,
  onClose,
  onPriceUpdate,
  initialMinPrice,
  initialMaxPrice,
  initialShowPriceOnRequest,
  histogramParams
}: PriceModalProps) {
  const { data: histogramData } = useHistogram(histogramParams || null);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice || "No Minimum");
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice || "No Maximum");
  const [showPriceOnRequest, setShowPriceOnRequest] = useState(initialShowPriceOnRequest ?? false);
  const [activeDropdown, setActiveDropdown] = useState<"min" | "max" | null>(null);

  const optionsListRef = useRef<HTMLDivElement>(null);
  const previousDropdownType = useRef<"min" | "max" | null>(null);

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

  const maxHistogramValue = useMemo(() => {
    if (!histogramData?.histogram) return 0;
    return Math.max(...histogramData.histogram);
  }, [histogramData]);

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

  useEffect(() => {
    if (optionsListRef.current && activeDropdown && previousDropdownType.current !== activeDropdown) {
      if (previousDropdownType.current !== null) {
        const direction = previousDropdownType.current === "min" ? -10 : 10;
        gsap.fromTo(
          optionsListRef.current,
          { opacity: 0, y: direction },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      previousDropdownType.current = activeDropdown;
    }
  }, [activeDropdown]);

  const handleApply = () => {
    onPriceUpdate?.(minPrice, maxPrice, showPriceOnRequest);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[110] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light">
        <h2 className="text-lg font-semibold text-text-primary">Price Range</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-bg-light rounded-full transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Min/Max Inputs */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Min</label>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "min" ? null : "min")}
              className={`border ${
                activeDropdown === "min" ? "border-2 border-brand-purple" : "border-border-light"
              } rounded-lg h-12 px-3 flex items-center justify-between`}
            >
              <span className={`text-base font-medium ${
                minPrice === "No Minimum" ? "text-black opacity-40" : "text-black"
              }`}>
                {minPrice}
              </span>
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Max</label>
            <button
              onClick={() => setActiveDropdown(activeDropdown === "max" ? null : "max")}
              className={`border ${
                activeDropdown === "max" ? "border-2 border-brand-purple" : "border-border-light"
              } rounded-lg h-12 px-3 flex items-center justify-between`}
            >
              <span className={`text-base font-medium ${
                maxPrice === "No Maximum" ? "text-black opacity-40" : "text-black"
              }`}>
                {maxPrice}
              </span>
            </button>
          </div>
        </div>

        {/* Price Options List */}
        {activeDropdown && (
          <div ref={optionsListRef} className="flex flex-col border border-border-light rounded-lg overflow-hidden">
            {(activeDropdown === "min" ? priceOptions : maxPriceOptions).map((price, index) => {
              const isSelected = activeDropdown === "min" ? price === minPrice : price === maxPrice;
              const isDisabled = isOptionDisabled(price, activeDropdown);
              const isMax = activeDropdown === "max";

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
                      setActiveDropdown("max");
                    } else if (activeDropdown === "max") {
                      setMaxPrice(price);
                      setActiveDropdown(null);
                    }
                  }}
                  disabled={isDisabled}
                  className={`flex gap-2.5 items-center justify-between px-4 py-3 ${
                    isSelected ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${isMax ? "flex-row-reverse" : "flex-row"}`}
                >
                  <span className="flex-1 text-base font-medium text-black">
                    {price}
                  </span>
                  {isSelected && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M10.5868 13.4148L7.75775 10.5868L6.34375 12.0008L10.5868 16.2438L17.6567 9.17281L16.2437 7.75781L10.5868 13.4148Z" fill="#A540F3"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Checkbox */}
        <button
          onClick={() => setShowPriceOnRequest(!showPriceOnRequest)}
          className="flex gap-3 items-center p-4 border border-border-light rounded-lg w-full mt-4"
        >
          <div className={`w-5 h-5 flex items-center justify-center shrink-0 border rounded-sm border-brand-purple-200 ${
            showPriceOnRequest ? "bg-brand-purple" : "bg-white"
          }`}>
            {showPriceOnRequest && (
              <svg width="12" height="10" viewBox="0 0 11 8" fill="none">
                <path d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="flex-1 text-base font-medium text-text-primary text-left">
            Show listings with "Price on Request"
          </span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border-light">
        <button
          onClick={handleApply}
          className="w-full bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full py-4 text-base font-medium text-white"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
