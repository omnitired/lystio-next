import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useHistogram, type HistogramParams } from "@/lib/searchCount";
import { formatPrice, generatePriceOptions, generateMaxPriceOptions, getNumericValue } from "@/lib/priceUtils";
import { Checkbox } from "./Checkbox";

interface PriceSelectorProps {
  onPriceUpdate?: (min: string, max: string, showPriceOnRequest: boolean) => void;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialShowPriceOnRequest?: boolean;
  histogramParams?: HistogramParams | null;
  variant?: "dropdown" | "modal";
}

export function PriceSelector({
  onPriceUpdate,
  initialMinPrice,
  initialMaxPrice,
  initialShowPriceOnRequest,
  histogramParams,
  variant = "dropdown"
}: PriceSelectorProps) {
  const { data: histogramData } = useHistogram(histogramParams || null);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice || "No Minimum");
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice || "No Maximum");
  const [showPriceOnRequest, setShowPriceOnRequest] = useState(initialShowPriceOnRequest ?? false);
  const [activeDropdown, setActiveDropdown] = useState<"min" | "max" | null>(null);

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
      onPriceUpdate?.(minPrice, maxPrice, showPriceOnRequest);
  }, [showPriceOnRequest]);

  const handlePriceSelect = (price: string, type: "min" | "max") => {
    if (type === "min") {
      setMinPrice(price);
      onPriceUpdate?.(price, maxPrice, showPriceOnRequest);
      setActiveDropdown("max");
    } else {
      setMaxPrice(price);
      onPriceUpdate?.(minPrice, price, showPriceOnRequest);
      setActiveDropdown(null);
    }
  };

  const isModal = variant === "modal";
  const isDropdown = variant === "dropdown";

  return (
    <div className="flex flex-col flex-1">
      {/* Min/Max Inputs */}
      <div className={`flex gap-3 ${isModal ? "mb-4" : "items-center px-3 py-2"}`}>
        <div className={`flex-1 flex flex-col gap-2 ${isDropdown ? "max-w-[200px]" : ""} relative`}>
          <label className={`${isModal ? "text-sm" : "text-sm"} font-medium text-black ${isDropdown ? "leading-[1.6]" : ""}`}>
            Min
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === "min" ? null : "min")}
            className={`border ${
              activeDropdown === "min" ? "border-2 border-brand-purple" : "border-border-light"
            } rounded-lg ${isModal ? "h-12 px-3" : "h-11 px-2.5"} flex items-center justify-between`}
          >
            <span className={`${isModal ? "text-base" : "text-sm"} font-medium ${isDropdown ? "leading-[1.6]" : ""} ${
              minPrice === "No Minimum" ? "text-black opacity-40" : "text-black"
            }`}>
              {minPrice}
            </span>
          </button>
        </div>

        <div className={`flex-1 flex flex-col gap-2 ${isDropdown ? "max-w-[200px]" : ""} relative`}>
          <label className={`${isModal ? "text-sm" : "text-sm"} font-medium text-black ${isDropdown ? "leading-[1.6]" : ""}`}>
            Max
          </label>
          <button
            onClick={() => setActiveDropdown(activeDropdown === "max" ? null : "max")}
            className={`border ${
              activeDropdown === "max" ? "border-2 border-brand-purple" : "border-border-light"
            } rounded-lg ${isModal ? "h-12 px-3" : "h-11 px-2.5"} flex items-center justify-between`}
          >
            <span className={`${isModal ? "text-base" : "text-sm"} font-medium ${isDropdown ? "leading-[1.6]" : ""} ${
              maxPrice === "No Maximum" ? "text-black opacity-40" : "text-black"
            }`}>
              {maxPrice}
            </span>
          </button>
        </div>
      </div>

      {/* Price Options List */}
      <AnimatePresence>
        {isModal && activeDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col border border-border-light rounded-lg overflow-hidden"
          >
            {(activeDropdown === "min" ? priceOptions : maxPriceOptions).map((price, index) => {
            const isSelected = activeDropdown === "min" ? price === minPrice : price === maxPrice;
            const isDisabled = isOptionDisabled(price, activeDropdown);
            const isMax = activeDropdown === "max";

            return (
              <button
                key={price}
                onClick={() => {
                  if (isDisabled) return;
                  handlePriceSelect(price, activeDropdown);
                }}
                disabled={isDisabled}
                className={`flex gap-2.5 items-center justify-between px-4 py-3 ${
                  isSelected ? "bg-bg-light" : "hover-purple-subtle"
                } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${isMax ? "flex-row-reverse" : "flex-row"}`}
              >
                <span className=" text-base font-medium text-black">
                  {price}
                </span>
                {isSelected && (
                  <Image src="/icons/checkmark-purple.svg" alt="" width={24} height={24} />
                )}
              </button>
            );
          })}
          </motion.div>
        )}
      </AnimatePresence>

      {isDropdown && (
        <div className="bg-white overflow-hidden">
          <AnimatePresence>
            {activeDropdown && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col py-2 overflow-auto max-h-[300px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {(activeDropdown === "min" ? priceOptions : activeDropdown === "max" ? maxPriceOptions : []).map((price, index) => {
              const isSelected = activeDropdown === "min" ? price === minPrice : price === maxPrice;
              const isDisabled = activeDropdown ? isOptionDisabled(price, activeDropdown) : false;
              const isMax = activeDropdown === "max";

              return (
                <button
                  key={price}
                  onClick={() => {
                    if (isDisabled) return;
                    handlePriceSelect(price, activeDropdown!);
                  }}
                  disabled={isDisabled}
                  className={`flex gap-2.5 items-center justify-between px-3 py-2 text-left relative ${
                    isSelected ? "bg-bg-light" : "hover-purple-subtle"
                  } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${isMax ? "flex-row-reverse text-right" : "flex-row"}`}
                >
                  <span className="flex-1 text-sm font-medium text-black leading-[1.6] relative z-10">
                    {price}
                  </span>
                  {isSelected && (
                    <Image src="/icons/checkmark-purple.svg" alt="" width={24} height={24} className="relative z-10" />
                  )}
                </button>
              );
            })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={() => setShowPriceOnRequest(!showPriceOnRequest)}
        className={`flex ${isModal ? "gap-3 items-center p-4 border border-border-light rounded-lg w-full mt-4" : "gap-2 items-center p-3 border-t border-[#f2f2f2] w-full text-left cursor-pointer"}`}
      >
        <Checkbox
          checked={showPriceOnRequest}
          variant={isModal ? "modal" : "dropdown"}
          className="rounded-sm"
        />
        <span className={`flex-1 ${isModal ? "text-base" : "text-sm"} font-medium text-text-primary ${isModal ? "text-left" : "leading-[1.6]"}`}>
          Show listings with "Price on Request"
        </span>
      </button>
    </div>
  );
}
