/**
 * Price utility functions for formatting and generating price options
 */

/**
 * Format a number with thousand separators (German locale)
 * @example formatPriceNumber(1500) // "1.500"
 */
export const formatPriceNumber = (price: number): string => {
  return price.toLocaleString('de-DE');
};

/**
 * Format a number as a price with thousand separators and Euro symbol
 * @example formatPrice(1500) // "1.500€"
 */
export const formatPrice = (price: number): string => {
  return `${formatPriceNumber(price)}€`;
};

const DEFAULT_OPTIONS = [null, 400, 500, 600, 700, 800, 900, 1000, 1200, 1300, 1400, 1500, 1600, 1700, 1800];

/**
 * Generate price options from histogram range
 * Ensures minimum 100 distance between stops
 */
export const generatePriceOptions = (min: number, max: number): (number | null)[] => {
  const options: (number | null)[] = [null];
  const range = max - min;

  const maxStops = Math.floor(range / 100);
  const numStops = Math.min(maxStops, 19);

  if (numStops <= 0) {
    options.push(Math.ceil(max));
    return options;
  }

  const step = range / (numStops + 1);

  for (let i = 1; i <= numStops; i++) {
    const price = min + (step * i);
    const roundedPrice = Math.ceil(price / 100) * 100;
    options.push(roundedPrice);
  }

  options.push(Math.ceil(max));
  return options;
};

/**
 * Get default price options or generate from histogram
 */
export const getPriceOptions = (range?: [number, number] | null): (number | null)[] => {
  return range ? generatePriceOptions(range[0], range[1]) : DEFAULT_OPTIONS;
};

/**
 * Generate display text for price range
 * @example getPriceDisplayText(500, 1000) // "500 - 1.000 €"
 */
export const getPriceDisplayText = (
  minPrice: number | null,
  maxPrice: number | null,
  placeholder: string = "Select Price Range"
): string => {
  if (!minPrice && !maxPrice) return placeholder;

  const minText = minPrice ? formatPriceNumber(minPrice) : "0";
  const maxText = maxPrice ? formatPriceNumber(maxPrice) : "∞";

  return `${minText} - ${maxText} €`;
};
