"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMapbox, generateSessionToken } from "@/lib/mapbox";
import { Modal } from "./ui/Modal";
import { LocationSelector } from "./LocationSelector";
import { LocationInput } from "./LocationInput";
import { useFilter } from "@/contexts/FilterContext";
import { DEBOUNCE } from "@/lib/constants";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LocationModal({
  isOpen,
  onClose,
}: LocationModalProps) {
  const { filter, updateLocation } = useFilter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sessionToken] = useState(() => generateSessionToken());

  const locationRef = useRef<{ locationName: string; locationIds: string[]; locationId?: string }>({
    locationName: "",
    locationIds: [],
    locationId: filter.locationId
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, DEBOUNCE.SEARCH);

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
    updateLocation(locationRef.current.locationName, locationRef.current.locationIds, locationRef.current.locationId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onApply={handleApply}
      title="Location"
      // applyDisabled={!locationRef.current.locationName}
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
        selectedLocationId={filter.locationId}
        variant="modal"
      />
    </Modal>
  );
}
