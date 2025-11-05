/**
 * Type definitions for search filters
 */

/** Header mode for property search */
export type HeaderMode = "rent" | "buy" | "ai";

/** Complete filter state for property search */
export interface FilterState {
  /** Selected location name */
  location: string;
  /** Primary location ID */
  locationId: string;
  /** All selected location IDs (for multi-select) */
  locationIds: string[];
  /** Category display name */
  category: string;
  /** Category type ID */
  typeId: string;
  /** Selected subtype IDs */
  subTypeIds: string[];
  /** Minimum price filter */
  minPrice: string | null;
  /** Maximum price filter */
  maxPrice: string | null;
  /** Whether to show listings with "Price on Request" */
  showPriceOnRequest: boolean;
  /** Current search mode (rent/buy/ai) */
  mode: HeaderMode;
}
