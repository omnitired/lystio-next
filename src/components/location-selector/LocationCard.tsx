import Image from "next/image";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import type { Location } from "@/lib/locations";
import { cityImages } from "@/data/cityImages";

interface LocationCardProps {
  location: Location;
  isSelected: boolean;
  isExpanded?: boolean;
  onClick: () => void;
  variant: "dropdown" | "modal";
  showImage?: boolean;
  showChevron?: boolean;
}

export function LocationCard({
  location,
  isSelected,
  isExpanded = false,
  onClick,
  variant,
  showImage = true,
  showChevron = true,
}: LocationCardProps) {
  const isModal = variant === "modal";
  const isDropdownGrid = variant === "dropdown" && showImage && !showChevron;
  const isDropdownList = variant === "dropdown" && !isDropdownGrid;

  // Grid card for dropdown popular cities
  if (isDropdownGrid) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col p-1 rounded-md border ${
          isSelected ? "border-brand-purple" : "border-transparent"
        }`}
      >
        <div className="relative h-20 w-full rounded overflow-hidden mb-1">
          <Image
            src={cityImages[location.name] || "/cities/Vienna.png"}
            alt={location.name}
            fill
            className="object-cover"
          />
          {isSelected && (
            <div className="absolute top-0.5 right-0.5">
              <CheckCircleIcon className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <div className="w-full">
          <p className="text-sm font-medium leading-normal overflow-hidden text-ellipsis whitespace-nowrap text-text-primary">
            {location.name}
          </p>
          <p
            className={`text-[10px] font-medium leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap ${
              isSelected ? "text-brand-purple" : "text-text-secondary"
            }`}
          >
            {isSelected
              ? "All Districts"
              : `${location.children.length} Districts`}
          </p>
        </div>
      </button>
    );
  }

  // List card for modal collapsible or dropdown other locations
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between rounded-lg ${
        isModal
          ? `px-3 py-3 ${isExpanded ? "bg-[#fdfbff]" : "bg-white"}`
          : `px-2 py-2 ${isSelected ? "bg-[#fdfbff]" : "bg-white"}`
      }`}
    >
      <div className={`flex items-center ${isModal ? "gap-3" : "gap-2"}`}>
        {showImage && (
          <Image
            src={cityImages[location.name] || "/cities/LowerAustria.png"}
            alt={location.name}
            width={isModal ? 42 : 38}
            height={isModal ? 42 : 38}
            className="rounded object-cover shrink-0"
          />
        )}
        <div className="flex flex-col items-start">
          <p
            className={
              isModal
                ? "text-body leading-normal"
                : "text-body-sm leading-normal"
            }
          >
            {location.name}
          </p>
          <p
            className={`${isModal ? "text-sm" : "text-[10px]"} font-medium text-text-secondary leading-[1.3]`}
          >
            {location.children.length} Districts
          </p>
        </div>
      </div>
      {showChevron && (
        <>
          {isModal ? (
            isExpanded ? (
              <ChevronUpIcon className="w-6 h-6 text-brand-purple shrink-0" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-[#79767D] shrink-0" />
            )
          ) : (
            <ChevronRightIcon className="w-6 h-6 text-[#79767D] shrink-0" />
          )}
        </>
      )}
    </button>
  );
}
