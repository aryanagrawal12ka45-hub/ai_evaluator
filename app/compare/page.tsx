"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StampBadge3D } from "@/components/3d/StampBadge3D";
import { Scale, ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, Shield, AlertTriangle } from "lucide-react";

interface CandidateSimple {
  id: string;
  name: string;
  roleAppliedFor: string;
  verdict?: {
    recommendation: string;
    reasoning: string;
  };
}

export default function ComparePage() {
  const [candidates, setCandidates] = useState<CandidateSimple[]>([]);
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const res = await fetch("/api/candidates");
        if (res.ok) {
          const data = await res.json();
          setCandidates(data);
          if (data.length >= 2) {
            setSelectedA(data[0].id);
            setSelectedB(data[1].id);
          }
        }
      } catch (err) {
        console.error("Error loading candidates:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCandidates();
  }, []);

  const candA = candidates.find((c) => c.id === selectedA);
  const candB = candidates.find((c) => c.id === selectedB);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-[#E8E4D8]">
        <RefreshCw className="w-10 h-10 text-[#D4A537] animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D4A537]">
          Loading Head-to-Head Judicial Comparison Bench...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#E8E4D8] max-w-7xl mx-auto py-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4A537]">
            <Link href="/" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Case Archive
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-[#E8E4D8] uppercase tracking-tight">
            Judicial Bench — Candidate Comparison
          </h1>
          <p className="text-xs font-mono text-white/70">
            Compare any two docket cases side-by-side against Cargonet AI Freight Operations requirements.
          </p>
        </div>

        <Link
          href="/"
          className="precinct-btn text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <span>Return to Archive</span>
        </Link>
      </div>

      {/* Candidate Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
          <label className="text-xs font-mono font-bold text-[#D4A537] uppercase tracking-wider block">
            Select Candidate A:
          </label>
          <select
            value={selectedA}
            onChange={(e) => setSelectedA(e.target.value)}
            className="w-full bg-[#232830] text-[#E8E4D8] font-mono text-sm p-3 rounded border border-white/20 focus:border-[#D4A537] outline-none"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.verdict?.recommendation || "Pending"})
              </option>
            ))}
          </select>
        </div>

        <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
          <label className="text-xs font-mono font-bold text-[#D4A537] uppercase tracking-wider block">
            Select Candidate B:
          </label>
          <select
            value={selectedB}
            onChange={(e) => setSelectedB(e.target.value)}
            className="w-full bg-[#232830] text-[#E8E4D8] font-mono text-sm p-3 rounded border border-white/20 focus:border-[#D4A537] outline-none"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.verdict?.recommendation || "Pending"})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Cards */}
      {candA && candB ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Candidate A Card */}
          <div className="precinct-card p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
                  Candidate A Case File
                </span>
                <h3 className="text-3xl font-display font-bold text-[#E8E4D8]">{candA.name}</h3>
                <p className="text-xs font-mono text-white/70">{candA.roleAppliedFor}</p>
              </div>
              <StampBadge3D recommendation={candA.verdict?.recommendation || "Hire"} size="sm" animate={false} />
            </div>

            <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-[#D4A537] uppercase block">
                Magistrate Rationale
              </span>
              <p className="font-body text-sm text-[#E8E4D8] leading-relaxed">
                {candA.verdict?.reasoning || "Evaluation complete."}
              </p>
            </div>

            <Link
              href={`/candidates/${candA.id}`}
              className="precinct-btn w-full p-3 text-xs flex items-center justify-between"
            >
              <span>Inspect Full {candA.name} Dossier</span>
              <ArrowRight className="w-4 h-4 text-[#D4A537]" />
            </Link>
          </div>

          {/* Candidate B Card */}
          <div className="precinct-card p-6 space-y-6">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
                  Candidate B Case File
                </span>
                <h3 className="text-3xl font-display font-bold text-[#E8E4D8]">{candB.name}</h3>
                <p className="text-xs font-mono text-white/70">{candB.roleAppliedFor}</p>
              </div>
              <StampBadge3D recommendation={candB.verdict?.recommendation || "Hire"} size="sm" animate={false} />
            </div>

            <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
              <span className="text-xs font-mono font-bold text-[#D4A537] uppercase block">
                Magistrate Rationale
              </span>
              <p className="font-body text-sm text-[#E8E4D8] leading-relaxed">
                {candB.verdict?.reasoning || "Evaluation complete."}
              </p>
            </div>

            <Link
              href={`/candidates/${candB.id}`}
              className="precinct-btn w-full p-3 text-xs flex items-center justify-between"
            >
              <span>Inspect Full {candB.name} Dossier</span>
              <ArrowRight className="w-4 h-4 text-[#D4A537]" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="precinct-card p-8 text-center text-white/60 font-mono text-xs">
          Select two candidates above to render comparative judicial analysis.
        </div>
      )}
    </div>
  );
}
