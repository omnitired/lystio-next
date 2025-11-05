"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import Image from "next/image";
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
              <Image src="/icons/draw-area.svg" alt="Draw area" width={32} height={32} />
            </div>
            <span className="text-sm font-medium text-text-primary flex-1 text-left">
              Draw an area on the map
            </span>
            <Image src="/icons/arrow-right-purple.svg" alt="" width={24} height={24} />
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
                        <div className="shrink-0 mt-0.5">
                          <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                        </div>
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
                        <div className="shrink-0 mt-0.5">
                          <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                        </div>
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
                        <div className="shrink-0 mt-0.5">
                          <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
                        </div>
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
                    <Image src="/icons/chevron-right-gray.svg" alt="" width={24} height={24} className="shrink-0" />
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
                  <Image src="/icons/checkmark-white.svg" alt="" width={10} height={8} />
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
                      <Image src="/icons/checkmark-white.svg" alt="" width={10} height={8} />
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
