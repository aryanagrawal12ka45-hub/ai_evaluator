import React from "react";

interface StampBadgeProps {
  recommendation: string;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export const StampBadge: React.FC<StampBadgeProps> = ({
  recommendation,
  size = "md",
  animate = false,
}) => {
  const isHire = recommendation === "Hire" || recommendation === "Strong Hire";
  const isLean = recommendation === "Lean Hire";

  let badgeStyle = {
    color: "#EF4444",
    borderColor: "#EF4444",
    boxShadow: "0 0 25px rgba(239, 68, 68, 0.35), inset 0 0 12px rgba(239, 68, 68, 0.2)",
    textShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
  };

  if (isHire) {
    badgeStyle = {
      color: "#10B981",
      borderColor: "#10B981",
      boxShadow: "0 0 25px rgba(16, 185, 129, 0.35), inset 0 0 12px rgba(16, 185, 129, 0.2)",
      textShadow: "0 0 8px rgba(16, 185, 129, 0.6)",
    };
  } else if (isLean) {
    badgeStyle = {
      color: "#F59E0B",
      borderColor: "#F59E0B",
      boxShadow: "0 0 25px rgba(245, 158, 11, 0.35), inset 0 0 12px rgba(245, 158, 11, 0.2)",
      textShadow: "0 0 8px rgba(245, 158, 11, 0.6)",
    };
  }

  let sizeClasses = "px-3 py-1 text-xs border-2 tracking-wider";
  if (size === "md") {
    sizeClasses = "px-5 py-2 text-sm md:text-base border-4 tracking-widest";
  } else if (size === "lg") {
    sizeClasses = "px-8 py-3 text-xl md:text-2xl border-4 tracking-widest";
  }

  const animationClass = animate ? "animate-stamp-down" : "-rotate-6";

  return (
    <div
      className={`inline-block uppercase font-display font-extrabold text-center rounded-md select-none backdrop-blur-md transition-all duration-300 transform-gpu hover:scale-105 hover:-rotate-3 hover:translate-z-8 ${sizeClasses} ${animationClass}`}
      style={{
        ...badgeStyle,
        transformStyle: "preserve-3d",
      }}
    >
      <div className="border-t border-b border-current py-0.5 my-0.5 pointer-events-none tracking-widest flex items-center justify-center gap-2">
        <span className="opacity-75">★</span>
        <span>{recommendation}</span>
        <span className="opacity-75">★</span>
      </div>
    </div>
  );
};
