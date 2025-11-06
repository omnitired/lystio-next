"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "./ui/Modal";
import { ModeToggle } from "./ui/ModeToggle";
import { CategoryModal } from "./CategoryModal";
import { PriceModal } from "./PriceModal";
import { useFilter } from "@/contexts/FilterContext";
import { getPriceDisplayText } from "@/lib/priceUtils";
import type { HistogramParams } from "@/lib/searchCount";

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  histogramParams: HistogramParams;
}

export function MobileFilterModal({ isOpen, onClose, onApply, histogramParams }: MobileFilterModalProps) {
  const { filter, setMode } = useFilter();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onApply={onApply}
        title="All Filters"
        applyText="Search"
        applyIcon="/icons/search-white.svg"
      >
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          {/* Mode Toggle */}
          <div className="md:flex justify-center mb-4">
            <ModeToggle
              mode={filter.mode}
              onModeChange={setMode}
              variant="modal"
            />
          </div>

          {/* Category Row */}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="w-full flex items-center justify-between py-5 border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <Image src="/icons/home.svg" alt="" width={28} height={28} />
              <span className="text-xl font-normal text-black">
                Category
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-normal text-brand-purple">
                {filter.category}
              </span>
              <Image src="/icons/chevron-right-purple.svg" alt="" width={24} height={24} />
            </div>
          </button>

          {/* Price Row */}
          <button
            onClick={() => setShowPriceModal(true)}
            className="w-full flex items-center justify-between py-5 border-b border-gray-200"
          >
            <div className="flex items-center gap-4">
              <Image src="/icons/euro.svg" alt="" width={28} height={28} />
              <span className="text-xl font-normal text-black">Price</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-normal ${
                  !filter.minPrice && !filter.maxPrice
                    ? "text-gray-400"
                    : "text-gray-600"
                }`}
              >
                {!filter.minPrice && !filter.maxPrice
                  ? "Any Price"
                  : getPriceDisplayText(filter.minPrice, filter.maxPrice, "Any Price")}
              </span>
              <Image src="/icons/chevron-right-gray.svg" alt="" width={24} height={24} />
            </div>
          </button>
        </div>
      </Modal>

      {/* Mobile Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />

      {/* Mobile Price Modal */}
      <PriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        histogramParams={histogramParams}
      />
    </>
  );
}
