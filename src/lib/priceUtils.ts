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
 * Creates 20 buckets from min to max, rounded up to nearest 100
 */
export const generatePriceOptions = (min: number, max: number): string[] => {
  const options = ["No Minimum"];
  const step = (max - min) / 19; // 19 steps to create 20 buckets (0-19 inclusive)

  for (let i = 0; i < 19; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100; // Round up to nearest 100
    options.push(formatPrice(roundedPrice));
  }

  // Add max as the last option
  options.push(formatPrice(Math.ceil(max)));

  return options;
};

/**
 * Generate an array of formatted price options for maximum price selection
 * Creates 20 buckets from min to max, rounded up to nearest 100
 */
export const generateMaxPriceOptions = (min: number, max: number): string[] => {
  const options = ["No Maximum"];
  const step = (max - min) / 19; // 19 steps to create 20 buckets (0-19 inclusive)

  for (let i = 0; i < 19; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100; // Round up to nearest 100
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
export const getNumericValue = (price: string): number => {
  if (price === "No Minimum" || price === "No Maximum") return 0;
  const parsed = parseInt(price.replace(/[^0-9]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
