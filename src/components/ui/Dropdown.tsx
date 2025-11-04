import { useRef, useEffect, ReactNode } from "react";
import { gsap } from "gsap";

interface DropdownProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Dropdown({ isOpen, onClose, children, className = "" }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAnimatedIn = useRef(false);

  // Animate dropdown opening
  useEffect(() => {
    if (dropdownRef.current && isOpen && !hasAnimatedIn.current) {
      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          scaleY: 0,
          transformOrigin: "top center",
        },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            hasAnimatedIn.current = true;
          },
        }
      );
    }
  }, [isOpen]);

  // Animate dropdown closing
  useEffect(() => {
    if (!isOpen && hasAnimatedIn.current && dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (onClose) {
            onClose();
          }
        },
      });
    }
  }, [isOpen, onClose]);

  return (
    <div
      ref={dropdownRef}
      className={`absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] z-50 font-[family-name:var(--font-plus-jakarta-sans)] ${className}`}
    >
      {children}
    </div>
  );
}
