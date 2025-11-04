import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import categoriesData from "../categories.json";

interface CategoryDropdownProps {
  onClose?: () => void;
  onApply?: (selectedTypes: string[], selectedSubtypes: string[]) => void;
  onCategoryUpdate?: (categoryName: string) => void;
  isOpen?: boolean;
}

// Icon mapping for each category type
const categoryIcons: Record<string, string> = {
  "1": "/svg/rooms.svg", // Rooms/Co-Living
  "2": "/svg/apartments.svg", // Apartments
  "3": "/svg/houses.svg", // Houses
  "4": "/svg/plots.svg", // Plots
  "5": "/svg/commercial.svg", // Commercial Properties
  "11": "/svg/holiday-homes.svg", // Holiday Homes
  "12": "/svg/new-developments.svg", // New Developments
  "13": "/svg/parking.svg", // Parking
  "20": "/svg/office.svg", // Office
  "21": "/svg/investment.svg", // Investment Properties
};

// Mock counts for display (would come from API in production)
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

export function CategoryDropdown({ onClose, onApply, onCategoryUpdate, isOpen = true }: CategoryDropdownProps) {
  const [selectedType, setSelectedType] = useState<string>("2"); // Default to Apartments
  const [selectedSubtypes, setSelectedSubtypes] = useState<Set<string>>(new Set());
  const [allSubcategoriesSelected, setAllSubcategoriesSelected] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedType = useRef<string | null>(null);
  const hasAnimatedIn = useRef(false);

  // Animate dropdown opening
  useEffect(() => {
    if (dropdownRef.current && isOpen && !hasAnimatedIn.current) {
      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          scaleY: 0,
          transformOrigin: "top center",
        },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            hasAnimatedIn.current = true;
          },
        }
      );
    }
  }, [isOpen]);

  // Animate dropdown closing
  useEffect(() => {
    if (!isOpen && hasAnimatedIn.current && dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (onClose) {
            onClose();
          }
        },
      });
    }
  }, [isOpen]);

  // Animate when switching between categories
  useEffect(() => {
    if (rightPanelRef.current && selectedType && previousSelectedType.current !== selectedType) {
      if (previousSelectedType.current !== null) {
        gsap.fromTo(
          rightPanelRef.current,
          {
            opacity: 0,
            x: 10,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          }
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

  const currentSubtypes = categoriesData.subtypes[selectedType as keyof typeof categoriesData.subtypes] || {};

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] z-50 font-[family-name:var(--font-plus-jakarta-sans)] flex"
    >
      {/* Left Panel - Categories */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <p className="text-base font-semibold text-text-primary leading-[1.5]">
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
                onClick={() => {
                  setSelectedType(typeId);
                  setSelectedSubtypes(new Set());
                  setAllSubcategoriesSelected(true);
                  onCategoryUpdate?.(typeName);
                }}
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
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="shrink-0"
                  >
                    <path
                      d="M7.5 15L12.5 10L7.5 5"
                      stroke={isSelected ? "#A540F3" : "#79767D"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
            <p className="text-base font-semibold text-text-primary leading-[1.5]">
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
                  <svg width="10" height="8" viewBox="0 0 11 8" fill="none">
                    <path
                      d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
                      <svg width="10" height="8" viewBox="0 0 11 8" fill="none">
                        <path
                          d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
