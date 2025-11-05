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
import { CategoryModal } from "./CategoryModal";
import { PriceModal } from "./PriceModal";
import { LocationModal } from "./LocationModal";
import { Modal } from "./Modal";
import { ModeToggle } from "./ModeToggle";
import { useFilter } from "@/contexts/FilterContext";
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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [debouncedLocation, setDebouncedLocation] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionToken] = useState(() => generateSessionToken());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper function to convert price string to number
  const getPriceNumber = (price: string | null): number => {
    if (!price || price === "No Minimum" || price === "No Maximum") return 0;
    return parseInt(price.replace(/[^0-9]/g, ""));
  };

  // Build histogram params (same as search count but without price filter)
  const histogramParams = {
    type: [parseInt(filter.typeId)],
    rentType: [filter.mode === "rent" ? "rent" : "buy"],
    ...(filter.subTypeIds.length > 0 ? { subType: filter.subTypeIds.map((id) => parseInt(id)) } : {}),
    showPriceOnRequest: filter.showPriceOnRequest,
    sort: "most_recent" as const,
    ...(filter.locationIds.length > 0 ? { withinId: filter.locationIds } : {}),
  };

  // Build search count params
  const searchCountParams = {
    type: [parseInt(filter.typeId)],
    rentType: [filter.mode === "rent" ? "rent" : "buy"],
    ...(filter.subTypeIds.length > 0 ? { subType: filter.subTypeIds.map((id) => parseInt(id)) } : {}),
    showPriceOnRequest: filter.showPriceOnRequest,
    sort: "most_recent" as const,
    ...(filter.locationIds.length > 0 ? { withinId: filter.locationIds } : {}),
    ...(filter.mode === "rent" &&
    filter.minPrice &&
    filter.maxPrice &&
    filter.minPrice !== "No Minimum" &&
    filter.maxPrice !== "No Maximum"
      ? {
          rent: [
            getPriceNumber(filter.minPrice),
            getPriceNumber(filter.maxPrice),
          ] as [number, number],
        }
      : {}),
    ...(filter.mode === "buy" &&
    filter.minPrice &&
    filter.maxPrice &&
    filter.minPrice !== "No Minimum" &&
    filter.maxPrice !== "No Maximum"
      ? {
          price: [
            getPriceNumber(filter.minPrice),
            getPriceNumber(filter.maxPrice),
          ] as [number, number],
        }
      : {}),
  };

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

  const getPriceDisplayText = () => {
    if (!filter.minPrice && !filter.maxPrice) {
      return pricePlaceholder;
    }

    const minText =
      filter.minPrice === "No Minimum"
        ? "0"
        : filter.minPrice?.replace("€", "");
    const maxText =
      filter.maxPrice === "No Maximum"
        ? "∞"
        : filter.maxPrice?.replace("€", "");

    return `${minText} - ${maxText} €`;
  };

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
          <div className="px-2 flex items-start justify-center gap-2 w-full md:hidden">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="md:hidden w-full bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
            <Image src="/icons/filter-purple.svg" alt="" width={16} height={16} />
            <span className="text-body">
              Filters
            </span>
          </button>
          <button
          disabled
            className="md:hidden disabled:opacity-40 w-full bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
            <Image src="/icons/notification-purple.svg" alt="" width={16} height={16} />
            <span className="text-body">
              Create Alert
            </span>
          </button>
          <button
          disabled
            className="md:hidden disabled:opacity-40 w-full bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
            <Image src="/icons/map-purple.svg" alt="" width={16} height={16} />
            <span className="text-body">
              Map View
            </span>
          </button>
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
                <Image src="/icons/search-white.svg" alt="" width={16} height={16} />
                <span className="text-base font-medium text-white leading-[1.5]">
                  Search
                </span>
              </button>
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
        <Modal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={() => {
            onSearch?.();
            setShowFilterModal(false);
          }}
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
                      : getPriceDisplayText()}
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

        {/* Mobile Location Modal */}
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      </div>
    </>
  );
}
