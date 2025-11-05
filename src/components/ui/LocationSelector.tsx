"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { ChevronDownIcon, ChevronUpIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { MapboxSearchResponse, GroupedSuggestions } from "@/types/mapbox";
import { useAllLocations, usePopularLocations, useRecentSearches, type Location } from "@/lib/locations";

interface LocationSelectorProps {
  onLocationUpdate?: (locationName: string, locationIds: string[], locationId?: string) => void;
  searchResults?: MapboxSearchResponse;
  isLoading?: boolean;
  hasSearchQuery?: boolean;
  selectedLocationId?: string;
  variant?: "dropdown" | "modal";
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

export function LocationSelector({
  onLocationUpdate,
  searchResults,
  isLoading = false,
  hasSearchQuery = false,
  selectedLocationId,
  variant = "dropdown"
}: LocationSelectorProps) {
  const { data: allLocations = [], isLoading: isLoadingAll } = useAllLocations();
  const { data: popularLocations = [], isLoading: isLoadingPopular } = usePopularLocations();
  const { data: recentSearches = [] } = useRecentSearches();

  const popularCities = popularLocations;
  const otherLocations = allLocations.filter(
    (loc) => !popularLocations.some((pop) => pop.id === loc.id)
  );

  const findLocationById = (id: string): Location | null => {
    return allLocations.find(loc => loc.id === id) || null;
  };

  const initialLocation = selectedLocationId ? findLocationById(selectedLocationId) : null;

  const [expandedLocation, setExpandedLocation] = useState<string | null>(variant === "modal" ? selectedLocationId || null : null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation);
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(new Set());
  const [allDistrictsSelected, setAllDistrictsSelected] = useState(true);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedLocation = useRef<string | null>(null);
  const districtRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const isModal = variant === "modal";
  const isDropdown = variant === "dropdown";

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

  // Dropdown: animate when switching between locations (left to right)
  useEffect(() => {
    if (isDropdown && rightPanelRef.current && selectedLocation && previousSelectedLocation.current !== selectedLocation.id) {
      if (previousSelectedLocation.current !== null) {
        gsap.fromTo(
          rightPanelRef.current,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }
        );
      }
      previousSelectedLocation.current = selectedLocation.id;
    }
  }, [selectedLocation, isDropdown]);

  // Modal: animate when expanding (opening animation)
  useEffect(() => {
    if (isModal && expandedLocation) {
      const ref = districtRefs.current.get(expandedLocation);
      if (ref) {
        gsap.fromTo(
          ref,
          { opacity: 0, height: 0 },
          { opacity: 1, height: "auto", duration: 0.3, ease: "power2.out" }
        );
      }
    }
  }, [expandedLocation, isModal]);

  // Dropdown: notify parent immediately on change
  useEffect(() => {
    if (isDropdown && selectedLocation) {
      const locationIds = allDistrictsSelected
        ? [selectedLocation.id]
        : Array.from(selectedDistricts);
      onLocationUpdate?.(selectedLocation.name, locationIds, selectedLocation.id);
    }
  }, [selectedLocation, selectedDistricts, allDistrictsSelected, isDropdown]);

  const toggleLocation = (location: Location) => {
    if (isModal) {
      if (expandedLocation === location.id) {
        // Closing current
        const ref = districtRefs.current.get(location.id);
        if (ref) {
          gsap.to(ref, {
            opacity: 0,
            height: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setExpandedLocation(null);
            }
          });
        } else {
          setExpandedLocation(null);
        }
      } else {
        // Opening new one (possibly closing another)
        if (expandedLocation) {
          const prevRef = districtRefs.current.get(expandedLocation);
          if (prevRef) {
            gsap.to(prevRef, {
              opacity: 0,
              height: 0,
              duration: 0.3,
              ease: "power2.in",
              onComplete: () => {
                setExpandedLocation(location.id);
                setSelectedLocation(location);
                setSelectedDistricts(new Set());
                setAllDistrictsSelected(true);
                onLocationUpdate?.(location.name, [location.id], location.id);
              }
            });
          } else {
            setExpandedLocation(location.id);
            setSelectedLocation(location);
            setSelectedDistricts(new Set());
            setAllDistrictsSelected(true);
            onLocationUpdate?.(location.name, [location.id], location.id);
          }
        } else {
          // Nothing expanded, just open
          setExpandedLocation(location.id);
          setSelectedLocation(location);
          setSelectedDistricts(new Set());
          setAllDistrictsSelected(true);
          onLocationUpdate?.(location.name, [location.id], location.id);
        }
      }
    } else {
      // Dropdown
      setSelectedLocation(location);
      setSelectedDistricts(new Set());
      setAllDistrictsSelected(true);
      onLocationUpdate?.(location.name, [location.id], location.id);
    }
  };

  const toggleDistrict = (districtId: string) => {
    const newSelected = new Set(selectedDistricts);
    if (newSelected.has(districtId)) {
      newSelected.delete(districtId);
    } else {
      newSelected.add(districtId);
    }
    setSelectedDistricts(newSelected);
    setAllDistrictsSelected(false);

    // For modal variant, update immediately
    if (isModal && selectedLocation) {
      const locationIds = Array.from(newSelected);
      onLocationUpdate?.(selectedLocation.name, locationIds, selectedLocation.id);
    }
  };

  const toggleAllDistricts = () => {
    const newAllSelected = !allDistrictsSelected;
    setAllDistrictsSelected(newAllSelected);
    setSelectedDistricts(new Set());

    // For modal variant, update immediately
    if (isModal && selectedLocation) {
      const locationIds = newAllSelected ? [selectedLocation.id] : [];
      onLocationUpdate?.(selectedLocation.name, locationIds, selectedLocation.id);
    }
  };

  const isLocationSelected = (location: Location) => {
    return selectedLocation?.id === location.id;
  };

  const isLocationExpanded = (location: Location) => {
    return expandedLocation === location.id;
  };

  const renderSearchResults = () => (
    <div className="space-y-4">
      {/* Places */}
      {groupedSuggestions.places.length > 0 && (
        <div>
          <p className={`${isModal ? "text-sm" : "text-sm"} font-medium text-text-secondary mb-2`}>
            Places
          </p>
          <div className="space-y-1">
            {groupedSuggestions.places.map((place) => (
              <button
                key={place.mapbox_id}
                onClick={() => {
                  onLocationUpdate?.(place.name, []);
                }}
                className={`flex items-start gap-${isModal ? "3" : "2"} px-${isModal ? "3" : "2"} py-${isModal ? "3" : "2"} rounded-lg hover:bg-[#f7f7fd] w-full text-left`}
              >
                <div className="shrink-0 mt-0.5">
                  <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary`}>
                    {place.name}
                  </p>
                  <p className={`${isModal ? "text-sm" : "text-xs"} text-text-secondary`}>
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
          <p className={`${isModal ? "text-sm" : "text-sm"} font-medium text-text-secondary mb-2`}>
            Localities
          </p>
          <div className="space-y-1">
            {groupedSuggestions.localities.map((locality) => (
              <button
                key={locality.mapbox_id}
                onClick={() => {
                  onLocationUpdate?.(locality.name, []);
                }}
                className={`flex items-start gap-${isModal ? "3" : "2"} px-${isModal ? "3" : "2"} py-${isModal ? "3" : "2"} rounded-lg hover:bg-[#f7f7fd] w-full text-left`}
              >
                <div className="shrink-0 mt-0.5">
                  <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary`}>
                    {locality.name}
                  </p>
                  <p className={`${isModal ? "text-sm" : "text-xs"} text-text-secondary`}>
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
          <p className={`${isModal ? "text-sm" : "text-sm"} font-medium text-text-secondary mb-2`}>
            Streets
          </p>
          <div className="space-y-1">
            {groupedSuggestions.streets.map((street) => (
              <button
                key={street.mapbox_id}
                onClick={() => {
                  onLocationUpdate?.(street.name, []);
                }}
                className={`flex items-start gap-${isModal ? "3" : "2"} px-${isModal ? "3" : "2"} py-${isModal ? "3" : "2"} rounded-lg hover:bg-[#f7f7fd] w-full text-left`}
              >
                <div className="shrink-0 mt-0.5">
                  <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary`}>
                    {street.name}
                  </p>
                  <p className={`${isModal ? "text-sm" : "text-xs"} text-text-secondary`}>
                    {street.place_formatted}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchResults && searchResults.suggestions.length === 0 && (
        <div className="text-center py-8">
          <p className={`${isModal ? "text-base" : "text-sm"} text-text-secondary`}>
            No results found
          </p>
        </div>
      )}
    </div>
  );

  const renderDistricts = (location: Location) => (
    <>
      {/* All Districts Option */}
      <button
        onClick={toggleAllDistricts}
        className={`flex items-center gap-3 px-${isModal ? "4" : "3"} py-${isModal ? "3" : "2"} border-${isModal ? "t" : "b"} border-border-light w-full`}
      >
        <div
          className={`w-${isModal ? "5" : "4"} h-${isModal ? "5" : "4"} flex items-center justify-center shrink-0 border rounded ${
            allDistrictsSelected
              ? "bg-brand-purple border-brand-purple-200"
              : "bg-white border-brand-purple-200"
          }`}
        >
          {allDistrictsSelected && (
            <Image src="/icons/checkmark-white.svg" alt="" width={isModal ? 12 : 10} height={isModal ? 10 : 8} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary leading-normal text-left`}>
            All Districts
          </p>
          <p className={`${isModal ? "text-sm" : "text-xs"} font-medium text-text-primary opacity-60 leading-normal text-left`}>
            {location.children.length} Districts
          </p>
        </div>
      </button>

      {/* Individual Districts */}
      {location.children.map((district) => {
        const isChecked = !allDistrictsSelected && selectedDistricts.has(district.id);

        return (
          <button
            key={district.id}
            onClick={() => toggleDistrict(district.id)}
            className={`flex items-center gap-3 px-${isModal ? "4" : "3"} py-${isModal ? "3" : "2.5"} ${isModal ? "" : "h-10"} hover:bg-[#f7f7fd] w-full`}
          >
            <div
              className={`w-${isModal ? "5" : "4"} h-${isModal ? "5" : "4"} flex items-center justify-center shrink-0 border rounded ${
                isChecked
                  ? "bg-brand-purple border-brand-purple-200"
                  : "bg-white border-brand-purple-200"
              }`}
            >
              {isChecked && (
                <Image src="/icons/checkmark-white.svg" alt="" width={isModal ? 12 : 10} height={isModal ? 10 : 8} />
              )}
            </div>
            <span className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary leading-normal flex-1 text-left`}>
              {district.postal_code
                ? `${district.postal_code}, ${district.name}`
                : district.name}
            </span>
          </button>
        );
      })}
    </>
  );

  if (isModal) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Draw Area Button - only show when not searching */}
        {!hasSearchQuery && (
          <div className="px-4 py-3 border-b border-border-light">
            <button className="w-full flex items-center gap-3 px-3 py-3 border border-[#eee7ff] rounded-xl hover:border-brand-purple transition-colors">
              <div className="bg-[#f6ecfe] rounded-full p-1">
                <Image src="/icons/draw-area.svg" alt="Draw area" width={32} height={32} />
              </div>
              <span className="text-base font-medium text-text-primary flex-1 text-left">
                Draw an area on the map
              </span>
              <Image src="/icons/arrow-right-purple.svg" alt="" width={24} height={24} />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {hasSearchQuery ? (
            renderSearchResults()
          ) : (
            <>
              {isLoadingAll || isLoadingPopular ? (
                <div className="text-center py-8">
                  <p className="text-base text-text-secondary">Loading locations...</p>
                </div>
              ) : (
                <>
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-text-secondary mb-3">
                        Recent Searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.slice(0, 3).map((search, index) => (
                          <button
                            key={`${search.mapboxId}-${index}`}
                            onClick={() => {
                              onLocationUpdate?.(search.name, []);
                            }}
                            className="flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-[#f7f7fd] w-full text-left"
                          >
                            <div className="shrink-0 mt-0.5">
                              <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-base font-medium text-text-primary">
                                {search.name}
                              </p>
                              <p className="text-sm text-text-secondary capitalize">
                                {search.type}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Locations - Collapsible */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-text-secondary mb-3">
                      Popular Locations
                    </p>
                    <div className="flex flex-col">
                      {popularCities.map((city) => {
                        const isExpanded = isLocationExpanded(city);
                        return (
                          <div key={city.id} className="border-b border-border-light">
                            {/* City Header */}
                            <button
                              onClick={() => toggleLocation(city)}
                              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg ${
                                isExpanded ? "bg-[#fdfbff]" : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={cityImages[city.name] || "/cities/Vienna.png"}
                                  alt={city.name}
                                  className="w-[42px] h-[42px] rounded object-cover shrink-0"
                                />
                                <div className="flex flex-col items-start">
                                  <p className="text-base font-medium text-text-primary leading-normal">
                                    {city.name}
                                  </p>
                                  <p className="text-sm font-medium text-text-secondary leading-[1.3]">
                                    {city.children.length} Districts
                                  </p>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUpIcon className="w-6 h-6 text-brand-purple shrink-0" />
                              ) : (
                                <ChevronDownIcon className="w-6 h-6 text-[#79767D] shrink-0" />
                              )}
                            </button>

                            {/* Districts */}
                            {isExpanded && (
                              <div
                                ref={(el) => {
                                  if (el) districtRefs.current.set(city.id, el);
                                }}
                                className="bg-white overflow-hidden"
                              >
                                {renderDistricts(city)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Other Locations - Collapsible */}
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-3">
                      Other Locations
                    </p>
                    <div className="flex flex-col">
                      {otherLocations.map((location) => {
                        const isExpanded = isLocationExpanded(location);
                        return (
                          <div key={location.id} className="border-b border-border-light">
                            {/* Location Header */}
                            <button
                              onClick={() => toggleLocation(location)}
                              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg ${
                                isExpanded ? "bg-[#fdfbff]" : "bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={cityImages[location.name] || "/cities/LowerAustria.png"}
                                  alt={location.name}
                                  className="w-[42px] h-[42px] rounded object-cover shrink-0"
                                />
                                <div className="flex flex-col items-start">
                                  <p className="text-base font-medium text-text-primary leading-normal">
                                    {location.name}
                                  </p>
                                  <p className="text-sm font-medium text-text-secondary leading-[1.3]">
                                    {location.children.length} Districts
                                  </p>
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUpIcon className="w-6 h-6 text-brand-purple shrink-0" />
                              ) : (
                                <ChevronDownIcon className="w-6 h-6 text-[#79767D] shrink-0" />
                              )}
                            </button>

                            {/* Districts */}
                            {isExpanded && (
                              <div
                                ref={(el) => {
                                  if (el) districtRefs.current.set(location.id, el);
                                }}
                                className="bg-white overflow-hidden"
                              >
                                {renderDistricts(location)}
                              </div>
                            )}
                          </div>
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
    );
  }

  // Dropdown variant
  return (
    <div className="flex">
      {/* Left Panel - Locations */}
      <div className="w-[300px] flex flex-col">
        {/* Draw Area Button - only show when not searching */}
        {!hasSearchQuery && (
          <div className="px-3 py-2">
            <button className="w-full flex items-center gap-2 px-2 py-2 border border-[#eee7ff] rounded-xl hover:border-brand-purple transition-colors">
              <div className="bg-[#f6ecfe] rounded-full p-1">
                <Image src="/icons/draw-area.svg" alt="Draw area" width={32} height={32} />
              </div>
              <span className="text-sm font-medium text-text-primary flex-1 text-left">
                Draw an area on the map
              </span>
              <Image src="/icons/arrow-right-purple.svg" alt="" width={24} height={24} />
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto max-h-[490px] px-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {hasSearchQuery ? (
            renderSearchResults()
          ) : (
            <>
              {isLoadingAll || isLoadingPopular ? (
                <div className="text-center py-8">
                  <p className="text-sm text-text-secondary">Loading locations...</p>
                </div>
              ) : (
                <>
                  {/* Recent Searches */}
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
                            <div className="shrink-0 mt-0.5">
                              <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                            </div>
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

                  {/* Popular Locations */}
                  <div className="mb-2">
                    <p className="text-sm font-medium text-text-secondary mb-2">
                      Popular Locations
                    </p>
                    <div className="grid grid-cols-3 gap-1 mb-2">
                      {popularCities.map((city) => {
                        const isSelected = isLocationSelected(city);
                        return (
                          <button
                            key={city.id}
                            onClick={() => toggleLocation(city)}
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
                                  <Image src="/icons/checkmark-circle-white.svg" alt="" width={16} height={16} />
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

                  {/* Other Locations */}
                  <div>
                    <p className="text-sm font-medium text-text-secondary mb-2">
                      Other Locations
                    </p>
                    <div className="flex flex-col">
                      {otherLocations.map((location) => {
                        const isSelected = isLocationSelected(location);
                        return (
                          <button
                            key={location.id}
                            onClick={() => toggleLocation(location)}
                            className={`flex items-center justify-between px-2 py-2 rounded-lg w-full ${
                              isSelected ? "bg-[#fdfbff]" : "bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={cityImages[location.name] || "/cities/LowerAustria.png"}
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
                            <ChevronRightIcon className="w-6 h-6 text-[#79767D] shrink-0" />
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
              <p className="text-base font-semibold text-text-primary leading-normal">
                {selectedLocation.name}
              </p>
            </div>

            {/* Districts List */}
            <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {renderDistricts(selectedLocation)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
