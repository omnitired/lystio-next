import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  variant?: "dropdown" | "modal";
}

export function LocationInput({
  value,
  onChange,
  placeholder = "Enter location...",
  variant = "dropdown",
}: LocationInputProps) {
  const isModal = variant === "modal";
  const isDropdown = variant === "dropdown";

  if (isModal) {
    return (
      <div className="px-4 py-3 border-b border-border-light">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 pl-10 pr-4 text-base font-medium text-text-primary bg-bg-light border border-border-light rounded-lg outline-none focus:border-brand-purple transition-colors"
          />
        </div>
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className="px-3 py-2 border-b border-border-light">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-8 pr-3 text-sm font-medium text-text-primary bg-bg-light border border-border-light rounded-lg outline-none focus:border-brand-purple transition-colors"
        />
      </div>
    </div>
  );
}
