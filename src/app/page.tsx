"use client";

import { useState } from "react";
import { Header } from "@/components/ui/Header";
import { SearchBar } from "@/components/ui/SearchBar";

export default function Home() {
  const [headerMode, setHeaderMode] = useState<"rent" | "buy" | "ai">("rent");
  const [searchCount, setSearchCount] = useState<number | undefined>(undefined);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <Header />

      {/* Main Content Area */}
        {/* Search Bar Section */}
        <div className="bg-white pt-6 pb-6 flex flex-col items-center shadow-[0px_105px_77.6px_38px_rgba(0,0,0,0.08)] relative z-10">
          <SearchBar
            mode={headerMode}
            onModeChange={setHeaderMode}
            onSearch={() => console.log("Search clicked")}
            onCountUpdate={setSearchCount}
          />
          {/* Search Count Display */}
          {searchCount !== undefined && (
            <div className="mt-4 text-center">
              <p className="text-lg font-medium text-text-primary">
                Found <span className="text-brand-purple font-semibold">{searchCount}</span> {searchCount === 1 ? 'property' : 'properties'}
              </p>
            </div>
          )}
        </div>

        {/* Map or other content would go here */}
        <div className="h-[calc(100vh-240px)] bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Map content area</p>
        </div>
    </div>
  );
}
