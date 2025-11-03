"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SubNavbar } from "@/components/ui/SubNavbar";
import { SearchBar } from "@/components/ui/SearchBar";
import { SearchDropdown, City, State } from "@/components/ui/search-dropdown";

// Sample data matching the Figma design
const sampleCities: City[] = [
  {
    id: "vienna",
    name: "Vienna",
    districtInfo: "All Districts",
    imageSrc: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=300&fit=crop",
    isSelected: true,
  },
  {
    id: "graz",
    name: "Graz",
    districtInfo: "23 Districts",
    imageSrc: "https://images.unsplash.com/photo-1555881605-ea6cf8b0e8f2?w=400&h=300&fit=crop",
  },
  {
    id: "linz",
    name: "Linz",
    districtInfo: "23 Districts",
    imageSrc: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
  },
  {
    id: "salzburg",
    name: "Salzburg",
    districtInfo: "23 Districts",
    imageSrc: "https://images.unsplash.com/photo-1598880940371-c756e015faf1?w=400&h=300&fit=crop",
  },
  {
    id: "innsbruck",
    name: "Innsbruck",
    districtInfo: "23 Districts",
    imageSrc: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
  },
  {
    id: "klagenfurt",
    name: "Klagenfurt",
    districtInfo: "23 Districts",
    imageSrc: "https://images.unsplash.com/photo-1555881605-ea6cf8b0e8f2?w=400&h=300&fit=crop",
  },
];

const sampleStates: State[] = [
  {
    id: "lower-austria",
    name: "Lower Austria",
    districtCount: 24,
    imageSrc: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop",
  },
  {
    id: "upper-austria",
    name: "Upper Austria",
    districtCount: 18,
    imageSrc: "https://images.unsplash.com/photo-1555881605-ea6cf8b0e8f2?w=100&h=100&fit=crop",
  },
  {
    id: "burgenland",
    name: "Burgenland",
    districtCount: 9,
    imageSrc: "https://images.unsplash.com/photo-1598880940371-c756e015faf1?w=100&h=100&fit=crop",
  },
  {
    id: "carinthia",
    name: "Carinthia",
    districtCount: 10,
    imageSrc: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=100&h=100&fit=crop",
  },
  {
    id: "vorarlberg",
    name: "Vorarlberg",
    districtCount: 4,
    imageSrc: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=100&h=100&fit=crop",
  },
  {
    id: "styria",
    name: "Styria",
    districtCount: 13,
    imageSrc: "https://images.unsplash.com/photo-1555881605-ea6cf8b0e8f2?w=100&h=100&fit=crop",
  },
];

export default function Home() {
  const [showDropdown, setShowDropdown] = useState(true);
  const [headerMode, setHeaderMode] = useState<"rent" | "buy" | "ai">("rent");
  const [locationTags, setLocationTags] = useState([
    {
      label: "Upper Austria  · Bindermichl-Keferfeld",
      onRemove: () => {
        setLocationTags([]);
      },
    },
  ]);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <Header mode={headerMode} onModeChange={setHeaderMode} />

      {/* Sub Navbar */}
      <SubNavbar />

      {/* Main Content Area */}
      <div className="relative">
        {/* Search Bar Section */}
        <div className="bg-white pt-6 pb-6 flex flex-col items-center shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-10">
          <SearchBar
            locationTags={locationTags}
            onLocationClick={() => setShowDropdown(!showDropdown)}
            onSearch={() => console.log("Search clicked")}
          />
        </div>

        {/* Overlay and Dropdown */}
        {showDropdown && (
          <>
            {/* Dark Overlay */}
            <div
              className="fixed inset-0 bg-black/40 z-20"
              onClick={() => setShowDropdown(false)}
            />

            {/* Search Dropdown - positioned absolutely */}
            <div className="absolute left-1/2 -translate-x-1/2 top-[77px] z-30">
              <SearchDropdown
                cities={sampleCities}
                states={sampleStates}
                onCityClick={(id) => console.log("City clicked:", id)}
                onStateClick={(id) => console.log("State clicked:", id)}
                onDrawAreaClick={() => console.log("Draw area clicked")}
              />
            </div>
          </>
        )}

        {/* Map or other content would go here */}
        <div className="h-[calc(100vh-240px)] bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Map content area</p>
        </div>
      </div>
    </div>
  );
}
