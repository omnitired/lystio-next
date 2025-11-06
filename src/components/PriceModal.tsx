"use client";

import { useState } from "react";
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
  const { minPrice, maxPrice, showPriceOnRequest } = filter;

  const [tempMin, setTempMin] = useState(minPrice);
  const [tempMax, setTempMax] = useState(maxPrice);
  const [tempShowPriceOnRequest, setTempShowPriceOnRequest] = useState(showPriceOnRequest ?? false);

  const handlePriceUpdate = (min: number | null, max: number | null, showOnRequest: boolean) => {
    setTempMin(min);
    setTempMax(max);
    setTempShowPriceOnRequest(showOnRequest);
  };

  const handleApply = () => {
    updatePrice(tempMin, tempMax, tempShowPriceOnRequest);
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
          initialMinPrice={minPrice}
          initialMaxPrice={maxPrice}
          initialShowPriceOnRequest={showPriceOnRequest}
          histogramParams={histogramParams}
          variant="modal"
        />
      </div>
    </Modal>
  );
}
