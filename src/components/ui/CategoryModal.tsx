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
  const [expandedType, setExpandedType] = useState<string | null>(initialTypeId || null);
  const [selectedType, setSelectedType] = useState<string>(initialTypeId || "3");
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(
    initialSubtypeIds && initialSubtypeIds.length > 0 ? new Set(initialSubtypeIds) : new Set()
  );
  const [allSubcategoriesSelected, setAllSubcategoriesSelected] = useState(!initialSubtypeIds || initialSubtypeIds.length === 0);

  const subcategoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const toggleCategory = (typeId: string) => {
    if (expandedType === typeId) {
      setExpandedType(null);
    } else {
      setExpandedType(typeId);
      setSelectedType(typeId);
      setSelectedSubtypes(new Set());
      setAllSubcategoriesSelected(true);
    }
  };

  useEffect(() => {
    if (expandedType) {
      const ref = subcategoryRefs.current.get(expandedType);
      if (ref) {
        gsap.fromTo(
          ref,
          { opacity: 0, height: 0 },
          { opacity: 1, height: "auto", duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }, [expandedType]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Category"
    >
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(categoriesData.types).map(([typeId, typeName]) => {
          const isExpanded = expandedType === typeId;
          const currentSubtypes = categoriesData.subtypes[typeId as keyof typeof categoriesData.subtypes] || {};
          const isSelected = selectedType === typeId;

          return (
            <div key={typeId} className="border-b border-border-light">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(typeId)}
                className={`w-full flex items-center justify-between px-4 py-3 ${
                  isExpanded ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={categoryIcons[typeId]}
                    alt={typeName}
                    className="w-5 h-5 shrink-0"
                    style={{
                      filter: isExpanded ? 'invert(36%) sepia(95%) saturate(4527%) hue-rotate(262deg) brightness(98%) contrast(93%)' : 'none'
                    }}
                  />
                  <span className={`text-base font-medium ${
                    isExpanded ? "text-brand-purple" : "text-text-primary"
                  }`}>
                    {typeName}
                  </span>
                  <span className={`text-xs font-semibold ${
                    isExpanded ? "text-brand-purple" : "text-text-secondary"
                  }`}>
                    {mockCounts[typeId]?.toLocaleString() || "0"}
                  </span>
                </div>
                <div
                  className={`transition-transform duration-300 ${
                    isExpanded ? "rotate-180" : ""
                  } ${isExpanded ? "text-brand-purple" : "text-[#79767D]"}`}
                >
                  <Image src="/icons/chevron-small.svg" alt="" width={20} height={20} />
                </div>
              </button>

              {/* Subcategories */}
              {isExpanded && (
                <div
                  ref={(el) => {
                    if (el) subcategoryRefs.current.set(typeId, el);
                  }}
                  className="bg-white overflow-hidden"
                >
                  {/* All Subcategories Option */}
                  <button
                    onClick={toggleAllSubcategories}
                    className="w-full flex items-center gap-3 px-4 py-3 border-t border-border-light hover:bg-[#fdfbff]"
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
                      {mockCounts[typeId]?.toLocaleString() || "0"}
                    </span>
                  </button>

                  {/* Individual Subcategories */}
                  {Object.entries(currentSubtypes).map(([subtypeId, subtypeName]) => {
                    const isChecked = !allSubcategoriesSelected && selectedSubtypes.has(subtypeId);

                    return (
                      <button
                        key={subtypeId}
                        onClick={() => toggleSubtype(subtypeId)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fdfbff]"
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
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
