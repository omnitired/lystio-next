/**
 * Example usage of SearchDropdown component
 *
 * This file demonstrates how to use the SearchDropdown with sample data.
 * You can copy this code into your page or component.
 */

import { SearchDropdown, City, State } from "./SearchDropdown";

// Sample city data matching the Figma design
const sampleCities: City[] = [
  {
    id: "vienna",
    name: "Vienna",
    districtInfo: "All Districts",
    imageSrc: "/images/cities/vienna.jpg", // Replace with actual image path
    isSelected: true,
  },
  {
    id: "graz",
    name: "Graz",
    districtInfo: "23 Districts",
    imageSrc: "/images/cities/graz.jpg",
  },
  {
    id: "linz",
    name: "Linz",
    districtInfo: "23 Districts",
    imageSrc: "/images/cities/linz.jpg",
  },
  {
    id: "salzburg",
    name: "Salzburg",
    districtInfo: "23 Districts",
    imageSrc: "/images/cities/salzburg.jpg",
  },
  {
    id: "innsbruck",
    name: "Innsbruck",
    districtInfo: "23 Districts",
    imageSrc: "/images/cities/innsbruck.jpg",
  },
  {
    id: "klagenfurt",
    name: "Klagenfurt",
    districtInfo: "23 Districts",
    imageSrc: "/images/cities/klagenfurt.jpg",
  },
];

// Sample state data matching the Figma design
const sampleStates: State[] = [
  {
    id: "lower-austria",
    name: "Lower Austria",
    districtCount: 24,
    imageSrc: "/images/states/lower-austria.jpg",
  },
  {
    id: "upper-austria",
    name: "Upper Austria",
    districtCount: 18,
    imageSrc: "/images/states/upper-austria.jpg",
  },
  {
    id: "burgenland",
    name: "Burgenland",
    districtCount: 9,
    imageSrc: "/images/states/burgenland.jpg",
  },
  {
    id: "carinthia",
    name: "Carinthia",
    districtCount: 10,
    imageSrc: "/images/states/carinthia.jpg",
  },
  {
    id: "vorarlberg",
    name: "Vorarlberg",
    districtCount: 4,
    imageSrc: "/images/states/vorarlberg.jpg",
  },
  {
    id: "styria",
    name: "Styria",
    districtCount: 13,
    imageSrc: "/images/states/styria.jpg",
  },
];

export function SearchDropdownExample() {
  const handleCityClick = (cityId: string) => {
    console.log("City clicked:", cityId);
    // Add your city selection logic here
  };

  const handleStateClick = (stateId: string) => {
    console.log("State clicked:", stateId);
    // Add your state selection logic here
  };

  const handleDrawAreaClick = () => {
    console.log("Draw area clicked");
    // Add your draw area logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <SearchDropdown
        cities={sampleCities}
        states={sampleStates}
        onCityClick={handleCityClick}
        onStateClick={handleStateClick}
        onDrawAreaClick={handleDrawAreaClick}
      />
    </div>
  );
}
