import React from "react";
import Image from "next/image";

export function Header() {
  return (
    <header className="bg-white h-[52px] md:h-20 relative flex items-center justify-center">
      {/* Logo */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2">
        <div className="flex items-center justify-center">
          {/* Small logo on mobile, full logo on desktop */}
          <Image
            src="/lystio-logo-sm.svg"
            alt="Lystio Logo"
            width={51}
            height={24}
            className="md:hidden"
          />
          <Image
            src="/lystio-logo.svg"
            alt="Lystio Logo"
            width={80}
            height={38}
            className="hidden md:block"
          />
        </div>
      </div>

      {/* Menu Icon - Mobile only */}
      <button className="md:hidden absolute right-4 top-1/2 -translate-y-1/2">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" fill="black"/>
</svg>

      </button>
    </header>
  );
}
