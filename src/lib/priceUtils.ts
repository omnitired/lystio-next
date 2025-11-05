/**
 * Price utility functions for formatting and generating price options
 */

/**
 * Format a number as a price with thousand separators and Euro symbol
 * @example formatPrice(1500) // "1,500€"
 */
export const formatPrice = (price: number): string => {
  if (!price) return "0€";

  const priceStr = price.toString();
  const parts = [];

  // Process from right to left, adding commas every 3 digits
  let i = priceStr.length;
  while (i > 0) {
    const start = Math.max(0, i - 3);
    parts.unshift(priceStr.slice(start, i));
    i = start;
  }

  return `${parts.join(',')}€`;
};

/**
 * Generate an array of formatted price options for minimum price selection
 * Ensures minimum 100 distance between stops, generates fewer stops for small ranges
 */
export const generatePriceOptions = (min: number, max: number): string[] => {
  const options = ["No Minimum"];
  const range = max - min;

  // Calculate max possible stops with 100 minimum distance
  const maxStops = Math.floor(range / 100);
  const numStops = Math.min(maxStops, 19); // Cap at 19 (plus min/max = 21 total)

  if (numStops <= 0) {
    // Range too small, just add max
    options.push(formatPrice(Math.ceil(max)));
    return options;
  }

  const step = range / (numStops + 1); // +1 to account for spacing

  for (let i = 1; i <= numStops; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(formatPrice(roundedPrice));
  }

  // Add max as the last option
  options.push(formatPrice(Math.ceil(max)));

  return options;
};

/**
 * Generate an array of formatted price options for maximum price selection
 * Ensures minimum 100 distance between stops, generates fewer stops for small ranges
 */
export const generateMaxPriceOptions = (min: number, max: number): string[] => {
  const options = ["No Maximum"];
  const range = max - min;

  // Calculate max possible stops with 100 minimum distance
  const maxStops = Math.floor(range / 100);
  const numStops = Math.min(maxStops, 19); // Cap at 19 (plus min/max = 21 total)

  if (numStops <= 0) {
    // Range too small, just add max
    options.push(formatPrice(Math.ceil(max)));
    return options;
  }

  const step = range / (numStops + 1); // +1 to account for spacing

  for (let i = 1; i <= numStops; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(formatPrice(roundedPrice));
  }

  // Add max as the last option
  options.push(formatPrice(Math.ceil(max)));

  return options;
};

/**
 * Extract numeric value from formatted price string
 * @example getNumericValue("1,500€") // 1500
 * @example getNumericValue("No Minimum") // 0
 */
export const getNumericValue = (price: string | null): number => {
  if (!price || price === "No Minimum" || price === "No Maximum") return 0;
  const parsed = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Generate display text for price range
 * @example getPriceDisplayText("500€", "1,000€", "Select Price Range") // "500 - 1,000 €"
 * @example getPriceDisplayText(null, null, "Select Price Range") // "Select Price Range"
 */
export const getPriceDisplayText = (
  minPrice: string | null,
  maxPrice: string | null,
  placeholder: string = "Select Price Range"
): string => {
  if (!minPrice && !maxPrice) {
    return placeholder;
  }

  const minText = minPrice === "No Minimum" ? "0" : minPrice?.replace("€", "");
  const maxText = maxPrice === "No Maximum" ? "∞" : maxPrice?.replace("€", "");

  return `${minText} - ${maxText} €`;
};
