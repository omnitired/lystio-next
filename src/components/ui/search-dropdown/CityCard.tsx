"use client";
import React from "react";
import Image from "next/image";

interface CityCardProps {
  name: string;
  districtInfo: string;
  imageSrc: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CityCard({
  name,
  districtInfo,
  imageSrc,
  isSelected = false,
  onClick,
}: CityCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-1 rounded-lg w-[88px] transition-colors ${
        isSelected
          ? "bg-white border border-brand-purple"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="w-full h-20 relative rounded overflow-hidden mb-1">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
        />
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 w-4 h-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="8" fill="#A540F3" />
              <path
                d="M5 8L7 10L11 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="w-full text-left">
        <p className="text-sm font-medium text-text-primary truncate">
          {name}
        </p>
        <p
          className={`text-[10px] font-medium truncate ${
            isSelected ? "text-brand-purple-alt" : "text-text-secondary"
          }`}
        >
          {districtInfo}
        </p>
      </div>
    </button>
  );
}
