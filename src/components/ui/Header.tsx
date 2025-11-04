import React from "react";
import Image from "next/image";

export function Header() {
  return (
    <header className="bg-white h-20 relative flex items-center justify-center">
      {/* Logo */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center">
          <Image src="/lystio-logo.svg" alt="Lystio Logo" width={80} height={37} />
        </div>
      </div>
    </header>
  );
}
