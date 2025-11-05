import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import categoriesData from "../categories.json";
import { Modal } from "./Modal";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdate?: (categoryName: string, typeId: string, subtypeIds: string[]) => void;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
}

// Icon mapping for each category type
const categoryIcons: Record<string, string> = {
  "1": "/svg/rooms.svg",
  "2": "/svg/apartments.svg",
  "3": "/svg/houses.svg",
  "4": "/svg/plots.svg",
  "5": "/svg/commercial.svg",
  "11": "/svg/holiday-homes.svg",
  "12": "/svg/new-developments.svg",
  "13": "/svg/parking.svg",
  "20": "/svg/office.svg",
  "21": "/svg/investment.svg",
};

const mockCounts: Record<string, number> = {
  "1": 1853,
  "2": 9547,
  "3": 8275,
  "4": 3012,
  "5": 4960,
  "11": 2638,
  "12": 7529,
  "13": 3741,
  "20": 3012,
  "21": 5086,
};

export function CategoryModal({
  isOpen,
  onClose,
  onCategoryUpdate,
  initialTypeId,
  initialSubtypeIds
}: CategoryModalProps) {
  const [selectedType, setSelectedType] = useState<string>(initialTypeId || "3");
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(
    initialSubtypeIds && initialSubtypeIds.length > 0 ? new Set(initialSubtypeIds) : new Set()
  );
  const [allSubcategoriesSelected, setAllSubcategoriesSelected] = useState(!initialSubtypeIds || initialSubtypeIds.length === 0);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedType = useRef<string | null>(null);

  useEffect(() => {
    if (rightPanelRef.current && selectedType && previousSelectedType.current !== selectedType) {
      if (previousSelectedType.current !== null) {
        gsap.fromTo(
          rightPanelRef.current,
          { opacity: 0, x: 10 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      previousSelectedType.current = selectedType;
    }
  }, [selectedType]);

  const toggleSubtype = (subtypeId: string) => {
    const newSelected = new Set(selectedSubtypes);
    if (newSelected.has(subtypeId)) {
      newSelected.delete(subtypeId);
    } else {
      newSelected.add(subtypeId);
    }
    setSelectedSubtypes(newSelected);
    setAllSubcategoriesSelected(false);
  };

  const toggleAllSubcategories = () => {
    if (allSubcategoriesSelected) {
      setAllSubcategoriesSelected(false);
      setSelectedSubtypes(new Set());
    } else {
      setAllSubcategoriesSelected(true);
      setSelectedSubtypes(new Set());
    }
  };

  const handleApply = () => {
    const typeName = categoriesData.types[selectedType as keyof typeof categoriesData.types];
    const currentSubtypes = categoriesData.subtypes[selectedType as keyof typeof categoriesData.subtypes] || {};
    const subtypeIds = allSubcategoriesSelected
      ? Object.keys(currentSubtypes)
      : Array.from(selectedSubtypes);
    onCategoryUpdate?.(typeName, selectedType, subtypeIds);
    onClose();
  };

  const currentSubtypes = categoriesData.subtypes[selectedType as keyof typeof categoriesData.subtypes] || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Category"
    >
      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Panel - Categories */}
        <div className="flex-1 flex flex-col border-r border-border-light">
          <div className="flex-1 overflow-auto">
            {Object.entries(categoriesData.types).map(([typeId, typeName]) => {
              const isSelected = selectedType === typeId;

              return (
                <button
                  key={typeId}
                  onClick={() => {
                    setSelectedType(typeId);
                    setSelectedSubtypes(new Set());
                    setAllSubcategoriesSelected(true);
                  }}
                  className={`flex items-center justify-between px-4 py-3 ${
                    isSelected ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={categoryIcons[typeId]}
                      alt={typeName}
                      className="w-5 h-5 shrink-0"
                      style={{
                        filter: isSelected ? 'invert(36%) sepia(95%) saturate(4527%) hue-rotate(262deg) brightness(98%) contrast(93%)' : 'none'
                      }}
                    />
                    <span className={`text-base font-medium ${
                      isSelected ? "text-brand-purple" : "text-text-primary"
                    }`}>
                      {typeName}
                    </span>
                    <span className={`text-xs font-semibold ${
                      isSelected ? "text-brand-purple" : "text-text-secondary"
                    }`}>
                      {mockCounts[typeId]?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className={isSelected ? "text-brand-purple" : "text-[#79767D]"}>
                    <Image src="/icons/chevron-small.svg" alt="" width={20} height={20} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Subcategories */}
        <div className="flex-1 flex flex-col">
          <div ref={rightPanelRef} className="flex-1 overflow-auto">
            {/* All Subcategories Option */}
            <button
              onClick={toggleAllSubcategories}
              className="flex items-center gap-3 px-4 py-3 border-b border-border-light"
            >
              <div className={`w-5 h-5 flex items-center justify-center shrink-0 border rounded ${
                allSubcategoriesSelected
                  ? "bg-brand-purple border-brand-purple-200"
                  : "bg-white border-brand-purple-200"
              }`}>
                {allSubcategoriesSelected && (
                  <Image src="/icons/checkmark-white.svg" alt="" width={12} height={10} />
                )}
              </div>
              <span className="text-base font-medium text-text-primary flex-1 text-left">
                All Subcategories
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {mockCounts[selectedType]?.toLocaleString() || "0"}
              </span>
            </button>

            {/* Individual Subcategories */}
            {Object.entries(currentSubtypes).map(([subtypeId, subtypeName]) => {
              const isChecked = !allSubcategoriesSelected && selectedSubtypes.has(subtypeId);

              return (
                <button
                  key={subtypeId}
                  onClick={() => toggleSubtype(subtypeId)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#fdfbff]"
                >
                  <div className={`w-5 h-5 flex items-center justify-center shrink-0 border rounded ${
                    isChecked
                      ? "bg-brand-purple border-brand-purple-200"
                      : "bg-white border-brand-purple-200"
                  }`}>
                    {isChecked && (
                      <Image src="/icons/checkmark-white.svg" alt="" width={12} height={10} />
                    )}
                  </div>
                  <span className="text-base font-medium text-text-primary flex-1 text-left">
                    {subtypeName}
                  </span>
                  <span className="text-xs font-semibold text-text-secondary">
                    {Math.floor(Math.random() * 1000)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
