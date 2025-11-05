import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import categoriesData from "../categories.json";

interface CategorySelectorProps {
  onCategoryUpdate?: (categoryName: string, typeId: string, subtypeIds: string[]) => void;
  initialTypeId?: string;
  initialSubtypeIds?: string[];
  variant?: "dropdown" | "modal";
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

export function CategorySelector({
  onCategoryUpdate,
  initialTypeId,
  initialSubtypeIds,
  variant = "dropdown"
}: CategorySelectorProps) {
  const [expandedType, setExpandedType] = useState<string | null>(variant === "modal" ? initialTypeId || null : null);
  const [selectedType, setSelectedType] = useState<string>(initialTypeId || "3");
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(
    initialSubtypeIds && initialSubtypeIds.length > 0 ? new Set(initialSubtypeIds) : new Set()
  );
  const [allSubcategoriesSelected, setAllSubcategoriesSelected] = useState(!initialSubtypeIds || initialSubtypeIds.length === 0);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedType = useRef<string | null>(null);
  const subcategoryRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isModal = variant === "modal";
  const isDropdown = variant === "dropdown";

  // Dropdown: animate when switching categories (left to right)
  useEffect(() => {
    if (isDropdown && rightPanelRef.current && selectedType && previousSelectedType.current !== selectedType) {
      if (previousSelectedType.current !== null) {
        gsap.fromTo(
          rightPanelRef.current,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      previousSelectedType.current = selectedType;
    }
  }, [selectedType, isDropdown]);

  // Modal: animate when expanding (opening animation)
  useEffect(() => {
    if (isModal && expandedType) {
      const ref = subcategoryRefs.current.get(expandedType);
      if (ref) {
        gsap.fromTo(
          ref,
          { opacity: 0, height: 0 },
          { opacity: 1, height: "auto", duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }, [expandedType, isModal]);

  // Dropdown: notify parent immediately on change
  useEffect(() => {
    if (isDropdown) {
      const typeName = categoriesData.types[selectedType as keyof typeof categoriesData.types];
      const subtypeIds = allSubcategoriesSelected
        ? []
        : Array.from(selectedSubtypes);
      onCategoryUpdate?.(typeName, selectedType, subtypeIds);
    }
  }, [selectedType, selectedSubtypes, allSubcategoriesSelected, isDropdown]);

  const toggleCategory = (typeId: string) => {
    if (isModal) {
      if (expandedType === typeId) {
        // Closing current
        const ref = subcategoryRefs.current.get(typeId);
        if (ref) {
          gsap.to(ref, {
            opacity: 0,
            height: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setExpandedType(null);
            }
          });
        } else {
          setExpandedType(null);
        }
      } else {
        // Opening new one (possibly closing another)
        if (expandedType) {
          const prevRef = subcategoryRefs.current.get(expandedType);
          if (prevRef) {
            gsap.to(prevRef, {
              opacity: 0,
              height: 0,
              duration: 0.3,
              ease: "power2.in",
              onComplete: () => {
                setExpandedType(typeId);
                setSelectedType(typeId);
                setSelectedSubtypes(new Set());
                setAllSubcategoriesSelected(true);

                // Update ref with new selection
                const typeName = categoriesData.types[typeId as keyof typeof categoriesData.types];
                onCategoryUpdate?.(typeName, typeId, []);
              }
            });
          } else {
            setExpandedType(typeId);
            setSelectedType(typeId);
            setSelectedSubtypes(new Set());
            setAllSubcategoriesSelected(true);

            const typeName = categoriesData.types[typeId as keyof typeof categoriesData.types];
            onCategoryUpdate?.(typeName, typeId, []);
          }
        } else {
          // Nothing expanded, just open
          setExpandedType(typeId);
          setSelectedType(typeId);
          setSelectedSubtypes(new Set());
          setAllSubcategoriesSelected(true);

          const typeName = categoriesData.types[typeId as keyof typeof categoriesData.types];
          onCategoryUpdate?.(typeName, typeId, []);
        }
      }
    } else {
      setSelectedType(typeId);
      setSelectedSubtypes(new Set());
      setAllSubcategoriesSelected(true);
      const typeName = categoriesData.types[typeId as keyof typeof categoriesData.types];
      onCategoryUpdate?.(typeName, typeId, []);
    }
  };

  const toggleSubtype = (subtypeId: string) => {
    const newSelected = new Set(selectedSubtypes);
    if (newSelected.has(subtypeId)) {
      newSelected.delete(subtypeId);
    } else {
      newSelected.add(subtypeId);
    }
    setSelectedSubtypes(newSelected);
    setAllSubcategoriesSelected(false);

    // For modal variant, update the ref with current selection
    if (isModal) {
      const typeName = categoriesData.types[selectedType as keyof typeof categoriesData.types];
      const subtypeIds = Array.from(newSelected);
      onCategoryUpdate?.(typeName, selectedType, subtypeIds);
    }
  };

  const toggleAllSubcategories = () => {
    const newAllSelected = !allSubcategoriesSelected;
    setAllSubcategoriesSelected(newAllSelected);
    setSelectedSubtypes(new Set());

    // For modal variant, update the ref with current selection
    if (isModal) {
      const typeName = categoriesData.types[selectedType as keyof typeof categoriesData.types];
      const subtypeIds = newAllSelected ? [] : [];
      onCategoryUpdate?.(typeName, selectedType, subtypeIds);
    }
  };

  const currentSubtypes = categoriesData.subtypes[selectedType as keyof typeof categoriesData.subtypes] || {};

  if (isModal) {
    return (
      <div className="flex-1 overflow-y-auto">
        {Object.entries(categoriesData.types).map(([typeId, typeName]) => {
          const isExpanded = expandedType === typeId;
          const currentSubtypes = categoriesData.subtypes[typeId as keyof typeof categoriesData.subtypes] || {};

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
                {isExpanded ? (
                  <ChevronUpIcon className="w-5 h-5 text-brand-purple" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5 text-[#79767D]" />
                )}
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
    );
  }

  // Dropdown variant
  return (
    <div className="flex">
      {/* Left Panel - Categories */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <p className="text-base font-semibold text-text-primary leading-normal">
            Category
          </p>
        </div>

        {/* Category List */}
        <div className="flex-1 flex flex-col overflow-auto max-h-[480px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {Object.entries(categoriesData.types).map(([typeId, typeName]) => {
            const isSelected = selectedType === typeId;

            return (
              <button
                key={typeId}
                onClick={() => toggleCategory(typeId)}
                className={`flex items-center justify-between px-3 py-2.5 h-10 ${
                  isSelected ? "bg-bg-light" : "bg-white hover:bg-[#fdfbff]"
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={categoryIcons[typeId]}
                    alt={typeName}
                    className="w-4 h-4 shrink-0"
                    style={{
                      filter: isSelected ? 'invert(36%) sepia(95%) saturate(4527%) hue-rotate(262deg) brightness(98%) contrast(93%)' : 'none'
                    }}
                  />
                  <span className={`text-sm font-medium leading-[1.6] whitespace-nowrap ${
                    isSelected ? "text-brand-purple" : "text-text-primary"
                  }`}>
                    {typeName}
                  </span>
                  <span className={`text-[10px] font-semibold leading-[1.2] whitespace-nowrap ${
                    isSelected ? "text-brand-purple" : "text-text-secondary"
                  }`}>
                    {mockCounts[typeId]?.toLocaleString() || "0"}
                  </span>
                  <div className="shrink-0">
                    <ChevronRightIcon className={`w-5 h-5 ${isSelected ? "text-brand-purple" : "text-[#79767D]"}`} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel - Subcategories */}
      <div className="flex-1 border-l border-border-light flex flex-col">
        <div ref={rightPanelRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3">
            <p className="text-base font-semibold text-text-primary leading-normal">
              {categoriesData.types[selectedType as keyof typeof categoriesData.types]}
            </p>
          </div>

          {/* Subcategory List */}
          <div className="flex-1 flex flex-col overflow-auto max-h-[480px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* All Subcategories Option */}
            <button
              onClick={toggleAllSubcategories}
              className="flex items-center gap-2 px-3 py-2 h-10 border-b border-border-light"
            >
              <div className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                allSubcategoriesSelected
                  ? "bg-brand-purple border-brand-purple-200"
                  : "bg-white border-brand-purple-200"
              }`}>
                {allSubcategoriesSelected && (
                  <Image src="/icons/checkmark-white.svg" alt="" width={10} height={8} />
                )}
              </div>
              <span className="text-sm font-medium text-text-primary leading-[1.6] flex-1 text-left whitespace-nowrap">
                All Subcategories
              </span>
              <span className="text-[10px] font-semibold text-text-secondary leading-[1.2] text-right whitespace-nowrap">
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
                  className="flex items-center gap-2 px-3 py-2 h-10 hover:bg-[#fdfbff]"
                >
                  <div className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                    isChecked
                      ? "bg-brand-purple border-brand-purple-200"
                      : "bg-white border-brand-purple-200"
                  }`}>
                    {isChecked && (
                      <Image src="/icons/checkmark-white.svg" alt="" width={10} height={8} />
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-primary leading-[1.6] flex-1 text-left whitespace-nowrap">
                    {subtypeName}
                  </span>
                  <span className="text-[10px] font-semibold text-text-secondary leading-[1.2] text-right whitespace-nowrap">
                    {Math.floor(Math.random() * 1000)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
