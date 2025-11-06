/**
 * Application-wide constants
 */

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE = {
  SEARCH: 300,
  INPUT: 300,
} as const;

/**
 * Cache durations (in milliseconds)
 */
export const CACHE = {
  LOCATIONS: 60 * 60 * 1000, // 1 hour
  RECENT_SEARCHES: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * Animation configuration
 */
export const ANIMATION = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.4,
  },
  EASING: {
    IN: "power2.in",
    OUT: "power2.out",
    IN_OUT: "power2.inOut",
    SMOOTH: "power3.out",
  },
} as const;

/**
 * Default filter values
 */
export const DEFAULT_FILTER = {
  CATEGORY: "Apartments",
  TYPE_ID: "2",
  SHOW_PRICE_ON_REQUEST: true,
  MODE: "rent" as const,
} as const;
