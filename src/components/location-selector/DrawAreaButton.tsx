import Image from "next/image";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface DrawAreaButtonProps {
  variant: "dropdown" | "modal";
}

export function DrawAreaButton({ variant }: DrawAreaButtonProps) {
  const isModal = variant === "modal";

  return (
    <div
      className={
        isModal ? "px-4 py-3 border-b border-border-light" : "px-3 py-2"
      }
    >
      <button
        className={`w-full flex items-center ${
          isModal ? "gap-3 px-3 py-3" : "gap-2 px-2 py-2"
        } border border-[#eee7ff] rounded-xl hover:border-brand-purple transition-colors`}
      >
        <div className="bg-[#f6ecfe] rounded-full p-1">
          <Image
            src="/icons/draw-area.svg"
            alt="Draw area"
            width={32}
            height={32}
          />
        </div>
        <span
          className={`${isModal ? "text-body" : "text-body-sm"} flex-1 text-left`}
        >
          Draw an area on the map
        </span>
        <ArrowRightIcon className="w-6 h-6 text-brand-purple" />
      </button>
    </div>
  );
}
