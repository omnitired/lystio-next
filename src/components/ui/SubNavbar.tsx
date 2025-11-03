import React from "react";

interface FilterButtonProps {
  label: string;
  onClick?: () => void;
}

function FilterButton({ label, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className="border border-border-light rounded bg-white px-2.5 py-2 flex items-center gap-2.5 hover:bg-bg-light transition-colors"
    >
      <span className="text-base font-medium text-black whitespace-nowrap">
        {label}
      </span>
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.25 7.875L10.5 13.125L15.75 7.875"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function SubNavbar() {
  return (
    <div className="bg-white border-b border-border-light px-8 py-2 flex items-center justify-between">
      {/* Filter Buttons */}
      <div className="flex items-center gap-4 py-1.5">
        <FilterButton label="Rent" />
        <FilterButton label="Rooms" />
        <FilterButton label="Size m²" />
        <FilterButton label="Location Accuracy" />
        <FilterButton label="Outdoor Spaces" />
        <FilterButton label="Popular Amenities" />

        {/* All Filters Button (no border) */}
        <button className="px-2.5 py-1 flex items-center gap-2.5 hover:bg-bg-light rounded transition-colors">
          <span className="text-base font-medium text-black whitespace-nowrap">
            All Filters
          </span>
          <div className="w-6 h-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.25 5.61C4.25 5.2 4.59 4.86 5 4.86H19C19.41 4.86 19.75 5.2 19.75 5.61V6.89C19.75 7.11 19.66 7.33 19.5 7.48L14.34 12.64C14.18 12.8 14.09 13.02 14.09 13.24V18.89L9.91 16.8V13.24C9.91 13.02 9.82 12.8 9.66 12.64L4.5 7.48C4.34 7.33 4.25 7.11 4.25 6.89V5.61Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Add Search Agent Button */}
      <button className="bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-lg px-4 py-3 flex items-center gap-2">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12V17.0909C20 17.9375 20 18.3608 19.8739 18.6989C19.6712 19.2425 19.2425 19.6712 18.6989 19.8739C18.3608 20 17.9375 20 17.0909 20C16.2442 20 15.8209 20 15.4828 19.8739C14.9392 19.6712 14.5105 19.2425 14.3078 18.6989C14.1817 18.3608 14.1817 17.9375 14.1817 17.0909V16.4C14.1817 15.0745 14.1817 14.4117 13.8972 13.9054C13.6466 13.4578 13.2694 13.0806 12.8218 12.83C12.3155 12.5455 11.6527 12.5455 10.3273 12.5455H4Z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 9H15M12 6V12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-base font-medium text-white whitespace-nowrap">
          Add Search Agent
        </span>
      </button>
    </div>
  );
}
