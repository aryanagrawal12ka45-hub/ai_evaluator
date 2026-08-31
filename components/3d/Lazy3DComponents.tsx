"use client";

import dynamic from "next/dynamic";
import React from "react";

// Lightweight Skeleton Fallback for 3D Canvas elements
function CanvasFallback({ height = "h-64", label = "Loading 3D Visualizer..." }: { height?: string; label?: string }) {
  return (
    <div
      className={`w-full ${height} rounded-xl bg-[#1A1D24]/80 border border-white/10 flex flex-col items-center justify-center space-y-3 animate-pulse text-white/50 font-mono text-xs`}
      aria-busy="true"
      aria-label={label}
    >
      <div className="w-8 h-8 rounded-full border-2 border-[#D4A537] border-t-transparent animate-spin" />
      <span>{label}</span>
    </div>
  );
}

// Dynamically imported 3D components with SSR disabled for optimal loading performance
export const AgentGraph3DLazy = dynamic(
  () => import("./AgentGraph3D").then((mod) => mod.AgentGraph3D),
  {
    ssr: false,
    loading: () => <CanvasFallback height="h-[400px]" label="Loading 3D Agent Network Graph..." />,
  }
);

export const DossierFolder3DLazy = dynamic(
  () => import("./DossierFolder3D").then((mod) => mod.DossierFolder3D),
  {
    ssr: false,
    loading: () => <CanvasFallback height="h-48" label="Loading 3D Dossier Folder..." />,
  }
);

export const StampBadge3DLazy = dynamic(
  () => import("./StampBadge3D").then((mod) => mod.StampBadge3D),
  {
    ssr: false,
    loading: () => <div className="w-16 h-16 rounded-full bg-[#D4A537]/20 animate-pulse border border-[#D4A537]/40" />,
  }
);
