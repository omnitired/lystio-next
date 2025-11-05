"use client";

import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
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
  const [activeDropdown, setActiveDropdown] = useState<
    "location" | "category" | "price" | null
  >(null);
  const [isClosing, setIsClosing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedMinPrice, setSelectedMinPrice] = useState<string | null>(null);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [debouncedLocation, setDebouncedLocation] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [sessionToken] = useState(() => generateSessionToken());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Filter states for API (initialize with Houses type and all its subtypes, no default location)
  const [selectedTypeId, setSelectedTypeId] = useState<string>("3");
  const [selectedSubTypeIds, setSelectedSubTypeIds] = useState<string[]>([
    "202",
    "8",
    "9",
    "10",
    "11",
    "13",
    "14",
    "18",
    "19",
    "20",
    "22",
    "57",
    "87",
  ]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [showPriceOnRequest, setShowPriceOnRequest] = useState<boolean>(true);

  // Helper function to convert price string to number
  const getPriceNumber = (price: string | null): number => {
    if (!price || price === "No Minimum" || price === "No Maximum") return 0;
    return parseInt(price.replace(/[^0-9]/g, ""));
  };

  // Build histogram params (same as search count but without price filter)
  const histogramParams =
    selectedLocationIds.length > 0 && selectedSubTypeIds.length > 0
      ? {
          type: [parseInt(selectedTypeId)],
          rentType: [mode === "rent" ? "rent" : "buy"],
          subType: selectedSubTypeIds.map((id) => parseInt(id)),
          showPriceOnRequest,
          sort: "most_recent" as const,
          withinId: selectedLocationIds,
        }
      : null;

  // Build search count params
  const searchCountParams =
    selectedLocationIds.length > 0 && selectedSubTypeIds.length > 0
      ? {
          type: [parseInt(selectedTypeId)],
          rentType: [mode === "rent" ? "rent" : "buy"],
          subType: selectedSubTypeIds.map((id) => parseInt(id)),
          showPriceOnRequest,
          sort: "most_recent" as const,
          withinId: selectedLocationIds,
          ...(mode === "rent" &&
          selectedMinPrice &&
          selectedMaxPrice &&
          selectedMinPrice !== "No Minimum" &&
          selectedMaxPrice !== "No Maximum"
            ? {
                rent: [
                  getPriceNumber(selectedMinPrice),
                  getPriceNumber(selectedMaxPrice),
                ] as [number, number],
              }
            : {}),
          ...(mode === "buy" &&
          selectedMinPrice &&
          selectedMaxPrice &&
          selectedMinPrice !== "No Minimum" &&
          selectedMaxPrice !== "No Maximum"
            ? {
                price: [
                  getPriceNumber(selectedMinPrice),
                  getPriceNumber(selectedMaxPrice),
                ] as [number, number],
              }
            : {}),
        }
      : null;

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

  const handlePriceUpdate = useCallback(
    (min: string, max: string, showOnRequest: boolean) => {
      setSelectedMinPrice(min);
      setSelectedMaxPrice(max);
      setShowPriceOnRequest(showOnRequest);
    },
    []
  );

  const handleCategoryUpdate = useCallback(
    (categoryName: string, typeId: string, subtypeIds: string[]) => {
      setSelectedCategory(categoryName);
      setSelectedTypeId(typeId);
      setSelectedSubTypeIds(subtypeIds);
    },
    []
  );

  const handleLocationUpdate = useCallback(
    (locationName: string, locationIds: string[], locationId?: string) => {
      setSelectedLocation(locationName);
      setSelectedLocationIds(locationIds);
      if (locationId) {
        setSelectedLocationId(locationId);
      }
      setIsTyping(false);
    },
    []
  );

  const getPriceDisplayText = () => {
    if (!selectedMinPrice && !selectedMaxPrice) {
      return pricePlaceholder;
    }

    const minText =
      selectedMinPrice === "No Minimum"
        ? "0"
        : selectedMinPrice?.replace("€", "");
    const maxText =
      selectedMaxPrice === "No Maximum"
        ? "∞"
        : selectedMaxPrice?.replace("€", "");

    return `${minText} - ${maxText} €`;
  };

  return (
    <>
      {/* Dark overlay when dropdown is open */}
      {activeDropdown && <div className="fixed inset-0 bg-black/30 z-40" />}

      {/* Mode Toggle - centered, hidden on mobile */}
      <div className="hidden mt-[-59px] md:flex justify-center mb-4">
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

      <div
        ref={dropdownRef}
        className="w-full max-w-[900px] h-[67px] md:bg-white md:border md:border-border-light md:rounded-full relative z-50"
      >
        <div className="flex h-full items-center">
          {/* Location Section */}
          <div className="flex-1 max-md: max-md:ml-[79px] max-md:mr-[52px] max-md:mt-[-119px] md:w-[300px] h-10 md:h-full bg-bg-light relative rounded-full md:rounded-l-full md:rounded-r-none">
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
            {activeDropdown === "location" && (
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
            {activeDropdown === "category" && (
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
                <span
                  className={`text-sm font-medium text-text-primary leading-[1.6] ${
                    !selectedMinPrice && !selectedMaxPrice ? "opacity-40" : ""
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
            {activeDropdown === "price" && (
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
        <div className="px-2 flex items-center justify-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowFilterModal(true)}
            className="md:hidden w-full mt-3 bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4.66406H4M4 4.66406C4 4.04273 4 3.73206 4.10133 3.4874C4.16834 3.32552 4.2666 3.17843 4.39048 3.05454C4.51437 2.93066 4.66145 2.8324 4.82333 2.7654C5.068 2.66406 5.37867 2.66406 6 2.66406C6.62133 2.66406 6.932 2.66406 7.17667 2.7654C7.33855 2.8324 7.48563 2.93066 7.60952 3.05454C7.7334 3.17843 7.83166 3.32552 7.89867 3.4874C8 3.73206 8 4.04273 8 4.66406C8 5.2854 8 5.59606 7.89867 5.84073C7.83166 6.00261 7.7334 6.14969 7.60952 6.27358C7.48563 6.39747 7.33855 6.49572 7.17667 6.56273C6.932 6.66406 6.62133 6.66406 6 6.66406C5.37867 6.66406 5.068 6.66406 4.82333 6.56273C4.66145 6.49572 4.51437 6.39747 4.39048 6.27358C4.2666 6.14969 4.16834 6.00261 4.10133 5.84073C4 5.59606 4 5.2854 4 4.66406ZM2 11.3307H6M12 11.3307H14M12 11.3307C12 10.7094 12 10.3987 11.8987 10.1541C11.8317 9.99218 11.7334 9.8451 11.6095 9.72121C11.4856 9.59733 11.3385 9.49907 11.1767 9.43206C10.932 9.33073 10.6213 9.33073 10 9.33073C9.37867 9.33073 9.068 9.33073 8.82333 9.43206C8.66145 9.49907 8.51437 9.59733 8.39048 9.72121C8.2666 9.8451 8.16834 9.99218 8.10133 10.1541C8 10.3987 8 10.7094 8 11.3307C8 11.9521 8 12.2627 8.10133 12.5074C8.16834 12.6693 8.2666 12.8164 8.39048 12.9402C8.51437 13.0641 8.66145 13.1624 8.82333 13.2294C9.068 13.3307 9.37867 13.3307 10 13.3307C10.6213 13.3307 10.932 13.3307 11.1767 13.2294C11.3385 13.1624 11.4856 13.0641 11.6095 12.9402C11.7334 12.8164 11.8317 12.6693 11.8987 12.5074C12 12.2627 12 11.9521 12 11.3307ZM10 4.66406H14"
                stroke="#A540F3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="text-base font-medium text-text-primary">
              Filters
            </span>
          </button>
          <button
          disabled
            className="md:hidden disabled:opacity-80 w-full mt-3 bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7.99935 14.6693C7.63268 14.6693 7.3189 14.5388 7.05802 14.2779C6.79713 14.0171 6.66646 13.7031 6.66602 13.3359H9.33268C9.33268 13.7026 9.20224 14.0166 8.94135 14.2779C8.68046 14.5393 8.36646 14.6697 7.99935 14.6693ZM11.9993 8.66927V6.66927H9.99935V5.33594H11.9993V3.33594H13.3327V5.33594H15.3327V6.66927H13.3327V8.66927H11.9993ZM2.66602 12.6693V11.3359H3.99935V6.66927C3.99935 5.74705 4.27713 4.92772 4.83268 4.21127C5.38824 3.49483 6.11046 3.02527 6.99935 2.80261V2.33594C6.99935 2.05816 7.09668 1.82216 7.29135 1.62794C7.48602 1.43372 7.72202 1.33638 7.99935 1.33594C8.27668 1.33549 8.5129 1.43283 8.70802 1.62794C8.90313 1.82305 9.00024 2.05905 8.99935 2.33594V2.80261C9.1549 2.84705 9.30779 2.89438 9.45802 2.94461C9.60824 2.99483 9.74979 3.05861 9.88268 3.13594C9.71602 3.29149 9.56602 3.46105 9.43268 3.64461C9.29935 3.82816 9.18268 4.02527 9.08268 4.23594C8.91602 4.15816 8.7409 4.09994 8.55735 4.06127C8.37379 4.02261 8.18779 4.00305 7.99935 4.00261C7.26602 4.00261 6.63824 4.26372 6.11602 4.78594C5.59379 5.30816 5.33268 5.93594 5.33268 6.66927V11.3359H10.666V9.46927C10.866 9.59149 11.0771 9.69149 11.2993 9.76927C11.5216 9.84705 11.7549 9.90816 11.9993 9.95261V11.3359H13.3327V12.6693H2.66602Z" fill="#A440F1"/>
</svg>


            <span className="text-base font-medium text-text-primary">
              Create Alert
            </span>
          </button>
          <button
          disabled
            className="md:hidden disabled:opacity-80 w-full mt-3 bg-white border border-border-light rounded-lg shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] h-10 flex items-center justify-center gap-2 relative z-50"
          >
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fillRule="evenodd" clipRule="evenodd" d="M11.9073 2.10783L12.014 2.14383L12.8153 2.4105C13.124 2.51383 13.3953 2.60383 13.6093 2.70383C13.8413 2.81183 14.054 2.9505 14.2167 3.1765C14.3793 3.4025 14.444 3.64783 14.4733 3.90183C14.5 4.13717 14.5 4.4225 14.5 4.7485V10.2232C14.5 10.6885 14.5 11.0812 14.464 11.3918C14.4267 11.7145 14.3427 12.0332 14.1073 12.2905C13.968 12.443 13.7987 12.5651 13.61 12.6492C13.2913 12.7905 12.9627 12.7692 12.6447 12.7032C12.338 12.6392 11.966 12.5152 11.5247 12.3678L11.496 12.3585C10.7493 12.1092 10.4927 12.0318 10.2447 12.0405C10.1456 12.0441 10.0472 12.0573 9.95067 12.0798C9.70867 12.1365 9.482 12.2792 8.82667 12.7158L7.90533 13.3305L7.812 13.3925C7.104 13.8652 6.612 14.1932 6.036 14.2705C5.46067 14.3478 4.89933 14.1605 4.09267 13.8905L3.986 13.8552L3.18467 13.5885C2.876 13.4852 2.60467 13.3952 2.39067 13.2952C2.15867 13.1872 1.946 13.0485 1.78333 12.8218C1.62067 12.5965 1.556 12.3512 1.52667 12.0965C1.5 11.8612 1.5 11.5765 1.5 11.2505V5.77583C1.5 5.30983 1.5 4.91717 1.536 4.60717C1.57333 4.2845 1.65733 3.96583 1.89267 3.7085C2.03198 3.55597 2.20129 3.43387 2.39 3.34983C2.70867 3.20783 3.038 3.22917 3.35533 3.29583C3.662 3.35917 4.034 3.48383 4.47533 3.63117L4.504 3.6405C5.25067 3.88917 5.50733 3.96717 5.756 3.9585C5.85482 3.95488 5.95305 3.94171 6.04933 3.91917C6.29133 3.86183 6.518 3.71917 7.17333 3.28317L8.09467 2.6685L8.188 2.60583C8.896 2.13383 9.388 1.80583 9.96333 1.7285C10.5393 1.65117 11.1007 1.83783 11.9073 2.10783ZM10.5 2.73717V11.0525C10.8573 11.0912 11.2333 11.2165 11.7287 11.3818L11.812 11.4098C12.29 11.5692 12.6067 11.6738 12.8487 11.7245C13.086 11.7738 13.1667 11.7512 13.2033 11.7352C13.2663 11.7072 13.3228 11.6666 13.3693 11.6158C13.396 11.5865 13.4427 11.5165 13.4707 11.2758C13.4993 11.0305 13.5 10.6965 13.5 10.1932V4.7745C13.5 4.4145 13.4993 4.18783 13.48 4.01583C13.4613 3.8565 13.432 3.79717 13.4053 3.76117C13.3793 3.72517 13.3327 3.67783 13.188 3.6105C13.0307 3.53717 12.8147 3.46517 12.4747 3.35117L11.698 3.0925C11.1067 2.89517 10.756 2.78383 10.5 2.73717ZM9.5 11.1725V2.95517C9.29267 3.07517 9.02667 3.24917 8.64933 3.5005L7.728 4.11517L7.65467 4.16383C7.196 4.4705 6.854 4.6985 6.5 4.8265V13.0438C6.70733 12.9238 6.97333 12.7492 7.35067 12.4978L8.272 11.8838L8.34533 11.8352C8.804 11.5285 9.146 11.3005 9.5 11.1725ZM5.5 13.2625V4.94583C5.14267 4.90717 4.76667 4.78183 4.27133 4.6165L4.188 4.5885C3.71 4.42917 3.39333 4.3245 3.15067 4.27383C2.914 4.2245 2.83333 4.2465 2.79733 4.2625C2.73407 4.29054 2.67732 4.3314 2.63067 4.3825C2.604 4.41117 2.55733 4.48117 2.52933 4.72183C2.50067 4.96717 2.5 5.30183 2.5 5.80517V11.2238C2.5 11.5838 2.50067 11.8105 2.52 11.9825C2.53867 12.1418 2.568 12.2005 2.59467 12.2372C2.62067 12.2732 2.66733 12.3205 2.812 12.3878C2.96933 12.4612 3.18533 12.5332 3.52533 12.6472L4.302 12.9058C4.89333 13.1025 5.24333 13.2145 5.5 13.2618" fill="#A540F3"/>
</svg>


            <span className="text-base font-medium text-text-primary">
              Map View
            </span>
          </button>
        </div>

        {/* Mobile Filter Modal */}
        {showFilterModal && (
          <div className="md:hidden fixed inset-0 bg-white z-[100] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-2xl font-bold text-black">All Filters</h2>
              <button onClick={() => setShowFilterModal(false)}>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6">
              {/* Mode Toggle */}
              <div className="bg-[#F7F7FD] rounded-[32px] p-2 flex mb-8">
                <button
                  onClick={() => onModeChange?.("rent")}
                  className={`flex-1 py-3 rounded-[28px] text-lg font-semibold transition-colors ${
                    mode === "rent"
                      ? "bg-white text-black shadow-sm"
                      : "text-black/60"
                  }`}
                >
                  Rent
                </button>
                <button
                  onClick={() => onModeChange?.("buy")}
                  className={`flex-1 py-3 rounded-[28px] text-lg font-semibold transition-colors ${
                    mode === "buy"
                      ? "bg-white text-black shadow-sm"
                      : "text-black/60"
                  }`}
                >
                  Buy
                </button>
              </div>

              {/* Category Row */}
              <button
                onClick={() => setShowCategoryModal(true)}
                className="w-full flex items-center justify-between py-5 border-b border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 22V12H15V22"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xl font-normal text-black">
                    Category
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-normal text-brand-purple">
                    {selectedCategory}
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="#A540F3"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Price Row */}
              <button
                onClick={() => setShowPriceModal(true)}
                className="w-full flex items-center justify-between py-5 border-b border-gray-200"
              >
                <div className="flex items-center gap-4">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 28 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="14"
                      cy="14"
                      r="12"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M17 9.5C16.5 9 15.5 8.5 14 8.5C11.5 8.5 9.5 10.5 9.5 13C9.5 15.5 11.5 17.5 14 17.5C15.5 17.5 16.5 17 17 16.5M8 11H16M8 15H16"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xl font-normal text-black">Price</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xl font-normal ${
                      !selectedMinPrice && !selectedMaxPrice
                        ? "text-gray-400"
                        : "text-gray-600"
                    }`}
                  >
                    {!selectedMinPrice && !selectedMaxPrice
                      ? "Any Price"
                      : getPriceDisplayText()}
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 6L15 12L9 18"
                      stroke="#9CA3AF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Modal Footer with Search Button */}
            <div className="px-6 py-6">
              <button
                onClick={() => {
                  onSearch?.();
                  setShowFilterModal(false);
                }}
                className="w-full bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full py-4 flex items-center justify-center gap-2"
              >
                <svg
                  width="20"
                  height="20"
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
                <span className="text-lg font-semibold text-white">Search</span>
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
