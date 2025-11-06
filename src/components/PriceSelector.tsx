import { useState, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useHistogram, type HistogramParams } from "@/lib/searchCount";
import { formatPrice, getPriceOptions } from "@/lib/priceUtils";
import { Checkbox } from "./ui/Checkbox";

type PriceType = "min" | "max";

const SLIDE_DISTANCE = 180;
const SLIDE_DURATION = 0.14;

interface PriceSelectorProps {
  onPriceUpdate?: (
    min: number | null,
    max: number | null,
    showPriceOnRequest: boolean,
  ) => void;
  initialMinPrice?: number | null;
  initialMaxPrice?: number | null;
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
  variant = "dropdown",
}: PriceSelectorProps) {
  const { data: histogramData } = useHistogram(histogramParams || null);
  const [minPrice, setMinPrice] = useState<number | null>(
    initialMinPrice || null,
  );
  const [maxPrice, setMaxPrice] = useState<number | null>(
    initialMaxPrice || null,
  );
  const [showPriceOnRequest, setShowPriceOnRequest] = useState(
    initialShowPriceOnRequest ?? false,
  );
  const [activeDropdown, setActiveDropdown] = useState<PriceType | null>(null);

  const priceOptions = useMemo(
    () => getPriceOptions(histogramData?.range),
    [histogramData],
  );

  const isOptionDisabled = (
    price: number | null,
    dropdownType: PriceType,
  ): boolean => {
    if (price === null) return false;
    if (dropdownType === "max") return minPrice !== null && price <= minPrice;
    return maxPrice !== null && price >= maxPrice;
  };

  const handlePriceSelect = (price: number | null, type: PriceType) => {
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

  const getDisplayText = (price: number | null, type: PriceType) => {
    if (price === null) return type === "min" ? "No Minimum" : "No Maximum";
    return formatPrice(price);
  };

  const renderOption = (price: number | null, type: PriceType) => {
    const isSelected = type === "min" ? price === minPrice : price === maxPrice;
    const isDisabled = isOptionDisabled(price, type);
    const isMax = type === "max";

    return (
      <button
        key={price ?? "null"}
        onClick={() => {
          if (isDisabled) return;
          handlePriceSelect(price, type);
        }}
        disabled={isDisabled}
        className={`flex gap-2.5 items-center justify-between ${isModal ? "px-4 py-3" : "px-3 py-2 relative"} ${
          isSelected ? "bg-bg-light" : "hover-purple-subtle"
        } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""} ${isMax ? "flex-row-reverse text-right" : "flex-row text-left"}`}
      >
        <span
          className={`flex-1 ${isModal ? "text-base" : "text-sm leading-[1.6] relative z-10"} font-medium text-black`}
        >
          {getDisplayText(price, type)}
        </span>
        {isSelected && (
          <Image
            src="/icons/checkmark-purple.svg"
            alt=""
            width={24}
            height={24}
            className={isModal ? "" : "relative z-10"}
          />
        )}
      </button>
    );
  };

  const isModal = variant === "modal";

  const PriceInput = ({ type }: { type: PriceType }) => {
    const price = type === "min" ? minPrice : maxPrice;
    const isActive = activeDropdown === type;

    return (
      <div
        className={`flex-1 flex flex-col gap-2 ${!isModal ? "max-w-[200px]" : ""} relative`}
      >
        <label className="text-sm font-medium text-black">
          {type === "min" ? "Min" : "Max"}
        </label>
        <button
          onClick={() => setActiveDropdown(isActive ? null : type)}
          className={`border ${
            isActive ? "border-2 border-brand-purple" : "border-border-light"
          } rounded-lg ${isModal ? "h-12 px-3" : "h-11 px-2.5"} flex items-center justify-between`}
        >
          <span
            className={`${isModal ? "text-base" : "text-sm"} font-medium ${
              price === null ? "text-black opacity-40" : "text-black"
            }`}
          >
            {getDisplayText(price, type)}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Min/Max Inputs */}
      <div
        className={`flex gap-3 ${isModal ? "mb-4" : "items-center px-3 py-2"}`}
      >
        <PriceInput type="min" />
        <PriceInput type="max" />
      </div>

      {/* Price Options List */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col overflow-hidden ${
              isModal
                ? "border border-border-light rounded-lg"
                : "bg-white py-2 max-h-[300px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDropdown}
                initial={{
                  x:
                    activeDropdown === "max" ? SLIDE_DISTANCE : -SLIDE_DISTANCE,
                }}
                animate={{ x: 0 }}
                exit={{
                  x:
                    activeDropdown === "max" ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
                }}
                transition={{ duration: SLIDE_DURATION }}
                className="flex flex-col overflow-hidden"
              >
                {priceOptions.map((price) =>
                  renderOption(price, activeDropdown),
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkbox */}
      <button
        onClick={() => {
          const newValue = !showPriceOnRequest;
          setShowPriceOnRequest(newValue);
          onPriceUpdate?.(minPrice, maxPrice, newValue);
        }}
        className={`flex ${isModal ? "gap-3 items-center p-4 border border-border-light rounded-lg w-full mt-4" : "gap-2 items-center p-3 border-t border-[#f2f2f2] w-full text-left cursor-pointer"}`}
      >
        <Checkbox checked={showPriceOnRequest} className="rounded-sm" />
        <span
          className={`flex-1 ${isModal ? "text-base" : "text-sm"} font-medium text-text-primary ${isModal ? "text-left" : "leading-[1.6]"}`}
        >
          Show listings with "Price on Request"
        </span>
      </button>
    </div>
  );
}
