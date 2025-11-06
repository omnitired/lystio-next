/**
 * Category utility functions and constants
 */

/** Icon mapping for each category type */
export const categoryIcons: Record<string, string> = {
  "1": "/svg/rooms.svg",
  "2": "/svg/apartments.svg",
  "3": "/svg/houses.svg",
  "4": "/svg/plots.svg",
  "5": "/svg/commercial.svg",
  "11": "/svg/holiday-homes.svg",
  "12": "/svg/new-developments.svg",
  "13": "/svg/parking.svg",
  "20": "/svg/office.svg",
  "21": "/svg/investment.svg",
};

/** SVG filter for brand purple color */
export const PURPLE_FILTER = 'invert(36%) sepia(95%) saturate(4527%) hue-rotate(262deg) brightness(98%) contrast(93%)';

/** Animation duration for expand/collapse */
export const EXPAND_DURATION = 0.2;

/** Animation duration for slide transitions */
export const SLIDE_DURATION = 0.2;
