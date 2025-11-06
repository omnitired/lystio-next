import Image from "next/image";
import type { RecentSearch } from "@/lib/locations";

interface RecentSearchItemProps {
  search: RecentSearch;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

export function RecentSearchItem({
  search,
  onClick,
  variant,
}: RecentSearchItemProps) {
  const isModal = variant === "modal";

  return (
    <button
      onClick={onClick}
      className={`flex items-start ${
        isModal ? "gap-3 px-3 py-3" : "gap-2 px-2 py-2"
      } rounded-lg hover-surface-light w-full text-left`}
    >
      <div className="shrink-0 mt-0.5">
        <Image
          src="/icons/location-pin-purple.svg"
          alt=""
          width={20}
          height={20}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={isModal ? "text-body" : "text-body-sm"}>{search.name}</p>
        <p
          className={`${isModal ? "text-sm" : "text-xs"} text-text-secondary capitalize`}
        >
          {search.type}
        </p>
      </div>
    </button>
  );
}
