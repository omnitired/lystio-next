import type { MapboxSuggestion } from "@/types/mapbox";
import { SearchResultItem } from "./SearchResultItem";

interface SearchResultsSectionProps {
  title: string;
  results: MapboxSuggestion[];
  onSelect: (name: string) => void;
  variant: "dropdown" | "modal";
}

export function SearchResultsSection({ title, results, onSelect, variant }: SearchResultsSectionProps) {
  const isModal = variant === "modal";

  if (results.length === 0) return null;

  return (
    <div>
      <p className="text-sm font-medium text-text-secondary mb-2">
        {title}
      </p>
      <div className="space-y-1">
        {results.map((result) => (
          <SearchResultItem
            key={result.mapbox_id}
            name={result.name}
            description={result.place_formatted}
            onClick={() => onSelect(result.name)}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
}
