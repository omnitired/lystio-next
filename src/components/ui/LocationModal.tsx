"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import type { MapboxSearchResponse } from "@/types/mapbox";
import { Modal } from "./Modal";
import { LocationSelector } from "./LocationSelector";
import { LocationInput } from "./LocationInput";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationUpdate?: (locationName: string, locationIds: string[], locationId?: string) => void;
  selectedLocationId?: string;
}

export function LocationModal({
  isOpen,
  onClose,
  onLocationUpdate,
  selectedLocationId,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sessionToken] = useState(() => generateSessionToken());

  const locationRef = useRef<{ locationName: string; locationIds: string[]; locationId?: string }>({
    locationName: "",
    locationIds: [],
    locationId: selectedLocationId
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["mapbox-search-modal", debouncedQuery, sessionToken],
    queryFn: () =>
      searchMapbox({
        query: debouncedQuery,
        sessionToken,
      }),
    enabled: debouncedQuery.length > 0,
  });

  const handleLocationUpdate = (locationName: string, locationIds: string[], locationId?: string) => {
    locationRef.current = { locationName, locationIds, locationId };
  };

  const handleApply = () => {
    onLocationUpdate?.(locationRef.current.locationName, locationRef.current.locationIds, locationRef.current.locationId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Location"
      applyDisabled={!locationRef.current.locationName}
    >
      <LocationInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="City, District, Street, Postcode"
        variant="modal"
      />
      <LocationSelector
        onLocationUpdate={handleLocationUpdate}
        searchResults={searchResults}
        isLoading={isLoading}
        hasSearchQuery={searchQuery.length > 0}
        selectedLocationId={selectedLocationId}
        variant="modal"
      />
    </Modal>
  );
}
