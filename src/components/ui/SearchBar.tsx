"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import { useSearchCount } from "@/lib/searchCount";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { LocationDropdown } from "./LocationDropdown";
import { LocationModal } from "./LocationModal";
import { MobileFilterModal } from "./MobileFilterModal";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./Button";
import { useFilter } from "@/contexts/FilterContext";
import { useSearchParams } from "@/hooks/useSearchParams";
import { getPriceDisplayText } from "@/lib/priceUtils";
import { DEBOUNCE } from "@/lib/constants";

interface SearchBarProps {
  pricePlaceholder?: string;
  onCategoryClick?: () => void;
  onPriceClick?: () => void;
  onSearch?: () => void;
  onCountUpdate?: (count: number | undefined) => void;
}

export function SearchBar({
  pricePlaceholder = "Select Price Range",
  onCategoryClick,
  onPriceClick,
  onSearch,
  onCountUpdate,
}: SearchBarProps) {
  const { filter, updateLocation, updateCategory, updatePrice, setMode } = useFilter();
  const [activeDropdown, setActiveDropdown] = useState<
    "location" | "category" | "price" | null
  >(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [debouncedLocation, setDebouncedLocation] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionToken] = useState(() => generateSessionToken());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Build search params
  const { histogramParams, searchCountParams } = useSearchParams();

  // Call search count API
  const { data: searchCount } = useSearchCount(searchCountParams);

  // Notify parent when count changes
  useEffect(() => {
    onCountUpdate?.(searchCount?.count);
  }, [searchCount, onCountUpdate]);

  // Debounce location input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(filter.location);
    }, DEBOUNCE.SEARCH);

    return () => clearTimeout(timer);
  }, [filter.location]);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["mapbox-search", debouncedLocation, sessionToken],
    queryFn: () =>
      searchMapbox({
        query: debouncedLocation,
        sessionToken,
      }),
    enabled:
      debouncedLocation.length > 0 && activeDropdown === "location" && isTyping,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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

  const handleLocationUpdateLocal = useCallback(
    (locationName: string, locationIds: string[], locationId?: string) => {
      updateLocation(locationName, locationIds, locationId);
      setIsTyping(false);
    },
    [updateLocation]
  );

  return (
    <>
      {/* Dark overlay when dropdown is open */}
      {activeDropdown && <div className="fixed inset-0 bg-black/30 z-40" />}

      {/* Mode Toggle - centered, hidden on mobile */}
      <div className="hidden mt-[-59px] md:flex justify-center mb-4">
        <ModeToggle
          mode={filter.mode}
          onModeChange={setMode}
          variant="desktop"
        />
      </div>

      <div
        ref={dropdownRef}
        className="w-full max-w-[900px] h-[67px] md:bg-white md:border md:border-border-light md:rounded-full relative z-50"
      >
        <div className="flex h-full items-center  relative">
          {/* Location Section - Desktop */}
          <div className="hidden md:flex flex-1 md:w-[300px] h-10 md:h-full bg-bg-light relative rounded-full md:rounded-l-full md:rounded-r-none">
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
                  value={filter.location}
                  onChange={(e) => {
                    updateLocation(e.target.value, filter.locationIds, filter.locationId);
                    setIsTyping(true);
                  }}
                  placeholder="Enter location..."
                  className="text-body-sm leading-[1.6] bg-transparent border-none outline-none w-full"
                />
              </div>
            </div>

            {/* Location Dropdown */}
            {activeDropdown === "location" && (
              <LocationDropdown
                isOpen={!isClosing && activeDropdown === "location"}
                onClose={handleDropdownClose}
                onLocationUpdate={handleLocationUpdateLocal}
                searchResults={searchResults}
                isLoading={isLoading}
                hasSearchQuery={isTyping && filter.location.length > 0}
                selectedLocationId={filter.locationId}
              />
            )}
          </div>

          {/* Location Section - Mobile */}
          <div className="absolute md:hidden left-[79px] right-[52px] mt-[-119px] h-10 bg-bg-light rounded-full border-border-light border">
            <div
              onClick={() => setShowLocationModal(true)}
              className="h-full flex items-center gap-[15px] px-3 py-3 cursor-pointer transition-colors rounded-full hover:bg-white"
            >
              <div className="flex-1 flex justify-between opacity-40">
                <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1 ">
                City District, Street, Postcode
                </label>
                <Image src="/icons/search.svg" alt="" width={16} height={16} />
              </div>
            </div>
          </div>
          <div className="px-2 flex items-start justify-center gap-2 w-full md:hidden z-50">
          {/* Mobile Filter Button */}
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setShowFilterModal(true)}
            icon="/icons/filter-purple.svg"
            iconWidth={16}
            iconHeight={16}
            className="text-sm"
            
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled
            icon="/icons/notification-purple.svg"
            iconWidth={16}
            iconHeight={16}
            className="text-sm"
          >
            Create Alert
          </Button>
          <Button
            variant="secondary"
            fullWidth
            disabled
            icon="/icons/map-purple.svg"
            iconWidth={16}
            iconHeight={16}
            className="text-sm"
          >
            Map View
          </Button>
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
                <span className="text-body-sm leading-[1.6]">
                  {filter.category}
                </span>
              </div>
            </div>

            {/* Category Dropdown */}
            {activeDropdown === "category" && (
              <div className="absolute w-full h-full top-0 left-0">
                <CategoryDropdown
                  isOpen={!isClosing && activeDropdown === "category"}
                  onClose={handleDropdownClose}
                  onCategoryUpdate={updateCategory}
                  initialTypeId={filter.typeId}
                  initialSubtypeIds={filter.subTypeIds}
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
                <span
                  className={`text-body-sm leading-[1.6] ${
                    !filter.minPrice && !filter.maxPrice ? "opacity-40" : ""
                  }`}
                >
                  {getPriceDisplayText(filter.minPrice, filter.maxPrice, pricePlaceholder)}
                </span>
              </div>
            </div>

            {/* Search Button */}
            <div className="px-2 py-0 h-full flex items-center">
              <Button
                variant="primary"
                onClick={onSearch}
                icon="/icons/search-white.svg"
                iconWidth={16}
                iconHeight={16}
                className="pl-2 pr-3 py-3"
              >
                Search
              </Button>
            </div>

            {/* Price Dropdown */}
            {activeDropdown === "price" && (
              <div className="absolute w-full h-full top-0 right-0 ">
                <PriceDropdown
                  isOpen={!isClosing && activeDropdown === "price"}
                  onClose={handleDropdownClose}
                  onPriceUpdate={updatePrice}
                  initialMinPrice={filter.minPrice}
                  initialMaxPrice={filter.maxPrice}
                  initialShowPriceOnRequest={filter.showPriceOnRequest}
                  histogramParams={histogramParams}
                />
              </div>
            )}
          </div>
        </div>


        {/* Mobile Filter Modal */}
        <MobileFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={() => {
            onSearch?.();
            setShowFilterModal(false);
          }}
          histogramParams={histogramParams}
        />

        {/* Mobile Location Modal */}
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      </div>
    </>
  );
}
