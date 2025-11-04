"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import type { MapboxSuggestion, GroupedSuggestions, MapboxSearchResponse } from "@/types/mapbox";
import { Dropdown } from "./Dropdown";
import { useAllLocations, usePopularLocations, useRecentSearches, type Location } from "@/lib/locations";

interface LocationDropdownProps {
  onClose?: () => void;
  onApply?: (selectedLocation: string, selectedDistricts: string[]) => void;
  onLocationUpdate?: (locationName: string, locationIds: string[], locationId?: string) => void;
  isOpen?: boolean;
  searchResults?: MapboxSearchResponse;
  isLoading?: boolean;
  hasSearchQuery?: boolean;
  selectedLocationId?: string;
}

// City images for popular locations
const cityImages: Record<string, string> = {
  Wien: "/cities/Vienna.png",
  Graz: "/cities/Graz.png",
  Linz: "/cities/Linz.png",
  Salzburg: "/cities/Salzburg.png",
  "Salzburg Stadt": "/cities/Salzburg.png",
  Innsbruck: "/cities/Innsbruck.png",
  "Klagenfurt am Wörthersee": "/cities/Klagenfurt.png",
  Niederösterreich: "/cities/LowerAustria.png",
  Oberösterreich: "/cities/UpperAustria.png",
  Burgenland: "/cities/Burgenland.png",
  Kärnten: "/cities/Carinthia.png",
  Vorarlberg: "/cities/Vorarlberg.png",
  Steiermark: "/cities/Styria.png",
  Tirol: "/cities/Tyrol.png",
};

export function LocationDropdown({
  onClose,
  onApply,
  onLocationUpdate,
  isOpen = true,
  searchResults,
  isLoading = false,
  hasSearchQuery = false,
  selectedLocationId,
}: LocationDropdownProps) {
  const { data: allLocations = [], isLoading: isLoadingAll } = useAllLocations();
  const { data: popularLocations = [], isLoading: isLoadingPopular } = usePopularLocations();
  const { data: recentSearches = [] } = useRecentSearches();

  // Find popular cities from API
  const popularCities = popularLocations;
  const otherLocations = allLocations.filter(
    (loc) => !popularLocations.some((pop) => pop.id === loc.id)
  );

  // Find initial location from prop or default to null
  const findLocationById = (id: string): Location | null => {
    return allLocations.find(loc => loc.id === id) || null;
  };

  const initialLocation = selectedLocationId ? findLocationById(selectedLocationId) : null;

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation
  );
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(
    new Set()
  );
  const [allDistrictsSelected, setAllDistrictsSelected] = useState(true);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedLocation = useRef<string | null>(null);

  // Group suggestions by feature type
  const groupedSuggestions: GroupedSuggestions = {
    places: [],
    localities: [],
    streets: [],
  };

  if (searchResults?.suggestions) {
    for (const suggestion of searchResults.suggestions) {
      if (suggestion.feature_type === "place") {
        groupedSuggestions.places.push(suggestion);
      } else if (suggestion.feature_type === "locality") {
        groupedSuggestions.localities.push(suggestion);
      } else if (suggestion.feature_type === "street") {
        groupedSuggestions.streets.push(suggestion);
      }
    }
  }

  // Animate when switching between locations
  useEffect(() => {
    if (rightPanelRef.current && selectedLocation && previousSelectedLocation.current !== selectedLocation.id) {
      if (previousSelectedLocation.current !== null) {
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
      previousSelectedLocation.current = selectedLocation.id;
    }
  }, [selectedLocation]);

  const toggleDistrict = (districtId: string) => {
    const newSelected = new Set(selectedDistricts);
    if (newSelected.has(districtId)) {
      newSelected.delete(districtId);
    } else {
      newSelected.add(districtId);
    }
    setSelectedDistricts(newSelected);
    setAllDistrictsSelected(false);
  };

  const toggleAllDistricts = () => {
    if (allDistrictsSelected) {
      setAllDistrictsSelected(false);
      setSelectedDistricts(new Set());
    } else {
      setAllDistrictsSelected(true);
      setSelectedDistricts(new Set());
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSelectedDistricts(new Set());
    setAllDistrictsSelected(true);
    // Pass parent ID when all districts selected
    onLocationUpdate?.(location.name, [location.id], location.id);
  };

  // Notify parent when districts change
  useEffect(() => {
    if (!selectedLocation) return;
    const locationIds = allDistrictsSelected
      ? [selectedLocation.id] // Pass parent ID when all districts selected
      : Array.from(selectedDistricts);
    onLocationUpdate?.(selectedLocation.name, locationIds, selectedLocation.id);
  }, [selectedLocation, selectedDistricts, allDistrictsSelected]);

  const isLocationSelected = (location: Location) => {
    return selectedLocation?.id === location.id;
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      className={`flex ${hasSearchQuery ? "w-[300px]" : "w-[570px]"}`}
    >
      {/* Left Panel - Locations */}
      <div className="w-[300px] flex flex-col">
        {/* Draw Area Button */}
        <div className="px-3 py-2">
          <button className="w-full flex items-center gap-2 px-2 py-2 border border-[#eee7ff] rounded-xl hover:border-brand-purple transition-colors">
            <div className="bg-[#f6ecfe] rounded-full p-1">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16Z"
                  fill="#F6ECFE"
                />
                <path
                  d="M24.4001 7.6002C24.4001 6.8646 23.9585 6.357 23.3873 6.0366C22.8377 5.7282 22.1033 5.547 21.3017 5.4318C19.6961 5.2002 17.5637 5.2002 15.4385 5.2002H15.4001C15.241 5.2002 15.0884 5.26341 14.9758 5.37593C14.8633 5.48845 14.8001 5.64107 14.8001 5.8002C14.8001 5.95933 14.8633 6.11194 14.9758 6.22446C15.0884 6.33698 15.241 6.4002 15.4001 6.4002C17.5709 6.4002 19.6205 6.4014 21.1301 6.6186C21.8901 6.7298 22.4465 6.8846 22.7993 7.083C23.1305 7.269 23.2001 7.4358 23.2001 7.6002C23.2001 7.7802 23.1257 7.9458 22.8233 8.1246C22.4961 8.3198 21.9789 8.4722 21.2717 8.5818C19.8641 8.7978 17.9669 8.8002 16.0001 8.8002H15.9617C14.0405 8.8002 12.0545 8.8002 10.5461 9.0318C9.7913 9.1482 9.0905 9.3318 8.5637 9.6438C8.0117 9.9714 7.6001 10.479 7.6001 11.2002C7.6001 12.1506 8.3753 12.7206 9.1865 13.0302C10.0313 13.3518 11.1629 13.5018 12.4001 13.5018V12.3018C11.2361 12.3018 10.2689 12.1578 9.6137 11.9082C8.9249 11.6466 8.8001 11.3658 8.8001 11.2002C8.8001 11.0202 8.8757 10.8546 9.1769 10.6758C9.5041 10.4806 10.0213 10.3282 10.7285 10.2186C12.1361 10.0026 14.0333 10.0002 16.0001 10.0002H16.0385C17.9597 10.0002 19.9457 10.0002 21.4541 9.7686C22.2089 9.6522 22.9097 9.4686 23.4365 9.1566C23.9885 8.829 24.4001 8.3214 24.4001 7.6002ZM14.8001 12.999C14.8001 12.8399 14.8633 12.6873 14.9758 12.5747C15.0884 12.4622 15.241 12.399 15.4001 12.399C15.5592 12.399 15.7118 12.4622 15.8244 12.5747C15.9369 12.6873 16.0001 12.8399 16.0001 12.999V16.0002C16.0001 16.1385 16.0478 16.2726 16.1353 16.3797C16.2228 16.4869 16.3446 16.5605 16.4801 16.5882L19.9553 17.2902C20.1937 17.3384 20.4199 17.4344 20.6202 17.5725C20.8205 17.7106 20.9907 17.8878 21.1206 18.0935C21.2505 18.2992 21.3373 18.5291 21.3759 18.7693C21.4144 19.0095 21.4039 19.255 21.3449 19.491L20.3477 23.4846C20.32 23.5956 20.2611 23.6965 20.178 23.7751C20.0948 23.8538 19.9909 23.9071 19.8785 23.9286L17.4785 24.3906C17.3057 24.4242 17.1065 24.381 16.8977 24.2394C16.6757 24.0844 16.4979 23.8743 16.3817 23.6298C16.0201 22.8579 15.4192 22.2233 14.6681 21.8202L10.0397 19.0722C10.1599 18.8017 10.3819 18.5895 10.6576 18.4817C10.9332 18.3739 11.2403 18.3791 11.5121 18.4962L13.9625 19.5522C14.0539 19.5916 14.1536 19.6077 14.2527 19.5989C14.3518 19.5902 14.4472 19.557 14.5303 19.5022C14.6133 19.4475 14.6815 19.3729 14.7286 19.2853C14.7757 19.1977 14.8003 19.0997 14.8001 19.0002V12.999ZM15.4001 11.199C14.9227 11.199 14.4649 11.3886 14.1273 11.7262C13.7897 12.0638 13.6001 12.5216 13.6001 12.999V18.0894L11.9861 17.3934C11.6867 17.2645 11.3635 17.2001 11.0375 17.2042C10.7115 17.2084 10.3901 17.2811 10.0941 17.4176C9.79801 17.554 9.53398 17.7513 9.31912 17.9964C9.10426 18.2416 8.94337 18.5292 8.8469 18.8406C8.77823 19.062 8.78612 19.3001 8.86928 19.5165C8.95243 19.7329 9.10603 19.915 9.3053 20.0334L14.0669 22.8594L14.0909 22.8714C14.7173 23.2074 15.0821 23.691 15.2981 24.1458C15.5009 24.5694 15.8249 24.963 16.2269 25.2342C16.6313 25.5078 17.1485 25.6758 17.7041 25.569L20.1053 25.107C20.4423 25.0422 20.7538 24.8823 21.003 24.6463C21.2521 24.4103 21.4286 24.108 21.5117 23.775L22.5089 19.7826C22.6073 19.3892 22.6249 18.98 22.5607 18.5796C22.4965 18.1793 22.3517 17.7961 22.1353 17.4532C21.9188 17.1103 21.6351 16.8149 21.3012 16.5847C20.9674 16.3546 20.5903 16.1945 20.1929 16.1142L17.2001 15.5094V12.999C17.2001 12.5216 17.0105 12.0638 16.6729 11.7262C16.3353 11.3886 15.8775 11.199 15.4001 11.199Z"
                  fill="#A440F1"
                />
              </svg>
            </div>
            <span className="text-sm font-medium text-text-primary flex-1 text-left">
              Draw an area on the map
            </span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12H20M20 12L14 6M20 12L14 18"
                stroke="#A440F1"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto max-h-[490px] px-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Search Results */}
          {hasSearchQuery && (
            <div className="space-y-4">
              {/* Places */}
              {groupedSuggestions.places.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">
                    Places
                  </p>
                  <div className="space-y-1">
                    {groupedSuggestions.places.map((place) => (
                      <button
                        key={place.mapbox_id}
                        onClick={() => {
                          onLocationUpdate?.(place.name, []);
                        }}
                        className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-[#f7f7fd] w-full text-left"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0 mt-0.5"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            fill="#A440F1"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">
                            {place.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {place.place_formatted}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Localities */}
              {groupedSuggestions.localities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">
                    Localities
                  </p>
                  <div className="space-y-1">
                    {groupedSuggestions.localities.map((locality) => (
                      <button
                        key={locality.mapbox_id}
                        onClick={() => {
                          onLocationUpdate?.(locality.name, []);
                        }}
                        className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-[#f7f7fd] w-full text-left"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0 mt-0.5"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            fill="#A440F1"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">
                            {locality.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {locality.place_formatted}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Streets */}
              {groupedSuggestions.streets.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-text-secondary mb-2">
                    Streets
                  </p>
                  <div className="space-y-1">
                    {groupedSuggestions.streets.map((street) => (
                      <button
                        key={street.mapbox_id}
                        onClick={() => {
                          onLocationUpdate?.(street.name, []);
                        }}
                        className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-[#f7f7fd] w-full text-left"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="shrink-0 mt-0.5"
                        >
                          <path
                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                            fill="#A440F1"
                          />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary">
                            {street.name}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {street.place_formatted}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isLoading &&
                searchResults &&
                searchResults.suggestions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-text-secondary">
                      No results found
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Original Location List (when not searching) */}
          {!hasSearchQuery && (
            <>
              {isLoadingAll || isLoadingPopular ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">Loading locations...</p>
                </div>
              ) : (
                <>
                  {/* Recent Searches Section */}
                  {recentSearches.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-text-secondary mb-2">
                        Recent Searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.slice(0, 3).map((search, index) => (
                          <button
                            key={`${search.mapboxId}-${index}`}
                            onClick={() => {
                              onLocationUpdate?.(search.name, []);
                            }}
                            className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-[#f7f7fd] w-full text-left"
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="shrink-0 mt-0.5"
                            >
                              <path
                                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                fill="#A440F1"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary">
                                {search.name}
                              </p>
                              <p className="text-xs text-text-secondary capitalize">
                                {search.type}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* By City Section */}
                  <div className="mb-2">
                    <p className="text-sm font-medium text-text-secondary mb-2">
                      Popular Locations
                    </p>

                    {/* Popular Cities Grid */}
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {popularCities.map((city) => {
                const isSelected = isLocationSelected(city);
                return (
                  <button
                    key={city.id}
                    onClick={() => handleLocationSelect(city)}
                    className={`flex flex-col p-1 rounded-md border ${
                      isSelected ? "border-brand-purple" : "border-transparent"
                    }`}
                  >
                    <div className="relative h-20 w-full rounded overflow-hidden mb-1">
                      <img
                        src={cityImages[city.name] || "/cities/Vienna.png"}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <mask id="path-1-inside-1_2001_4768" fill="white">
                              <path d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z" />
                            </mask>
                            <path
                              d="M0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8Z"
                              fill="#A440F1"
                            />
                            <path
                              d="M8 16V15C4.13401 15 1 11.866 1 8H0H-1C-1 12.9706 3.02944 17 8 17V16ZM16 8H15C15 11.866 11.866 15 8 15V16V17C12.9706 17 17 12.9706 17 8H16ZM8 0V1C11.866 1 15 4.13401 15 8H16H17C17 3.02944 12.9706 -1 8 -1V0ZM8 0V-1C3.02944 -1 -1 3.02944 -1 8H0H1C1 4.13401 4.13401 1 8 1V0Z"
                              fill="white"
                              mask="url(#path-1-inside-1_2001_4768)"
                            />
                            <path
                              d="M6.69267 9.43244L4.96637 7.70614L4.2251 8.4474L6.69267 10.915L11.7814 5.82623L11.0402 5.08496L6.69267 9.43244Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <p
                        className={`text-sm font-medium leading-normal overflow-hidden text-ellipsis whitespace-nowrap ${
                          isSelected ? "text-text-primary" : "text-text-primary"
                        }`}
                      >
                        {city.name}
                      </p>
                      <p
                        className={`text-[10px] font-medium leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap ${
                          isSelected
                            ? "text-brand-purple"
                            : "text-text-secondary"
                        }`}
                      >
                        {isSelected
                          ? "All Districts"
                          : `${city.children.length} Districts`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* By State Section */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">
              Other Locations
            </p>

            {/* State/Region List */}
            <div className="flex flex-col">
              {otherLocations.map((location) => {
                const isSelected = isLocationSelected(location);
                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={`flex items-center justify-between px-2 py-2 rounded-lg w-full ${
                      isSelected ? "bg-[#fdfbff]" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          cityImages[location.name] ||
                          "/cities/LowerAustria.png"
                        }
                        alt={location.name}
                        className="w-[38px] h-[38px] rounded object-cover shrink-0"
                      />
                      <div className="flex flex-col items-start">
                        <p className="text-sm font-medium text-text-primary leading-normal">
                          {location.name}
                        </p>
                        <p className="text-[10px] font-medium text-text-secondary leading-[1.3]">
                          {location.children.length} Districts
                        </p>
                      </div>
                    </div>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="shrink-0"
                    >
                      <path
                        d="M9 18L15 12L9 6"
                        stroke="#79767D"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
              </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Panel - Districts */}
      {!hasSearchQuery && selectedLocation && (
        <div className="w-[270px] border-l border-border-light flex flex-col">
          <div ref={rightPanelRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-3">
            <p className="text-base font-semibold text-text-primary leading-[1.2]">
              {selectedLocation.name}
            </p>
          </div>

          {/* Districts List */}
          <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* All Districts Option */}
            <button
              onClick={toggleAllDistricts}
              className="flex items-center gap-3 px-3 py-2 border-b border-border-light w-full"
            >
              <div
                className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                  allDistrictsSelected
                    ? "bg-brand-purple border-brand-purple-200"
                    : "bg-white border-brand-purple-200"
                }`}
              >
                {allDistrictsSelected && (
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-normal text-left">
                  All Districts
                </p>
                <p className="text-xs font-medium text-text-primary opacity-60 leading-normal text-left">
                  {selectedLocation.children.length} Districts
                </p>
              </div>
            </button>

            {/* Individual Districts */}
            {selectedLocation.children.map((district) => {
              const isChecked =
                !allDistrictsSelected && selectedDistricts.has(district.id);

              return (
                <button
                  key={district.id}
                  onClick={() => toggleDistrict(district.id)}
                  className="flex items-center gap-3 px-3 py-2.5 h-10 hover:bg-[#f7f7fd] w-full"
                >
                  <div
                    className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                      isChecked
                        ? "bg-brand-purple border-brand-purple-200"
                        : "bg-white border-brand-purple-200"
                    }`}
                  >
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
                  <span className="text-sm font-medium text-text-primary leading-normal flex-1 text-left">
                    {district.postal_code
                      ? `${district.postal_code}, ${district.name}`
                      : district.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      )}
    </Dropdown>
  );
}
