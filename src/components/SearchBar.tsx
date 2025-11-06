"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import { useSearchCount } from "@/lib/searchCount";
import { PriceDropdown } from "./PriceDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { LocationDropdown } from "./LocationDropdown";
import { LocationModal } from "./LocationModal";
import { MobileFilterModal } from "./MobileFilterModal";
import { ModeToggle } from "./ui/ModeToggle";
import { Button } from "./ui/Button";
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

type DropdownType = "location" | "category" | "price" | null;

// Internal Components
interface SearchSectionProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  roundedStyle?: "left" | "right" | "none";
  children: React.ReactNode;
  dropdown?: React.ReactNode;
}

function SearchSection({
  label,
  isActive,
  onClick,
  roundedStyle = "none",
  children,
  dropdown,
}: SearchSectionProps) {
  const roundedClass =
    roundedStyle === "left"
      ? "rounded-l-full"
      : roundedStyle === "right"
        ? "rounded-r-full"
        : "";

  return (
    <div
      className={`hidden md:flex flex-1 bg-bg-light h-full border-l border-border-light relative ${roundedClass} first:border-l-0`}
    >
      <div
        onClick={onClick}
        className={`w-full h-full flex items-center gap-[15px] px-3 py-2 cursor-pointer transition-colors ${roundedClass} ${
          isActive ? "bg-white" : "hover:bg-white"
        }`}
      >
        <div className="flex-1 flex flex-col">
          <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
            {label}
          </label>
          {children}
        </div>
      </div>
      {dropdown}
    </div>
  );
}

interface MobileButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

function MobileButton({ icon, label, onClick, disabled }: MobileButtonProps) {
  return (
    <Button
      variant="secondary"
      fullWidth
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      iconWidth={16}
      iconHeight={16}
      className="text-sm"
    >
      {label}
    </Button>
  );
}

export function SearchBar({
  pricePlaceholder = "Select Price Range",
  onCategoryClick,
  onPriceClick,
  onSearch,
  onCountUpdate,
}: SearchBarProps) {
  const { filter, updateLocation, updateCategory, updatePrice, setMode } =
    useFilter();
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (dropdown: DropdownType) => {
    setActiveDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  const handleDropdownClose = useCallback(() => {
    setActiveDropdown(null);
  }, []);

  const handleLocationUpdateLocal = useCallback(
    (locationName: string, locationIds: string[], locationId?: string) => {
      updateLocation(locationName, locationIds, locationId);
      setIsTyping(false);
    },
    [updateLocation],
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
        <div className="flex h-full items-center relative">
          {/* Location Section - Desktop */}
          <div className="hidden md:flex flex-1 md:w-[300px] h-10 md:h-full bg-bg-light relative rounded-full md:rounded-l-full md:rounded-r-none">
            <div
              onClick={() => toggleDropdown("location")}
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
                    updateLocation(
                      e.target.value,
                      filter.locationIds,
                      filter.locationId,
                    );
                    setIsTyping(true);
                  }}
                  placeholder="Enter location..."
                  className="text-body-sm leading-[1.6] bg-transparent border-none outline-none w-full"
                />
              </div>
            </div>

            {activeDropdown === "location" && (
              <LocationDropdown
                isOpen={true}
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
                <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                  City District, Street, Postcode
                </label>
                <Image src="/icons/search.svg" alt="" width={16} height={16} />
              </div>
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="px-2 flex items-start justify-center gap-2 w-full md:hidden z-50">
            <MobileButton
              icon="/icons/filter-purple.svg"
              label="Filters"
              onClick={() => setShowFilterModal(true)}
            />
            <MobileButton
              icon="/icons/notification-purple.svg"
              label="Create Alert"
              disabled
            />
            <MobileButton
              icon="/icons/map-purple.svg"
              label="Map View"
              disabled
            />
          </div>

          {/* Category Section - Desktop */}
          <SearchSection
            label="Category"
            isActive={activeDropdown === "category"}
            onClick={() => {
              toggleDropdown("category");
              onCategoryClick?.();
            }}
            dropdown={
              activeDropdown === "category" && (
                <div className="absolute w-full h-full top-0 left-0">
                  <CategoryDropdown
                    isOpen={true}
                    onClose={handleDropdownClose}
                    onCategoryUpdate={updateCategory}
                    initialTypeId={filter.typeId}
                    initialSubtypeIds={filter.subTypeIds}
                  />
                </div>
              )
            }
          >
            <span className="text-body-sm leading-[1.6]">
              {filter.category}
            </span>
          </SearchSection>

          {/* Price Section + Search Button - Desktop */}
          <div className="hidden md:flex flex-1 bg-bg-light h-full items-center border-l border-border-light relative rounded-r-full">
            <div
              onClick={() => {
                toggleDropdown("price");
                onPriceClick?.();
              }}
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
                  {getPriceDisplayText(
                    filter.minPrice,
                    filter.maxPrice,
                    pricePlaceholder,
                  )}
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

            {activeDropdown === "price" && (
              <div className="absolute w-full h-full top-0 right-0">
                <PriceDropdown
                  isOpen={true}
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

        {/* Mobile Modals */}
        <MobileFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={() => {
            onSearch?.();
            setShowFilterModal(false);
          }}
          histogramParams={histogramParams}
        />

        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      </div>
    </>
  );
}
