import { useRef } from "react";
import { type HistogramParams } from "@/lib/searchCount";
import { Modal } from "./Modal";
import { PriceSelector } from "./PriceSelector";

interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPriceUpdate?: (min: string, max: string, showPriceOnRequest: boolean) => void;
  initialMinPrice?: string | null;
  initialMaxPrice?: string | null;
  initialShowPriceOnRequest?: boolean;
  histogramParams?: HistogramParams | null;
}

export function PriceModal({
  isOpen,
  onClose,
  onPriceUpdate,
  initialMinPrice,
  initialMaxPrice,
  initialShowPriceOnRequest,
  histogramParams
}: PriceModalProps) {
  const priceRef = useRef<{ min: string; max: string; showPriceOnRequest: boolean }>({
    min: initialMinPrice || "No Minimum",
    max: initialMaxPrice || "No Maximum",
    showPriceOnRequest: initialShowPriceOnRequest ?? false
  });

  const handlePriceUpdate = (min: string, max: string, showPriceOnRequest: boolean) => {
    priceRef.current = { min, max, showPriceOnRequest };
  };

  const handleApply = () => {
    onPriceUpdate?.(priceRef.current.min, priceRef.current.max, priceRef.current.showPriceOnRequest);
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
          initialMinPrice={initialMinPrice}
          initialMaxPrice={initialMaxPrice}
          initialShowPriceOnRequest={initialShowPriceOnRequest}
          histogramParams={histogramParams}
          variant="modal"
        />
      </div>
    </Modal>
  );
}
