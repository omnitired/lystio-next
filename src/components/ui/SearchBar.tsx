import { useState, useRef, useEffect, useCallback } from "react";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";

interface LocationTag {
  label: string;
  onRemove?: () => void;
}

interface SearchBarProps {
  locationTags?: LocationTag[];
  locationPlaceholder?: string;
  category?: string;
  pricePlaceholder?: string;
  onLocationClick?: () => void;
  onCategoryClick?: () => void;
  onPriceClick?: () => void;
  onSearch?: () => void;
}

export function SearchBar({
  locationTags = [],
  locationPlaceholder = "City, District, Street, Postcode",
  category = "Apartments",
  pricePlaceholder = "Select Price Range",
  onLocationClick,
  onCategoryClick,
  onPriceClick,
  onSearch,
}: SearchBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"location" | "category" | "price" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedMinPrice, setSelectedMinPrice] = useState<string | null>(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClosing(true);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = () => {
    if (activeDropdown === "category") {
      setIsClosing(true);
    } else {
      setActiveDropdown("category");
      setIsClosing(false);
    }
    onCategoryClick?.();
  };

  const handlePriceClick = () => {
    if (activeDropdown === "price") {
      setIsClosing(true);
    } else {
      setActiveDropdown("price");
      setIsClosing(false);
    }
    onPriceClick?.();
  };

  const handleDropdownClose = useCallback(() => {
    setActiveDropdown(null);
    setIsClosing(false);
  }, []);

  const handlePriceUpdate = useCallback((min: string, max: string) => {
    setSelectedMinPrice(min);
    setSelectedMaxPrice(max);
  }, []);

  const handleCategoryUpdate = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
  }, []);

  const getPriceDisplayText = () => {
    if (!selectedMinPrice && !selectedMaxPrice) {
      return pricePlaceholder;
    }

    const minText = selectedMinPrice === "No Minimum" ? "0" : selectedMinPrice?.replace("€", "");
    const maxText = selectedMaxPrice === "No Maximum" ? "∞" : selectedMaxPrice?.replace("€", "");

    return `${minText} - ${maxText} €`;
  };

  return (
    <div ref={dropdownRef} className="w-[900px] h-[69px] bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative">
      <div className="flex h-full items-center">
        {/* Location Section */}
        <div
          onClick={onLocationClick}
          className="w-[300px] h-full flex items-center gap-[15px] pl-6 pr-4 py-3 cursor-pointer hover:bg-bg-light transition-colors"
        >
          <div className="flex-1 flex flex-col min-w-0">
            <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
              Location
            </label>
            <div className="flex items-center gap-1 w-full">
              {locationTags.length > 0 ? (
                <>
                  {locationTags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-brand-purple-light rounded-2xl px-1 flex items-center gap-0.5 max-w-[200px] shrink-0"
                    >
                      <span className="text-sm font-medium text-text-primary truncate leading-[1.6]">
                        {tag.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          tag.onRemove?.();
                        }}
                        className="w-4 h-4 shrink-0 flex items-center justify-center"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="8" fill="#0E0E0E" />
                          <path
                            d="M5 5L11 11M5 11L11 5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <span className="text-sm font-medium text-text-secondary opacity-40 truncate leading-[1.6] flex-1">
                    {locationPlaceholder}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-text-secondary opacity-40 truncate leading-[1.6]">
                  {locationPlaceholder}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div className="w-[250px] h-full bg-bg-light border-l border-border-light relative">
          <div
            onClick={handleCategoryClick}
            className={`w-full h-full flex items-center gap-[15px] px-3 py-2 cursor-pointer transition-colors ${
              activeDropdown === "category" ? "bg-white" : "hover:bg-brand-purple-light"
            }`}
          >
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                Category
              </label>
              <span className="text-sm font-medium text-text-primary leading-[1.6]">
                {selectedCategory}
              </span>
            </div>
          </div>

          {/* Category Dropdown */}
          {(activeDropdown === "category") && (
            <div className="absolute w-full h-full top-0 left-0">
              <CategoryDropdown
                isOpen={!isClosing && activeDropdown === "category"}
                onClose={handleDropdownClose}
                onCategoryUpdate={handleCategoryUpdate}
              />
            </div>
          )}
        </div>

        {/* Price Section + Search Button */}
        <div className="flex-1 bg-bg-light h-full flex items-center border-l border-border-light relative">
          <div
            onClick={handlePriceClick}
            className={`flex-1 flex h-full items-center px-3 cursor-pointer transition-colors ${
              activeDropdown === "price" ? "bg-white" : "hover:bg-white"
            }`}
          >
            <div className="flex-1 flex flex-col justify-center h-full">
              <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                Price
              </label>
              <span className={`text-sm font-medium text-text-primary leading-[1.6] ${
                !selectedMinPrice && !selectedMaxPrice ? "opacity-40" : ""
              }`}>
                {getPriceDisplayText()}
              </span>
            </div>
          </div>

          {/* Search Button */}
          <div className="px-2 py-0 h-full flex items-center">
            <button
              onClick={onSearch}
              className="bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full pl-2 pr-3 py-3 flex items-center gap-2"
            >
              <div className="w-4 h-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 14L11.1 11.1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-base font-medium text-white leading-[1.5]">
                Search
              </span>
            </button>
          </div>

          {/* Price Dropdown */}
          {(activeDropdown === "price") && (
            <div className="absolute w-full h-full top-0 right-0 ">
              <PriceDropdown
                isOpen={!isClosing && activeDropdown === "price"}
                onClose={handleDropdownClose}
                onPriceUpdate={handlePriceUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
