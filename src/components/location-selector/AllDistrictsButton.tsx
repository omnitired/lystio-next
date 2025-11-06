import { Checkbox } from "../ui/Checkbox";

interface AllDistrictsButtonProps {
  checked: boolean;
  districtCount: number;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

export function AllDistrictsButton({ checked, districtCount, onClick, variant }: AllDistrictsButtonProps) {
  const isModal = variant === "modal";

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full ${
        isModal ? "gap-3 px-4 py-3 border-t" : "gap-3 px-3 py-2 border-b"
      } border-border-light`}
    >
      <Checkbox checked={checked} />
      <div className="flex-1 min-w-0">
        <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary leading-normal text-left`}>
          All Districts
        </p>
        <p className={`${isModal ? "text-sm" : "text-xs"} font-medium text-text-primary opacity-60 leading-normal text-left`}>
          {districtCount} Districts
        </p>
      </div>
    </button>
  );
}
