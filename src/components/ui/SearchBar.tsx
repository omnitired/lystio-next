"use client";

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import { useSearchCount } from "@/lib/searchCount";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { LocationDropdown } from "./LocationDropdown";
import { CategoryModal } from "./CategoryModal";
import { PriceModal } from "./PriceModal";

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
  onCountUpdate?: (count: number | undefined) => void;
}

export function SearchBar({
  category = "Houses",
  pricePlaceholder = "Select Price Range",
  onCategoryClick,
  onPriceClick,
  onSearch,
  mode = "rent",
  onModeChange,
  onCountUpdate,
}: SearchBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"location" | "category" | "price" | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedMinPrice, setSelectedMinPrice] = useState<string | null>(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [debouncedLocation, setDebouncedLocation] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionToken] = useState(() => generateSessionToken());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter states for API (initialize with Houses type and all its subtypes, no default location)
  const [selectedTypeId, setSelectedTypeId] = useState<string>("3");
  const [selectedSubTypeIds, setSelectedSubTypeIds] = useState<string[]>(["202", "8", "9", "10", "11", "13", "14", "18", "19", "20", "22", "57", "87"]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [showPriceOnRequest, setShowPriceOnRequest] = useState<boolean>(true);

  // Helper function to convert price string to number
  const getPriceNumber = (price: string | null): number => {
    if (!price || price === "No Minimum" || price === "No Maximum") return 0;
    return parseInt(price.replace(/[^0-9]/g, ""));
  };

  // Build histogram params (same as search count but without price filter)
  const histogramParams = selectedLocationIds.length > 0 && selectedSubTypeIds.length > 0 ? {
    type: [parseInt(selectedTypeId)],
    rentType: [mode === "rent" ? "rent" : "buy"],
    subType: selectedSubTypeIds.map(id => parseInt(id)),
    showPriceOnRequest,
    sort: "most_recent" as const,
    withinId: selectedLocationIds,
  } : null;

  // Build search count params
  const searchCountParams = selectedLocationIds.length > 0 && selectedSubTypeIds.length > 0 ? {
    type: [parseInt(selectedTypeId)],
    rentType: [mode === "rent" ? "rent" : "buy"],
    subType: selectedSubTypeIds.map(id => parseInt(id)),
    showPriceOnRequest,
    sort: "most_recent" as const,
    withinId: selectedLocationIds,
    ...(mode === "rent" && selectedMinPrice && selectedMaxPrice && selectedMinPrice !== "No Minimum" && selectedMaxPrice !== "No Maximum"
      ? { rent: [getPriceNumber(selectedMinPrice), getPriceNumber(selectedMaxPrice)] as [number, number] }
      : {}),
    ...(mode === "buy" && selectedMinPrice && selectedMaxPrice && selectedMinPrice !== "No Minimum" && selectedMaxPrice !== "No Maximum"
      ? { price: [getPriceNumber(selectedMinPrice), getPriceNumber(selectedMaxPrice)] as [number, number] }
      : {}),
  } : null;

  // Call search count API
  const { data: searchCount } = useSearchCount(searchCountParams);

  // Notify parent when count changes
  useEffect(() => {
    onCountUpdate?.(searchCount?.count);
  }, [searchCount, onCountUpdate]);

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
    enabled: debouncedLocation.length > 0 && activeDropdown === "location" && isTyping,
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

  const handlePriceUpdate = useCallback((min: string, max: string, showOnRequest: boolean) => {
    setSelectedMinPrice(min);
    setSelectedMaxPrice(max);
    setShowPriceOnRequest(showOnRequest);
  }, []);

  const handleCategoryUpdate = useCallback((categoryName: string, typeId: string, subtypeIds: string[]) => {
    setSelectedCategory(categoryName);
    setSelectedTypeId(typeId);
    setSelectedSubTypeIds(subtypeIds);
  }, []);

  const handleLocationUpdate = useCallback((locationName: string, locationIds: string[], locationId?: string) => {
    setSelectedLocation(locationName);
    setSelectedLocationIds(locationIds);
    if (locationId) {
      setSelectedLocationId(locationId);
    }
    setIsTyping(false);
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

      {/* Mode Toggle - centered, hidden on mobile */}
      <div className="hidden md:flex justify-center mb-4">
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

      <div ref={dropdownRef} className="w-full max-w-[900px] h-[69px] bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-50">
        <div className="flex h-full items-center">
          {/* Location Section */}
          <div className="flex-1 md:w-[300px] h-full bg-bg-light relative rounded-full md:rounded-l-full md:rounded-r-none">
            <div
              onClick={handleLocationClick}
              className={`w-full h-full flex items-center gap-[15px] pl-6 pr-4 py-3 cursor-pointer transition-colors rounded-full md:rounded-l-full md:rounded-r-none ${
                activeDropdown === "location" ? "bg-white" : "hover:bg-white"
              }`}
            >
              <div className="flex-1 flex flex-col">
                <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setIsTyping(true);
                  }}
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
                hasSearchQuery={isTyping && selectedLocation.length > 0}
                selectedLocationId={selectedLocationId}
              />
            )}
          </div>

        {/* Category Section - hidden on mobile */}
        <div className="hidden md:block w-[250px] h-full bg-bg-light border-l border-border-light relative">
          <div
            onClick={handleCategoryClick}
            className={`w-full h-full flex items-center gap-[15px] px-3 py-2 cursor-pointer transition-colors ${
              activeDropdown === "category" ? "bg-white" : "hover:bg-white"
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
                initialTypeId={selectedTypeId}
                initialSubtypeIds={selectedSubTypeIds}
              />
            </div>
          )}
        </div>

        {/* Price Section + Search Button - hidden on mobile */}
        <div className="hidden md:flex flex-1 bg-bg-light h-full items-center border-l border-border-light relative rounded-r-full">
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
                initialMinPrice={selectedMinPrice}
                initialMaxPrice={selectedMaxPrice}
                initialShowPriceOnRequest={showPriceOnRequest}
                histogramParams={histogramParams}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="md:hidden w-full max-w-[900px] mt-3 bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-[56px] flex items-center justify-center gap-2 relative z-50"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-base font-medium text-text-primary">Filters</span>
      </button>

      {/* Mobile Filter Modal */}
      {showFilterModal && (
        <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <h2 className="text-lg font-semibold text-text-primary">Filters</h2>
            <button
              onClick={() => setShowFilterModal(false)}
              className="p-2 hover:bg-bg-light rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Mode Toggle in Modal */}
            <div className="mb-6">
              <label className="text-sm font-medium text-text-primary mb-2 block">Mode</label>
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

            {/* Category in Modal */}
            <div className="mb-6">
              <label className="text-sm font-medium text-text-primary mb-2 block">Category</label>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="w-full bg-bg-light border border-border-light rounded-2xl p-4 hover:bg-white transition-colors text-left flex items-center justify-between"
              >
                <span className="text-base font-medium text-text-primary">{selectedCategory}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Price in Modal */}
            <div className="mb-6">
              <label className="text-sm font-medium text-text-primary mb-2 block">Price</label>
              <button
                onClick={() => setShowPriceModal(true)}
                className="w-full bg-bg-light border border-border-light rounded-2xl p-4 hover:bg-white transition-colors text-left flex items-center justify-between"
              >
                <span className={`text-base font-medium text-text-primary ${
                  !selectedMinPrice && !selectedMaxPrice ? "opacity-40" : ""
                }`}>
                  {getPriceDisplayText()}
                </span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Footer with Search Button */}
          <div className="p-4 border-t border-border-light">
            <button
              onClick={() => {
                onSearch?.();
                setShowFilterModal(false);
              }}
              className="w-full bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full py-4 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="text-base font-medium text-white">Search</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryUpdate={handleCategoryUpdate}
        initialTypeId={selectedTypeId}
        initialSubtypeIds={selectedSubTypeIds}
      />

      {/* Mobile Price Modal */}
      <PriceModal
        isOpen={showPriceModal}
        onClose={() => setShowPriceModal(false)}
        onPriceUpdate={handlePriceUpdate}
        initialMinPrice={selectedMinPrice}
        initialMaxPrice={selectedMaxPrice}
        initialShowPriceOnRequest={showPriceOnRequest}
        histogramParams={histogramParams}
      />
    </div>
    </>
  );
}
