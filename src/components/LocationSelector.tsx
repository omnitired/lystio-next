"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MapboxSearchResponse, GroupedSuggestions } from "@/types/mapbox";
import { useAllLocations, usePopularLocations, useRecentSearches, type Location } from "@/lib/locations";
import { SLIDE_ANIMATION, EXPAND_ANIMATION } from "@/lib/locationUtils";
import { DrawAreaButton } from "./location-selector/DrawAreaButton";
import { SectionHeader } from "./location-selector/SectionHeader";
import { RecentSearchItem } from "./location-selector/RecentSearchItem";
import { SearchResultsSection } from "./location-selector/SearchResultsSection";
import { LocationCard } from "./location-selector/LocationCard";
import { DistrictList } from "./location-selector/DistrictList";

interface LocationSelectorProps {
  onLocationUpdate?: (locationName: string, locationIds: string[], locationId?: string) => void;
  searchResults?: MapboxSearchResponse;
  isLoading?: boolean;
  hasSearchQuery?: boolean;
  selectedLocationId?: string;
  variant?: "dropdown" | "modal";
}

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

  const [expandedLocation, setExpandedLocation] = useState<string | null>(
    variant === "modal" ? selectedLocationId || null : null
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation);
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(new Set());
  const [allDistrictsSelected, setAllDistrictsSelected] = useState(true);

  const isModal = variant === "modal";

  // Group search suggestions by feature type
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

  // Dropdown: notify parent immediately on change
  useEffect(() => {
    if (!isModal && selectedLocation) {
      const locationIds = allDistrictsSelected
        ? [selectedLocation.id]
        : Array.from(selectedDistricts);
      onLocationUpdate?.(selectedLocation.name, locationIds, selectedLocation.id);
    }
  }, [selectedLocation, selectedDistricts, allDistrictsSelected, isModal]);

  const toggleLocation = (location: Location) => {
    if (isModal) {
      if (expandedLocation === location.id) {
        setExpandedLocation(null);
      } else {
        setExpandedLocation(location.id);
        setSelectedLocation(location);
        setSelectedDistricts(new Set());
        setAllDistrictsSelected(true);
        onLocationUpdate?.(location.name, [location.id], location.id);
      }
    } else {
      // Dropdown
      setSelectedLocation(location);
      setSelectedDistricts(new Set());
      setAllDistrictsSelected(true);
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

  const handleSearchResultSelect = (name: string) => {
    onLocationUpdate?.(name, []);
  };

  const renderSearchResults = () => (
    <div className="space-y-4">
      <SearchResultsSection
        title="Places"
        results={groupedSuggestions.places}
        onSelect={handleSearchResultSelect}
        variant={variant}
      />
      <SearchResultsSection
        title="Localities"
        results={groupedSuggestions.localities}
        onSelect={handleSearchResultSelect}
        variant={variant}
      />
      <SearchResultsSection
        title="Streets"
        results={groupedSuggestions.streets}
        onSelect={handleSearchResultSelect}
        variant={variant}
      />
      {!isLoading && searchResults && searchResults.suggestions.length === 0 && (
        <div className="text-center py-8">
          <p className={`${isModal ? "text-base" : "text-sm"} text-text-secondary`}>
            No results found
          </p>
        </div>
      )}
    </div>
  );

  const renderLocations = () => {
    if (isLoadingAll || isLoadingPopular) {
      return (
        <div className="text-center py-8">
          <p className={`${isModal ? "text-base" : "text-sm"} text-text-secondary`}>
            Loading locations...
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className={isModal ? "mb-6" : "mb-4"}>
            <p className="text-sm font-medium text-text-secondary mb-2">
              Recent Searches
            </p>
            <div className="space-y-1">
              {recentSearches.slice(0, 3).map((search, index) => (
                <RecentSearchItem
                  key={`${search.mapboxId}-${index}`}
                  search={search}
                  onClick={() => handleSearchResultSelect(search.name)}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        )}

        {/* Popular Locations */}
        <div className={isModal ? "mb-6" : "mb-2"}>
          <p className="text-sm font-medium text-text-secondary mb-2">
            Popular Locations
          </p>
          {isModal ? (
            // Modal: Collapsible list
            <div className="flex flex-col">
              {popularCities.map((city) => {
                const isExpanded = expandedLocation === city.id;
                return (
                  <div key={city.id} className="border-b border-border-light">
                    <LocationCard
                      location={city}
                      isSelected={false}
                      isExpanded={isExpanded}
                      onClick={() => toggleLocation(city)}
                      variant="modal"
                    />
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          {...EXPAND_ANIMATION}
                          className="bg-white overflow-hidden"
                        >
                          <DistrictList
                            location={city}
                            allDistrictsSelected={allDistrictsSelected}
                            selectedDistricts={selectedDistricts}
                            onToggleAll={toggleAllDistricts}
                            onToggleDistrict={toggleDistrict}
                            variant="modal"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          ) : (
            // Dropdown: Grid
            <div className="grid grid-cols-3 gap-1 mb-2">
              {popularCities.map((city) => (
                <LocationCard
                  key={city.id}
                  location={city}
                  isSelected={selectedLocation?.id === city.id}
                  onClick={() => toggleLocation(city)}
                  variant="dropdown"
                  showChevron={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Other Locations */}
        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">
            Other Locations
          </p>
          <div className="flex flex-col">
            {otherLocations.map((location) => {
              if (isModal) {
                const isExpanded = expandedLocation === location.id;
                return (
                  <div key={location.id} className="border-b border-border-light">
                    <LocationCard
                      location={location}
                      isSelected={false}
                      isExpanded={isExpanded}
                      onClick={() => toggleLocation(location)}
                      variant="modal"
                    />
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          {...EXPAND_ANIMATION}
                          className="bg-white overflow-hidden"
                        >
                          <DistrictList
                            location={location}
                            allDistrictsSelected={allDistrictsSelected}
                            selectedDistricts={selectedDistricts}
                            onToggleAll={toggleAllDistricts}
                            onToggleDistrict={toggleDistrict}
                            variant="modal"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              } else {
                return (
                  <LocationCard
                    key={location.id}
                    location={location}
                    isSelected={selectedLocation?.id === location.id}
                    onClick={() => toggleLocation(location)}
                    variant="dropdown"
                  />
                );
              }
            })}
          </div>
        </div>
      </>
    );
  };

  if (isModal) {
    return (
      <div className="flex-1 overflow-hidden flex flex-col">
        {!hasSearchQuery && <DrawAreaButton variant="modal" />}
        <div className="flex-1 overflow-y-auto p-4">
          {hasSearchQuery ? renderSearchResults() : renderLocations()}
        </div>
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className="flex">
      {/* Left Panel - Locations */}
      <div className="w-[300px] flex flex-col">
        {!hasSearchQuery && <DrawAreaButton variant="dropdown" />}
        <div className="flex-1 overflow-y-auto max-h-[490px] px-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {hasSearchQuery ? renderSearchResults() : renderLocations()}
        </div>
      </div>

      {/* Right Panel - Districts */}
      {!hasSearchQuery && selectedLocation && (
        <div className="w-[270px] border-l border-border-light flex flex-col">
          <motion.div key={selectedLocation.id} {...SLIDE_ANIMATION} className="flex flex-col h-full">
            <SectionHeader title={selectedLocation.name} />
            <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <DistrictList
                location={selectedLocation}
                allDistrictsSelected={allDistrictsSelected}
                selectedDistricts={selectedDistricts}
                onToggleAll={toggleAllDistricts}
                onToggleDistrict={toggleDistrict}
                variant="dropdown"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
