import { useState, useCallback } from "react";

/**
 * Generic hook for managing dropdown/modal open/close state with animation support
 *
 * @template T - Type of dropdown identifier (e.g., "location" | "category" | "price")
 * @returns State and handlers for dropdown management
 *
 * @example
 * const { active, isClosing, open, close } = useDropdownState<"location" | "category">();
 *
 * <button onClick={() => open("location")}>Open Location</button>
 * {active === "location" && <Dropdown onClose={close} />}
 */
export function useDropdownState<T = string>() {
  const [active, setActive] = useState<T | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const open = useCallback((dropdown: T) => {
    setIsClosing(false);
    setActive(dropdown);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    // Allow animation to complete before fully closing
    setTimeout(() => {
      setActive(null);
      setIsClosing(false);
    }, 200); // Match animation duration
  }, []);

  const toggle = useCallback(
    (dropdown: T) => {
      if (active === dropdown) {
        close();
      } else {
        open(dropdown);
      }
    },
    [active, open, close],
  );

  return {
    active,
    isClosing,
    isOpen: active !== null,
    open,
    close,
    toggle,
  };
}
