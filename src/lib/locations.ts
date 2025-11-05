import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";
import { getCachedData, setCachedData } from "@/hooks/useLocalStorage";
import { CACHE } from "./constants";

export interface Location {
  name: string;
  altName: string;
  id: string;
  children: {
    name: string;
    altName: string;
    id: string;
    postal_code?: string;
    urlSegment?: string | null;
  }[];
  urlSegment: string;
}

export interface RecentSearch {
  pt: [number, number];
  name: string;
  type: "street" | "locality" | "place";
  mapboxId: string;
}

const CACHE_KEY_ALL = "locations_all";
const CACHE_KEY_POPULAR = "locations_popular";

export async function fetchAllLocations(): Promise<Location[]> {
  const cached = getCachedData<Location[]>(CACHE_KEY_ALL, CACHE.LOCATIONS);
  if (cached) return cached;

  const data = await apiRequest<Location[]>("/geo/boundary");
  setCachedData(CACHE_KEY_ALL, data);
  return data;
}

export async function fetchPopularLocations(): Promise<Location[]> {
  const cached = getCachedData<Location[]>(CACHE_KEY_POPULAR, CACHE.LOCATIONS);
  if (cached) return cached;

  const data = await apiRequest<Location[]>("/geo/boundary/popular");
  setCachedData(CACHE_KEY_POPULAR, data);
  return data;
}

export function useAllLocations() {
  return useQuery({
    queryKey: ["locations", "all"],
    queryFn: fetchAllLocations,
    staleTime: CACHE.LOCATIONS,
    gcTime: CACHE.LOCATIONS,
  });
}

export function usePopularLocations() {
  return useQuery({
    queryKey: ["locations", "popular"],
    queryFn: fetchPopularLocations,
    staleTime: CACHE.LOCATIONS,
    gcTime: CACHE.LOCATIONS,
  });
}

export async function fetchRecentSearches(): Promise<RecentSearch[]> {
  return apiRequest<RecentSearch[]>("/geo/search/recent");
}

export function useRecentSearches() {
  return useQuery({
    queryKey: ["recent-searches"],
    queryFn: fetchRecentSearches,
    staleTime: CACHE.RECENT_SEARCHES,
    gcTime: CACHE.RECENT_SEARCHES * 2,
  });
}
