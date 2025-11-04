import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api";

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

const CACHE_KEY_ALL = "locations_all";
const CACHE_KEY_POPULAR = "locations_popular";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface CachedData<T> {
  data: T;
  timestamp: number;
}

function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error reading from cache:", error);
    return null;
  }
}

function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing to cache:", error);
  }
}

export async function fetchAllLocations(): Promise<Location[]> {
  const cached = getCachedData<Location[]>(CACHE_KEY_ALL);
  if (cached) return cached;

  const data = await apiRequest<Location[]>("/geo/boundary");
  setCachedData(CACHE_KEY_ALL, data);
  return data;
}

export async function fetchPopularLocations(): Promise<Location[]> {
  const cached = getCachedData<Location[]>(CACHE_KEY_POPULAR);
  if (cached) return cached;

  const data = await apiRequest<Location[]>("/geo/boundary/popular");
  setCachedData(CACHE_KEY_POPULAR, data);
  return data;
}

export function useAllLocations() {
  return useQuery({
    queryKey: ["locations", "all"],
    queryFn: fetchAllLocations,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION,
  });
}

export function usePopularLocations() {
  return useQuery({
    queryKey: ["locations", "popular"],
    queryFn: fetchPopularLocations,
    staleTime: CACHE_DURATION,
    gcTime: CACHE_DURATION,
  });
}
