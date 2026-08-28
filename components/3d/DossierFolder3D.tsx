"use client";

import React, { useState } from "react";

interface DossierFolder3DProps {
  isOpen?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  candidateName?: string;
  roleTitle?: string;
}

export function DossierFolder3D({
  isOpen: externalIsOpen,
  onToggle,
  children,
  candidateName = "CONFIDENTIAL DOSSIER",
  roleTitle = "TOP SECRET AI EVALUATION",
}: DossierFolder3DProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleFlip = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative w-full my-6 perspective-1200">
      {/* 3D Dossier Folder Container */}
      <div className="relative w-full rounded-2xl transition-all duration-700 ease-out transform-gpu">
        {/* Top Folder Tab Header */}
        <div className="flex items-center justify-between bg-slate-800/90 border-2 border-slate-700 border-b-0 rounded-t-2xl px-6 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-sm" />
            <span className="font-mono text-xs font-black uppercase text-amber-300 tracking-widest">
              CONFIDENTIAL CASE FILE • CLASSIFIED DOSSIER
            </span>
          </div>

          <button
            type="button"
            onClick={handleFlip}
            className="text-xs font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500 hover:text-slate-950 px-3.5 py-1 rounded-lg transition-all"
          >
            {isOpen ? "Close 3D Folder Cover 📁" : "Open 3D Folder Cover 📂"}
          </button>
        </div>

        {/* Folder Hinged Cover (3D Flip Animation) */}
        <div
          className={`w-full transition-transform duration-700 ease-in-out transform-gpu origin-top ${
            isOpen ? "rotate-x-0 opacity-100" : "-rotate-x-90 opacity-0 pointer-events-none"
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Main Paper Content Container */}
          <div className="glass-panel p-6 md:p-8 rounded-b-2xl bg-slate-900 border-2 border-slate-700 text-white shadow-2xl relative">
            {children}
          </div>
        </div>

        {/* Closed Cover View when folder is shut */}
        {!isOpen && (
          <div
            onClick={handleFlip}
            className="glass-panel p-10 rounded-b-2xl bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-500/60 text-white shadow-2xl cursor-pointer text-center space-y-4 hover:border-amber-400 transition-all"
          >
            <div className="w-16 h-16 bg-amber-500/20 rounded-2xl border-2 border-amber-500/60 flex items-center justify-center mx-auto text-3xl shadow-lg">
              📂
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wider">
                {candidateName}
              </h3>
              <p className="font-mono text-xs text-amber-400 font-bold uppercase">{roleTitle}</p>
            </div>
            <p className="font-mono text-xs text-slate-300 font-bold">
              Click cover to open physical 3D dossier folder
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
