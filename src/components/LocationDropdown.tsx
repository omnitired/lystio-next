"use client";

import type { MapboxSearchResponse } from "@/types/mapbox";
import { Dropdown } from "./ui/Dropdown";
import { LocationSelector } from "./LocationSelector";

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

export function LocationDropdown({
  onClose,
  onLocationUpdate,
  isOpen = true,
  searchResults,
  isLoading = false,
  hasSearchQuery = false,
  selectedLocationId,
}: LocationDropdownProps) {
  return (
    <Dropdown
      isOpen={isOpen}
      onClose={onClose}
      className={`flex ${hasSearchQuery ? "w-[300px]" : "w-[570px]"}`}
    >
      <LocationSelector
        onLocationUpdate={onLocationUpdate}
        searchResults={searchResults}
        isLoading={isLoading}
        hasSearchQuery={hasSearchQuery}
        selectedLocationId={selectedLocationId}
        variant="dropdown"
      />
    </Dropdown>
  );
}
