import { useEffect, RefObject } from "react";
import { animate } from "framer-motion";
import { ANIMATION } from "@/lib/constants";

type Direction = "left" | "right" | "up" | "down";

interface UseSlideAnimationOptions {
  /** Animation direction */
  direction?: Direction;
  /** Animation duration in seconds */
  duration?: number;
  /** Easing function */
  ease?: string;
  /** Distance to slide in pixels */
  distance?: number;
}

/**
 * Hook to add slide-in animation to an element when a trigger changes
 *
 * @param ref - React ref of the element to animate
 * @param trigger - Value that triggers the animation when it changes
 * @param options - Animation configuration
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useSlideAnimation(ref, selectedItem, { direction: "left" });
 *
 * return <div ref={ref}>Content</div>;
 */
export function useSlideAnimation<T extends HTMLElement>(
  ref: RefObject<T | null>,
  trigger: unknown,
  options: UseSlideAnimationOptions = {},
) {
  const {
    direction = "left",
    duration = ANIMATION.DURATION.NORMAL,
    ease = ANIMATION.EASING.OUT,
    distance = 10,
  } = options;

  useEffect(() => {
    if (!ref.current || !trigger) return;

    const axis = direction === "left" || direction === "right" ? "x" : "y";
    const value =
      direction === "left" || direction === "up" ? -distance : distance;

    // Convert easing to Framer Motion format
    const frameworkEase = ease
      .replace("power2", "easeOut")
      .replace("power3", "easeOut");

    animate(
      ref.current,
      {
        opacity: [0, 1],
        [axis]: [value, 0],
      },
      {
        duration,
        ease: frameworkEase as any,
      },
    );
  }, [trigger, ref, direction, duration, ease, distance]);
}
