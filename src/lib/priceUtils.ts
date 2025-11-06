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

  return `${parts.join('.')}€`;
};

/**
 * Generate an array of price options for minimum price selection
 * Ensures minimum 100 distance between stops, generates fewer stops for small ranges
 */
export const generatePriceOptions = (min: number, max: number): (number | null)[] => {
  const options: (number | null)[] = [null]; // null = "No Minimum"
  const range = max - min;

  // Calculate max possible stops with 100 minimum distance
  const maxStops = Math.floor(range / 100);
  const numStops = Math.min(maxStops, 19); // Cap at 19 (plus min/max = 21 total)

  if (numStops <= 0) {
    // Range too small, just add max
    options.push(Math.ceil(max));
    return options;
  }

  const step = range / (numStops + 1); // +1 to account for spacing

  for (let i = 1; i <= numStops; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(roundedPrice);
  }

  // Add max as the last option
  options.push(Math.ceil(max));

  return options;
};

/**
 * Generate an array of price options for maximum price selection
 * Ensures minimum 100 distance between stops, generates fewer stops for small ranges
 */
export const generateMaxPriceOptions = (min: number, max: number): (number | null)[] => {
  const options: (number | null)[] = [null]; // null = "No Maximum"
  const range = max - min;

  // Calculate max possible stops with 100 minimum distance
  const maxStops = Math.floor(range / 100);
  const numStops = Math.min(maxStops, 19); // Cap at 19 (plus min/max = 21 total)

  if (numStops <= 0) {
    // Range too small, just add max
    options.push(Math.ceil(max));
    return options;
  }

  const step = range / (numStops + 1); // +1 to account for spacing

  for (let i = 1; i <= numStops; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(roundedPrice);
  }

  // Add max as the last option
  options.push(Math.ceil(max));

  return options;
};

/**
 * Generate display text for price range
 * @example getPriceDisplayText(500, 1000, "Select Price Range") // "500 - 1,000 €"
 * @example getPriceDisplayText(null, null, "Select Price Range") // "Select Price Range"
 */
export const getPriceDisplayText = (
  minPrice: number | null,
  maxPrice: number | null,
  placeholder: string = "Select Price Range"
): string => {
  if (!minPrice && !maxPrice) {
    return placeholder;
  }

  const minText = minPrice ? formatPrice(minPrice).replace("€", "") : "0";
  const maxText = maxPrice ? formatPrice(maxPrice).replace("€", "") : "∞";

  return `${minText} - ${maxText} €`;
};
