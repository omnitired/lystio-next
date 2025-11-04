"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { LocationDropdown } from "./LocationDropdown";

type HeaderMode = "rent" | "buy" | "ai";

interface ToggleOption {
  value: HeaderMode;
  label: string | React.ReactNode;
}

const toggleOptions: ToggleOption[] = [
  { value: "rent", label: "Rent" },
  { value: "buy", label: "Buy" },
  {
    value: "ai",
    label: (
      <>
        <span className="text-black">Lystio </span>
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#a540f3] to-[#5110e8] font-semibold">
          AI
        </span>
      </>
    ),
  },
];

interface SearchBarProps {
  category?: string;
  pricePlaceholder?: string;
  onCategoryClick?: () => void;
  onPriceClick?: () => void;
  onSearch?: () => void;
  mode?: HeaderMode;
  onModeChange?: (mode: HeaderMode) => void;
}

export function SearchBar({
  category = "Apartments",
  pricePlaceholder = "Select Price Range",
  onCategoryClick,
  onPriceClick,
  onSearch,
  mode = "rent",
  onModeChange,
}: SearchBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"location" | "category" | "price" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedMinPrice, setSelectedMinPrice] = useState<string | null>(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [debouncedLocation, setDebouncedLocation] = useState<string>('');
  const [sessionToken] = useState(() => generateSessionToken());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const activeIndex = toggleOptions.findIndex((opt) => opt.value === mode);
    const activeButton = buttonsRef.current[activeIndex];

    if (activeButton) {
      setIndicatorStyle({
        left: activeButton.offsetLeft,
        width: activeButton.offsetWidth,
      });
    }
  }, [mode]);

  // Debounce location input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(selectedLocation);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedLocation]);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["mapbox-search", debouncedLocation, sessionToken],
    queryFn: () =>
      searchMapbox({
        query: debouncedLocation,
        sessionToken,
      }),
    enabled: debouncedLocation.length > 0 && activeDropdown === "location",
  });

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
      // setIsClosing(true);
    } else {
      setActiveDropdown("location");
      setIsClosing(false);
    }
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

      {/* Mode Toggle - centered */}
      <div className="flex justify-center mb-4">
        <div className="bg-bg-light border border-border-light rounded-full p-1 flex gap-1 relative">
          {/* Animated Indicator */}
          {indicatorStyle.width > 0 && (
            <div
              className="absolute top-1 bg-white border border-white rounded-full transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                height: "calc(100% - 8px)",
              }}
            />
          )}

          {/* Toggle Buttons */}
          {toggleOptions.map((option, index) => (
            <button
              key={option.value}
              ref={(el) => {
                buttonsRef.current[index] = el;
              }}
              onClick={() => onModeChange?.(option.value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors relative z-10 font-[family-name:var(--font-plus-jakarta-sans)] ${
                mode === option.value
                  ? "text-text-primary"
                  : "text-black hover:bg-white/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={dropdownRef} className="w-[900px] h-[69px] bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-50">
        <div className="flex h-full items-center">
          {/* Location Section */}
          <div className="w-[300px] h-full bg-bg-light relative rounded-l-full">
            <div
              onClick={handleLocationClick}
              className={`w-full h-full flex items-center gap-[15px] pl-6 pr-4 py-3 cursor-pointer transition-colors rounded-l-full ${
                activeDropdown === "location" ? "bg-white" : "hover:bg-brand-purple-light"
              }`}
            >
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="Enter location..."
                  className="text-sm font-medium text-text-primary leading-[1.6] bg-transparent border-none outline-none w-full"
                />
              </div>
            </div>

            {/* Location Dropdown */}
            {(activeDropdown === "location") && (
              <LocationDropdown
                isOpen={!isClosing && activeDropdown === "location"}
                onClose={handleDropdownClose}
                onLocationUpdate={handleLocationUpdate}
                searchResults={searchResults}
                isLoading={isLoading}
                hasSearchQuery={selectedLocation.length > 0}
              />
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
        <div className="flex-1 bg-bg-light h-full flex items-center border-l border-border-light relative rounded-r-full">
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
