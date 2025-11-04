import { useState, useRef, useEffect, useCallback } from "react";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { LocationDropdown } from "./LocationDropdown";

interface SearchBarProps {
  category?: string;
  pricePlaceholder?: string;
  onLocationClick?: () => void;
  onCategoryClick?: () => void;
  onPriceClick?: () => void;
  onSearch?: () => void;
}

export function SearchBar({
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
  const [selectedLocation, setSelectedLocation] = useState<string>("Vienna");
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

  const handleLocationClick = () => {
    if (activeDropdown === "location") {
      setIsClosing(true);
    } else {
      setActiveDropdown("location");
      setIsClosing(false);
    }
    onLocationClick?.();
  };

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

  const handleLocationUpdate = useCallback((locationName: string) => {
    setSelectedLocation(locationName);
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
    <>
      {/* Dark overlay when dropdown is open */}
      {activeDropdown && (
        <div className="fixed inset-0 bg-black/30 z-40" />
      )}

      <div ref={dropdownRef} className="w-[900px] h-[69px] bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-50">
        <div className="flex h-full items-center">
          {/* Location Section */}
          <div className="w-[300px] h-full bg-bg-light relative">
            <div
              onClick={handleLocationClick}
              className={`w-full h-full flex items-center gap-[15px] pl-6 pr-4 py-3 cursor-pointer transition-colors ${
                activeDropdown === "location" ? "bg-white" : "hover:bg-brand-purple-light"
              }`}
            >
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                  Location
                </label>
                <span className="text-sm font-medium text-text-primary leading-[1.6]">
                  {selectedLocation}
                </span>
              </div>
            </div>

            {/* Location Dropdown */}
            {(activeDropdown === "location") && (
              <div className="absolute w-full h-full top-0 left-0">
                <LocationDropdown
                  isOpen={!isClosing && activeDropdown === "location"}
                  onClose={handleDropdownClose}
                  onLocationUpdate={handleLocationUpdate}
                />
              </div>
            )}
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
    </>
  );
}
