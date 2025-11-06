import { useMemo } from "react";
import { useFilter } from "@/contexts/FilterContext";
import type { HistogramParams } from "@/lib/searchCount";

export interface SearchCountParams extends HistogramParams {
  rent?: [number, number];
  price?: [number, number];
}

/**
 * Hook to generate histogram and search count params from filter context
 * Histogram params exclude price filter (to show price distribution)
 * Search count params include price filter (to show filtered results)
 */
export function useSearchParams() {
  const { filter } = useFilter();

  const histogramParams = useMemo<HistogramParams>(() => {
    return {
      type: [parseInt(filter.typeId)],
      rentType: [filter.mode === "rent" ? "rent" : "buy"],
      ...(filter.subTypeIds.length > 0
        ? { subType: filter.subTypeIds.map((id) => parseInt(id)) }
        : {}),
      showPriceOnRequest: filter.showPriceOnRequest,
      sort: "most_recent" as const,
      ...(filter.locationIds.length > 0
        ? { withinId: filter.locationIds }
        : {}),
    };
  }, [
    filter.typeId,
    filter.mode,
    filter.subTypeIds,
    filter.showPriceOnRequest,
    filter.locationIds,
  ]);

  const searchCountParams = useMemo<SearchCountParams>(() => {
    const params: SearchCountParams = {
      type: [parseInt(filter.typeId)],
      rentType: [filter.mode === "rent" ? "rent" : "buy"],
      ...(filter.subTypeIds.length > 0
        ? { subType: filter.subTypeIds.map((id) => parseInt(id)) }
        : {}),
      showPriceOnRequest: filter.showPriceOnRequest,
      sort: "most_recent" as const,
      ...(filter.locationIds.length > 0
        ? { withinId: filter.locationIds }
        : {}),
    };

    // Add price filter
    if (filter.minPrice && filter.maxPrice) {
      const priceRange: [number, number] = [filter.minPrice, filter.maxPrice];

      if (filter.mode === "rent") {
        params.rent = priceRange;
      } else {
        params.price = priceRange;
      }
    }

    return params;
  }, [
    filter.typeId,
    filter.mode,
    filter.subTypeIds,
    filter.showPriceOnRequest,
    filter.locationIds,
    filter.minPrice,
    filter.maxPrice,
  ]);

  return { histogramParams, searchCountParams };
}
