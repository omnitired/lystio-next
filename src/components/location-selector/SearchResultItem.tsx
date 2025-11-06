import Image from "next/image";

interface SearchResultItemProps {
  name: string;
  description: string;
  onClick: () => void;
  variant: "dropdown" | "modal";
}

export function SearchResultItem({ name, description, onClick, variant }: SearchResultItemProps) {
  const isModal = variant === "modal";

  return (
    <button
      onClick={onClick}
      className={`flex items-start w-full text-left rounded-lg hover-surface-light ${
        isModal ? "gap-3 px-3 py-3" : "gap-2 px-2 py-2"
      }`}
    >
      <div className="shrink-0 mt-0.5">
        <Image src="/icons/location-pin-purple.svg" alt="" width={20} height={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${isModal ? "text-base" : "text-sm"} font-medium text-text-primary`}>
          {name}
        </p>
        <p className={`${isModal ? "text-sm" : "text-xs"} text-text-secondary`}>
          {description}
        </p>
      </div>
    </button>
  );
}
