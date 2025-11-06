"use client";

import { useRef } from "react";
import { type HistogramParams } from "@/lib/searchCount";
import { Modal } from "./ui/Modal";
import { PriceSelector } from "./PriceSelector";
import { useFilter } from "@/contexts/FilterContext";

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  histogramParams?: HistogramParams | null;
}

export function PriceModal({
  isOpen,
  onClose,
  histogramParams
}: PriceModalProps) {
  const { filter, updatePrice } = useFilter();

  const priceRef = useRef<{ min: string; max: string; showPriceOnRequest: boolean }>({
    min: filter.minPrice || "No Minimum",
    max: filter.maxPrice || "No Maximum",
    showPriceOnRequest: filter.showPriceOnRequest ?? false
  });

  const handlePriceUpdate = (min: string, max: string, showPriceOnRequest: boolean) => {
    priceRef.current = { min, max, showPriceOnRequest };
  };

  const handleApply = () => {
    updatePrice(priceRef.current.min, priceRef.current.max, priceRef.current.showPriceOnRequest);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Price Range"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <PriceSelector
          onPriceUpdate={handlePriceUpdate}
          initialMinPrice={filter.minPrice}
          initialMaxPrice={filter.maxPrice}
          initialShowPriceOnRequest={filter.showPriceOnRequest}
          histogramParams={histogramParams}
          variant="modal"
        />
      </div>
    </Modal>
  );
}
