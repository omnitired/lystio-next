import React from "react";

interface LocationTag {
  label: string;
  onRemove?: () => void;
}

interface SearchBarProps {
  locationTags?: LocationTag[];
  locationPlaceholder?: string;
  category?: string;
  pricePlaceholder?: string;
  onLocationClick?: () => void;
  onCategoryClick?: () => void;
  onPriceClick?: () => void;
  onSearch?: () => void;
}

export function SearchBar({
  locationTags = [],
  locationPlaceholder = "City, District, Street, Postcode",
  category = "Apartments",
  pricePlaceholder = "Select Price Range",
  onLocationClick,
  onCategoryClick,
  onPriceClick,
  onSearch,
}: SearchBarProps) {
  return (
    <div className="w-[900px] h-[69px] bg-white border border-border-light rounded-full shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] overflow-hidden">
      <div className="flex h-full items-center">
        {/* Location Section */}
        <div
          onClick={onLocationClick}
          className="w-[300px] h-full flex items-center gap-[15px] pl-6 pr-4 py-3 cursor-pointer hover:bg-bg-light transition-colors"
        >
          <div className="flex-1 flex flex-col min-w-0">
            <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
              Location
            </label>
            <div className="flex items-center gap-1 w-full">
              {locationTags.length > 0 ? (
                <>
                  {locationTags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-brand-purple-light rounded-2xl px-1 flex items-center gap-0.5 max-w-[200px] shrink-0"
                    >
                      <span className="text-sm font-medium text-text-primary truncate leading-[1.6]">
                        {tag.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          tag.onRemove?.();
                        }}
                        className="w-4 h-4 shrink-0 flex items-center justify-center"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="8" cy="8" r="8" fill="#0E0E0E" />
                          <path
                            d="M5 5L11 11M5 11L11 5"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <span className="text-sm font-medium text-text-secondary opacity-40 truncate leading-[1.6] flex-1">
                    {locationPlaceholder}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-text-secondary opacity-40 truncate leading-[1.6]">
                  {locationPlaceholder}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Category Section */}
        <div
          onClick={onCategoryClick}
          className="w-[250px] h-full bg-bg-light flex items-center gap-[15px] px-3 py-2 border-l border-border-light cursor-pointer hover:bg-brand-purple-light transition-colors"
        >
          <div className="flex-1 flex flex-col">
            <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
              Category
            </label>
            <span className="text-sm font-medium text-text-primary leading-[1.6]">
              {category}
            </span>
          </div>
        </div>

        {/* Price Section + Search Button */}
        <div className="flex-1 bg-bg-light h-full flex items-center border-l border-border-light">
          <div
            onClick={onPriceClick}
            className="flex-1 flex items-center gap-[15px] px-3 py-2 cursor-pointer hover:bg-brand-purple-light transition-colors"
          >
            <div className="flex-1 flex flex-col">
              <label className="text-xs font-medium text-text-primary leading-[1.6] mb-1">
                Price
              </label>
              <span className="text-sm font-medium text-text-primary opacity-40 leading-[1.6]">
                {pricePlaceholder}
              </span>
            </div>
          </div>

          {/* Search Button */}
          <div className="px-2 py-0 h-full flex items-center">
            <button
              onClick={onSearch}
              className="bg-brand-purple hover:bg-brand-purple-alt transition-colors rounded-full pl-2 pr-3 py-3 flex items-center gap-2"
            >
              <div className="w-4 h-4">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 14L11.1 11.1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-base font-medium text-white leading-[1.5]">
                Search
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
