"use client";

import React, { useState, useRef, MouseEvent } from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees
  perspective?: number; // Perspective in px
  glare?: boolean;
  scale?: number; // Hover scale multiplier
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  maxTilt = 8,
  perspective = 1000,
  glare = true,
  scale = 1.02,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotX = ((mouseY / height) - 0.5) * -2 * maxTilt;
    const rotY = ((mouseX / width) - 0.5) * 2 * maxTilt;

    setRotateX(rotX);
    setRotateY(rotY);

    if (glare) {
      const glareX = (mouseX / width) * 100;
      const glareY = (mouseY / height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.25 });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className="inline-block w-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale}) translateZ(10px)`
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)",
          transition: isHovered
            ? "transform 0.1s cubic-bezier(0.03, 0.98, 0.52, 0.99)"
            : "transform 0.5s ease-out, box-shadow 0.5s ease-out",
          transformStyle: "preserve-3d",
        }}
        className={`relative transition-all duration-300 ${className}`}
      >
        {children}

        {/* 3D Dynamic Glare Overlay */}
        {glare && (
          <div
            className="pointer-events-none absolute inset-0 rounded-inherit transition-opacity duration-300 overflow-hidden"
            style={{
              borderRadius: "inherit",
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};
