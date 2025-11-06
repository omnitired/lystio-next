import { Checkbox } from "../ui/Checkbox";

interface DistrictItemProps {
  id: string;
  name: string;
  postalCode?: string;
  checked: boolean;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

export function DistrictItem({ name, postalCode, checked, onClick, variant }: DistrictItemProps) {
  const isModal = variant === "modal";

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full hover-surface-light ${
        isModal ? "gap-3 px-4 py-3" : "gap-3 px-3 py-2.5 h-10"
      }`}
    >
      <Checkbox checked={checked} />
      <span className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary leading-normal flex-1 text-left`}>
        {postalCode ? `${postalCode}, ${name}` : name}
      </span>
    </button>
  );
}
