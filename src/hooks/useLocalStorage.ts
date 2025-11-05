/**
 * Utility functions for localStorage with TTL support
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
}

/**
 * Get data from localStorage with TTL check
 *
 * @param key - localStorage key
 * @param ttl - Time to live in milliseconds (optional)
 * @returns Cached data or null if expired/not found
 */
export function getCachedData<T>(key: string, ttl?: number): T | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp }: CachedData<T> = JSON.parse(cached);

    // Check if TTL is specified and data has expired
    if (ttl) {
      const now = Date.now();
      if (now - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }
    }

    return data;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return null;
  }
}

/**
 * Set data to localStorage with timestamp
 *
 * @param key - localStorage key
 * @param data - Data to cache
 */
export function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const cacheData: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error writing to localStorage:", error);
  }
}

/**
 * Remove data from localStorage
 *
 * @param key - localStorage key
 */
export function removeCachedData(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
}
