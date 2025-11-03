import React from "react";
import { CityCard } from "./CityCard";
import { StateItem } from "./StateItem";
import { DrawAreaButton } from "./DrawAreaButton";

export interface City {
  id: string;
  name: string;
  districtInfo: string;
  imageSrc: string;
  isSelected?: boolean;
}

export interface State {
  id: string;
  name: string;
  districtCount: number;
  imageSrc: string;
}

interface SearchDropdownProps {
  cities?: City[];
  states?: State[];
  onCityClick?: (cityId: string) => void;
  onStateClick?: (stateId: string) => void;
  onDrawAreaClick?: () => void;
}

export function SearchDropdown({
  cities = [],
  states = [],
  onCityClick,
  onStateClick,
  onDrawAreaClick,
}: SearchDropdownProps) {
  return (
    <div className="w-[300px] bg-white rounded-2xl shadow-[0px_30px_70px_0px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="p-3">
        <div className="flex flex-col h-[490px]">
          {/* Draw Area Button */}
          <div className="mb-2">
            <DrawAreaButton onClick={onDrawAreaClick} />
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {/* By City Section */}
            {cities.length > 0 && (
              <div className="mb-2">
                <div className="pb-2">
                  <p className="text-sm font-medium text-text-secondary">
                    By City
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  {/* City Grid - 2 rows of 3 */}
                  <div className="flex gap-1">
                    {cities.slice(0, 3).map((city) => (
                      <CityCard
                        key={city.id}
                        name={city.name}
                        districtInfo={city.districtInfo}
                        imageSrc={city.imageSrc}
                        isSelected={city.isSelected}
                        onClick={() => onCityClick?.(city.id)}
                      />
                    ))}
                  </div>
                  {cities.length > 3 && (
                    <div className="flex gap-1">
                      {cities.slice(3, 6).map((city) => (
                        <CityCard
                          key={city.id}
                          name={city.name}
                          districtInfo={city.districtInfo}
                          imageSrc={city.imageSrc}
                          isSelected={city.isSelected}
                          onClick={() => onCityClick?.(city.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* By State Section */}
            {states.length > 0 && (
              <div>
                <div className="pb-2 pt-2">
                  <p className="text-sm font-medium text-text-secondary">
                    By State
                  </p>
                </div>
                <div className="flex flex-col">
                  {states.map((state) => (
                    <StateItem
                      key={state.id}
                      name={state.name}
                      districtCount={state.districtCount}
                      imageSrc={state.imageSrc}
                      onClick={() => onStateClick?.(state.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scrollbar indicator (styled) */}
          <div className="absolute right-[5.63px] top-[82.75px] w-[5px] h-[325.91px] bg-text-primary opacity-10 rounded-lg pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
