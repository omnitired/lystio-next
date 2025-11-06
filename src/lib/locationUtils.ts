/**
 * Location utility functions and constants
 */

/** Animation duration for expand/collapse */
export const EXPAND_DURATION = 0.2;

/** Animation duration for slide transitions */
export const SLIDE_DURATION = 0.2;

/** Animation configuration for location panel slides */
export const SLIDE_ANIMATION = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: SLIDE_DURATION },
};

/** Animation configuration for district expand/collapse */
export const EXPAND_ANIMATION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
  transition: { duration: EXPAND_DURATION },
};
