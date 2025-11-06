import type { Location } from "@/lib/locations";
import { AllDistrictsButton } from "./AllDistrictsButton";
import { DistrictItem } from "./DistrictItem";

interface DistrictListProps {
  location: Location;
  allDistrictsSelected: boolean;
  selectedDistricts: Set<string>;
  onToggleAll: () => void;
  onToggleDistrict: (id: string) => void;
  variant: "dropdown" | "modal";
}

export function DistrictList({
  location,
  allDistrictsSelected,
  selectedDistricts,
  onToggleAll,
  onToggleDistrict,
  variant
}: DistrictListProps) {
  return (
    <>
      <AllDistrictsButton
        checked={allDistrictsSelected}
        districtCount={location.children.length}
        onClick={onToggleAll}
        variant={variant}
      />
      {location.children.map((district) => (
        <DistrictItem
          key={district.id}
          id={district.id}
          name={district.name}
          postalCode={district.postal_code}
          checked={!allDistrictsSelected && selectedDistricts.has(district.id)}
          onClick={() => onToggleDistrict(district.id)}
          variant={variant}
        />
      ))}
    </>
  );
}
