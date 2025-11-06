import Image from "next/image";

interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
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
 *   onChange={() => toggleSelection()}
 * />
 */
export function Checkbox({ checked, onChange, className = "" }: CheckboxProps) {

  return (
    <div
      className={`w-4 h-4 flex items-center justify-center shrink-0 border ${className || "rounded"} ${
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
          width={12}
          height={10}
        />
      )}
    </div>
  );
}
