"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { FilterProvider } from "@/contexts/FilterContext";

export default function Home() {
  const [searchCount, setSearchCount] = useState<number | undefined>(undefined);

  return (
    <FilterProvider initialFilter={{ mode: "rent" }}>
      <div className="min-h-screen bg-white relative">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        {/* Search Bar Section */}
        <div className="bg-white  pb-6 flex flex-col items-center shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-10">
          <SearchBar
            onSearch={() => console.log("Search clicked")}
            onCountUpdate={setSearchCount}
          />
          {/* Search Count Display */}
        </div>

        {/* Map or other content would go here */}
        <div className="h-screen bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-lg">
            {" "}

              <div className="mt-4 text-center">
                <p className="text-lg font-medium text-text-primary">
                <span className="text-brand-purple font-semibold">
                    {searchCount}
                  </span>{" "}
                  {searchCount === 1 ? "property" : "properties"}
                  {" "}
                  Found{" "}

                </p>
              </div>

          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
