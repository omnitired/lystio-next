import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import locationsData from "../locations.json";

interface LocationDropdownProps {
  onClose?: () => void;
  onApply?: (selectedLocation: string, selectedDistricts: string[]) => void;
  onLocationUpdate?: (locationName: string) => void;
  isOpen?: boolean;
}

interface Location {
  name: string;
  altName: string;
  id: string;
  children: {
    name: string;
    altName: string;
    id: string;
    postal_code?: string;
    urlSegment?: string | null;
  }[];
  urlSegment: string;
}

// City images for popular locations
const cityImages: Record<string, string> = {
  "Wien": "/cities/Vienna.png",
  "Graz": "/cities/Graz.png",
  "Linz": "/cities/Linz.png",
  "Salzburg": "/cities/Salzburg.png",
  "Salzburg Stadt": "/cities/Salzburg.png",
  "Innsbruck": "/cities/Innsbruck.png",
  "Klagenfurt am Wörthersee": "/cities/Klagenfurt.png",
  "Niederösterreich": "/cities/LowerAustria.png",
  "Oberösterreich": "/cities/UpperAustria.png",
  "Burgenland": "/cities/Burgenland.png",
  "Kärnten": "/cities/Carinthia.png",
  "Vorarlberg": "/cities/Vorarlberg.png",
  "Steiermark": "/cities/Styria.png",
  "Tirol": "/cities/Tyrol.png",
};


export function LocationDropdown({ onClose, onApply, onLocationUpdate, isOpen = true }: LocationDropdownProps) {
  const locations = locationsData as Location[];

  // Find popular cities (first 6 locations with city-level data)
  const popularCities = locations.slice(0, 6);
  const otherLocations = locations.slice(6);

  const [selectedLocation, setSelectedLocation] = useState<Location>(popularCities[0]);
  const [selectedDistricts, setSelectedDistricts] = useState<Set<string>>(new Set());
  const [allDistrictsSelected, setAllDistrictsSelected] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const previousSelectedLocation = useRef<string | null>(null);
  const hasAnimatedIn = useRef(false);

  // Animate dropdown opening
  useEffect(() => {
    if (dropdownRef.current && isOpen && !hasAnimatedIn.current) {
      gsap.fromTo(
        dropdownRef.current,
        {
          opacity: 0,
          scaleY: 0,
          transformOrigin: "top center",
        },
        {
          opacity: 1,
          scaleY: 1,
          duration: 0.3,
          ease: "power2.out",
          onComplete: () => {
            hasAnimatedIn.current = true;
          },
        }
      );
    }
  }, [isOpen]);

  // Animate dropdown closing
  useEffect(() => {
    if (!isOpen && hasAnimatedIn.current && dropdownRef.current) {
      gsap.to(dropdownRef.current, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: "top center",
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          if (onClose) {
            onClose();
          }
        },
      });
    }
  }, [isOpen]);

  // Animate when switching between locations
  useEffect(() => {
    if (rightPanelRef.current && selectedLocation && previousSelectedLocation.current !== selectedLocation.id) {
      if (previousSelectedLocation.current !== null) {
        gsap.fromTo(
          rightPanelRef.current,
          {
            opacity: 0,
            x: 10,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }
      previousSelectedLocation.current = selectedLocation.id;
    }
  }, [selectedLocation]);

  const toggleDistrict = (districtId: string) => {
    const newSelected = new Set(selectedDistricts);
    if (newSelected.has(districtId)) {
      newSelected.delete(districtId);
    } else {
      newSelected.add(districtId);
    }
    setSelectedDistricts(newSelected);
    setAllDistrictsSelected(false);
  };

  const toggleAllDistricts = () => {
    if (allDistrictsSelected) {
      setAllDistrictsSelected(false);
      setSelectedDistricts(new Set());
    } else {
      setAllDistrictsSelected(true);
      setSelectedDistricts(new Set());
    }
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
    setSelectedDistricts(new Set());
    setAllDistrictsSelected(true);
    onLocationUpdate?.(location.name);
  };

  const isLocationSelected = (location: Location) => {
    return selectedLocation.id === location.id;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] z-50 font-[family-name:var(--font-plus-jakarta-sans)] flex w-[570px]"
    >
      {/* Left Panel - Locations */}
      <div className="w-[300px] flex flex-col">
        {/* Draw Area Button */}
        <div className="px-3 py-2">
          <button className="w-full flex items-center gap-2 px-2 py-2 border border-[#eee7ff] rounded-xl hover:border-brand-purple transition-colors">
            <div className="bg-[#f6ecfe] rounded-full p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 9L19.5 11.5M17 9L14 12M17 9L14.5 6.5M7 15L4.5 12.5M7 15L10 12M7 15L9.5 17.5" stroke="#A540F3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-medium text-text-primary flex-1 text-left">Draw an area on the map</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="#79767D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto max-h-[490px] px-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* By City Section */}
          <div className="mb-2">
            <p className="text-sm font-medium text-text-secondary mb-2">Popular Locations</p>

            {/* Popular Cities Grid */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              {popularCities.map((city) => {
                const isSelected = isLocationSelected(city);
                return (
                  <button
                    key={city.id}
                    onClick={() => handleLocationSelect(city)}
                    className={`flex flex-col p-1 rounded-md ${
                      isSelected ? "border border-brand-purple" : ""
                    }`}
                  >
                    <div className="relative h-20 w-full rounded overflow-hidden mb-1">
                      <img
                        src={cityImages[city.name] || "/cities/Vienna.png"}
                        alt={city.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="8" fill="#A540F3"/>
                            <path d="M5 8.75532L7.47917 11.1667L14.3333 4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="w-full">
                      <p className={`text-sm font-medium leading-normal overflow-hidden text-ellipsis whitespace-nowrap ${
                        isSelected ? "text-text-primary" : "text-text-primary"
                      }`}>
                        {city.name}
                      </p>
                      <p className={`text-[10px] font-medium leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap ${
                        isSelected ? "text-brand-purple" : "text-text-secondary"
                      }`}>
                        {isSelected ? "All Districts" : `${city.children.length} Districts`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* By State Section */}
          <div>
            <p className="text-sm font-medium text-text-secondary mb-2">Other Locations</p>

            {/* State/Region List */}
            <div className="flex flex-col">
              {otherLocations.map((location) => {
                return (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="flex items-center gap-2 px-2 py-2 hover:bg-[#fdfbff] rounded-lg"
                  >
                    <img
                      src={cityImages[location.name] || "/cities/LowerAustria.png"}
                      alt={location.name}
                      className="w-[38px] h-[38px] rounded object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary leading-normal">
                        {location.name}
                      </p>
                      <p className="text-[10px] font-medium text-text-secondary leading-[1.3]">
                        {location.children.length} Districts
                      </p>
                    </div>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="shrink-0">
                      <path d="M9 18L15 12L9 6" stroke="#79767D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Districts */}
      <div className="w-[270px] border-l border-border-light flex flex-col">
        <div ref={rightPanelRef} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-3">
            <p className="text-base font-semibold text-text-primary leading-[1.2]">
              {selectedLocation.name}
            </p>
          </div>

          {/* Districts List */}
          <div className="flex-1 overflow-y-auto max-h-[520px] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* All Districts Option */}
            <button
              onClick={toggleAllDistricts}
              className="flex items-center gap-3 px-3 py-2 border-b border-border-light w-full"
            >
              <div className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                allDistrictsSelected
                  ? "bg-brand-purple border-brand-purple-200"
                  : "bg-white border-brand-purple-200"
              }`}>
                {allDistrictsSelected && (
                  <svg width="10" height="8" viewBox="0 0 11 8" fill="none">
                    <path
                      d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5"
                      stroke="white"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary leading-normal text-left">
                  All Districts
                </p>
                <p className="text-xs font-medium text-text-primary opacity-60 leading-normal text-left">
                  {selectedLocation.children.length} Districts
                </p>
              </div>
            </button>

            {/* Individual Districts */}
            {selectedLocation.children.map((district) => {
              const isChecked = !allDistrictsSelected && selectedDistricts.has(district.id);

              return (
                <button
                  key={district.id}
                  onClick={() => toggleDistrict(district.id)}
                  className="flex items-center gap-3 px-3 py-2.5 h-10 hover:bg-[#f7f7fd] w-full"
                >
                  <div className={`w-4 h-4 flex items-center justify-center shrink-0 border rounded ${
                    isChecked
                      ? "bg-brand-purple border-brand-purple-200"
                      : "bg-white border-brand-purple-200"
                  }`}>
                    {isChecked && (
                      <svg width="10" height="8" viewBox="0 0 11 8" fill="none">
                        <path
                          d="M0.5 4.75532L2.97917 7.16667L9.83333 0.5"
                          stroke="white"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-primary leading-normal flex-1 text-left">
                    {district.postal_code ? `${district.postal_code}, ${district.name}` : district.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
