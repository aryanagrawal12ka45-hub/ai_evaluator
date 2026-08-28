"use client";

import React from "react";

interface StampBadge3DProps {
  recommendation: string; // Hire, Hire with reservations, Not hire, More info needed
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export const StampBadge3D: React.FC<StampBadge3DProps> = ({
  recommendation,
  size = "md",
  animate = true,
}) => {
  const isNotHire = recommendation.toLowerCase().includes("not hire") || recommendation.toLowerCase().includes("no hire");

  let stampClass = "verdict-stamp-hire";
  let label = "DECREED HIRE";

  if (isNotHire) {
    stampClass = "verdict-stamp-nohire";
    label = "DECREED NOT HIRE";
  } else if (recommendation.toLowerCase().includes("reservations") || recommendation.toLowerCase().includes("more info")) {
    stampClass = "verdict-stamp-caution";
    label = "CAUTION / MORE INFO";
  }

  const sizeClasses =
    size === "lg"
      ? "text-2xl md:text-3xl px-5 py-2.5"
      : size === "sm"
      ? "text-xs px-2.5 py-1 tracking-wider"
      : "text-sm md:text-base px-3.5 py-1.5";

  return (
    <div
      className={`verdict-stamp ${stampClass} ${sizeClasses} ${
        animate ? "animate-stamp-3d" : ""
      }`}
    >
      {label}
    </div>
  );
};
