import React from "react";
import { CheckCircle2, Clock, Loader2, AlertCircle, ShieldCheck, Zap } from "lucide-react";
import { AGENTS } from "@/lib/agents";

interface ProgressRailProps {
  status: string;
  errorMessage?: string | null;
}

const STEPS = [
  { id: "profiling", label: "Extract Dossier", stepNum: 1 },
  { id: "testimony", label: "Parallel 5-Agent Testimony", stepNum: 2 },
  { id: "debate", label: "Simultaneous Cross-Exam", stepNum: 3 },
  { id: "deciding", label: "Chief Verdict Decree", stepNum: 4 },
  { id: "done", label: "Docket Completed", stepNum: 5 },
];

export const ProgressRail: React.FC<ProgressRailProps> = ({ status, errorMessage }) => {
  const getStepIndex = (st: string) => {
    switch (st) {
      case "pending":
      case "profiling":
        return 0;
      case "testimony":
        return 1;
      case "debate":
        return 2;
      case "deciding":
        return 3;
      case "done":
        return 4;
      case "failed":
        return -1;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  if (status === "failed") {
    return (
      <div className="glass-panel border-2 border-red-500 bg-red-950/90 p-5 rounded-2xl mb-8 font-mono text-xs text-white flex items-center gap-4 shadow-2xl">
        <AlertCircle className="w-8 h-8 flex-shrink-0 animate-bounce text-red-400" />
        <div>
          <p className="font-bold text-sm font-display uppercase tracking-wider text-red-300">Server Pipeline Interrupted</p>
          <p className="mt-0.5 text-slate-200">{errorMessage || "An unexpected error occurred during server execution."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl mb-8 bg-slate-900 border-2 border-slate-700 text-white shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-display text-xs uppercase tracking-widest text-white font-black">
            Server Multi-Agent Pipeline Status
          </span>
          <span className="bg-amber-500 text-slate-950 text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 shadow-sm">
            <Zap className="w-3 h-3 text-slate-950 fill-slate-950" /> 5-Agent Simultaneous Concurrency
          </span>
        </div>

        {status !== "done" && (
          <span className="flex items-center gap-2 text-xs font-mono font-black text-amber-400 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            Executing 5 AI Model Calls Simultaneously in Parallel...
          </span>
        )}
      </div>

      {/* 5 Stepper Rail Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {STEPS.map((step, idx) => {
          const isCompleted = status === "done" || idx < currentIndex;
          const isCurrent = status !== "done" && idx === currentIndex;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${
                isCompleted
                  ? "bg-slate-950 border-emerald-500/80 text-emerald-300 shadow-md"
                  : isCurrent
                  ? "bg-slate-950 border-amber-400 text-white font-bold shadow-xl animate-pulse ring-2 ring-amber-400/40"
                  : "bg-slate-950/60 border-slate-800 text-slate-400"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
              ) : (
                <Clock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase tracking-widest font-mono text-slate-300 font-bold">
                  Step 0{step.stepNum}
                </p>
                <p className="text-xs font-display font-black truncate leading-tight">{step.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simultaneous Agent Execution Rail */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono">
        <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          Simultaneous AI Panellists:
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {AGENTS.map((ag) => (
            <span key={ag.id} className="flex items-center gap-1.5 text-slate-200 font-bold bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
              <span>{ag.avatar}</span>
              <span>{ag.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
