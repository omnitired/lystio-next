import React from "react";
import Image from "next/image";

interface StateItemProps {
  name: string;
  districtCount: number;
  imageSrc: string;
  onClick?: () => void;
}

export function StateItem({
  name,
  districtCount,
  imageSrc,
  onClick,
}: StateItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex gap-2 items-center flex-1 min-w-0">
        <div className="w-[38px] h-[38px] relative rounded shrink-0 overflow-hidden">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col items-start justify-center flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary w-full text-left">
            {name}
          </p>
          <p className="text-[10px] font-medium text-text-secondary w-full text-left">
            {districtCount} Districts
          </p>
        </div>
      </div>
      <div className="w-6 h-6 shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </button>
  );
}
