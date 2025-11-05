import { Dropdown } from "./Dropdown";
import { PriceSelector } from "./PriceSelector";
import { type HistogramParams } from "@/lib/searchCount";

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

export function PriceDropdown({ onClose, onPriceUpdate, isOpen = true, initialMinPrice, initialMaxPrice, initialShowPriceOnRequest, histogramParams }: PriceDropdownProps) {
  return (
    <Dropdown isOpen={isOpen} onClose={onClose} className="w-full max-w-[424px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <p className="text-base font-semibold text-text-primary leading-normal">
          Price Range
        </p>
      </div>

      <PriceSelector
        onPriceUpdate={onPriceUpdate}
        initialMinPrice={initialMinPrice}
        initialMaxPrice={initialMaxPrice}
        initialShowPriceOnRequest={initialShowPriceOnRequest}
        histogramParams={histogramParams}
        variant="dropdown"
      />
    </Dropdown>
  );
}
