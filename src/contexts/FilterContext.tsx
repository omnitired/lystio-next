"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import type { FilterState, HeaderMode } from "@/types/filters";
import { DEFAULT_FILTER } from "@/lib/constants";

interface FilterContextValue {
  /** Current filter state */
  filter: FilterState;
  /** Update location filter */
  updateLocation: (
    name: string,
    locationIds: string[],
    locationId?: string,
  ) => void;
  /** Update category filter */
  updateCategory: (name: string, typeId: string, subtypeIds: string[]) => void;
  /** Update price filter */
  updatePrice: (
    min: number | null,
    max: number | null,
    showOnRequest: boolean,
  ) => void;
  /** Update search mode */
  setMode: (mode: HeaderMode) => void;
  /** Reset all filters to default */
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

const defaultFilter: FilterState = {
  location: "",
  locationId: "",
  locationIds: [],
  category: DEFAULT_FILTER.CATEGORY,
  typeId: DEFAULT_FILTER.TYPE_ID,
  subTypeIds: [],
  minPrice: null,
  maxPrice: null,
  showPriceOnRequest: DEFAULT_FILTER.SHOW_PRICE_ON_REQUEST,
  mode: DEFAULT_FILTER.MODE,
};

interface FilterProviderProps {
  children: ReactNode;
  /** Initial filter state */
  initialFilter?: Partial<FilterState>;
}

/**
 * Provider component for filter state management
 */
export function FilterProvider({
  children,
  initialFilter,
}: FilterProviderProps) {
  const [filter, setFilter] = useState<FilterState>({
    ...defaultFilter,
    ...initialFilter,
  });

  const updateLocation = useCallback(
    (name: string, locationIds: string[], locationId?: string) => {
      setFilter((prev) => ({
        ...prev,
        location: name,
        locationIds,
        locationId: locationId || locationIds[0] || "",
      }));
    },
    [],
  );

  const updateCategory = useCallback(
    (name: string, typeId: string, subtypeIds: string[]) => {
      setFilter((prev) => ({
        ...prev,
        category: name,
        typeId,
        subTypeIds: subtypeIds,
      }));
    },
    [],
  );

  const updatePrice = useCallback(
    (min: number | null, max: number | null, showOnRequest: boolean) => {
      setFilter((prev) => ({
        ...prev,
        minPrice: min,
        maxPrice: max,
        showPriceOnRequest: showOnRequest,
      }));
    },
    [],
  );

  const setMode = useCallback((mode: HeaderMode) => {
    setFilter((prev) => ({
      ...prev,
      mode,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilter(defaultFilter);
  }, []);

  const value: FilterContextValue = {
    filter,
    updateLocation,
    updateCategory,
    updatePrice,
    setMode,
    resetFilters,
  };

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

/**
 * Hook to access filter context
 *
 * @throws Error if used outside FilterProvider
 *
 * @example
 * const { filter, updateLocation } = useFilter();
 * updateLocation("Vienna", ["1234"]);
 */
export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
