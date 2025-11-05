import Image from "next/image";

interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Size variant - modal uses larger size */
  variant?: "modal" | "dropdown";
  /** Optional change handler */
  onChange?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Reusable checkbox component with consistent styling
 *
 * @example
 * <Checkbox
 *   checked={isSelected}
 *   variant="modal"
 *   onChange={() => toggleSelection()}
 * />
 */
export function Checkbox({ checked, variant = "dropdown", onChange, className = "" }: CheckboxProps) {
  const isModal = variant === "modal";
  const size = isModal ? "w-5 h-5" : "w-4 h-4";
  const iconSize = isModal ? { width: 12, height: 10 } : { width: 10, height: 8 };

  return (
    <div
      className={`${size} flex items-center justify-center shrink-0 border ${className || "rounded"} ${
        checked
          ? "bg-brand-purple border-brand-purple-200"
          : "bg-white border-brand-purple-200"
      }`}
      onClick={onChange}
    >
      {checked && (
        <Image
          src="/icons/checkmark-white.svg"
          alt=""
          width={iconSize.width}
          height={iconSize.height}
        />
      )}
    </div>
  );
}
