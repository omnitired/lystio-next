import React from "react";

interface DrawAreaButtonProps {
  onClick?: () => void;
}

export function DrawAreaButton({ onClick }: DrawAreaButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-bg-light border border-border-light flex gap-2 items-center p-2 rounded-xl hover:bg-brand-purple-light transition-colors"
    >
      <div className="bg-brand-purple-light flex items-center justify-center p-1 rounded-full shrink-0">
        <div className="w-6 h-6 relative">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.6 21.6L3.6 16.8M3.6 16.8L8.4 16.8M3.6 16.8L9.6 10.8M20.4 2.4L20.4 7.2M20.4 7.2L15.6 7.2M20.4 7.2L14.4 13.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <span className="flex-1 text-sm font-medium text-left text-black">
        Draw an area on the map
      </span>
      <div className="w-6 h-6 shrink-0">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M19 12L12 5M19 12L12 19"
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
