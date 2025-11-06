import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropdownProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
}

export function Dropdown({
  isOpen,
  onClose,
  children,
  className = "",
}: DropdownProps) {
  return (
    <AnimatePresence onExitComplete={onClose}>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "top center" }}
          className={`absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] z-50 font-(family-name:--font-plus-jakarta-sans) ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
