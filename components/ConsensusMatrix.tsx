import React from "react";
import { AGENTS } from "@/lib/agents";
import { Scale, CheckCircle2, XSquare, HelpCircle, Cpu } from "lucide-react";

interface InitialOpinion {
  agentId: string;
  score: number;
  confidence: string;
  modelEngine?: string;
  provider?: string;
}

interface DebateOpinion {
  agentId: string;
  score: number;
  scoreDelta?: number | null;
  engagements?: string | null;
  modelEngine?: string;
  provider?: string;
}

interface ConsensusMatrixProps {
  initialOpinions: InitialOpinion[];
  debateOpinions: DebateOpinion[];
  unresolvedDisagreements?: string[];
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({
  initialOpinions,
  debateOpinions,
  unresolvedDisagreements = [],
}) => {
  return (
    <div className="precinct-card p-6 rounded-md space-y-6 text-[#E8E4D8]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
            PART 11 — Multi-Provider Panel Consensus Matrix
          </span>
          <h3 className="text-2xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#D4A537]" /> Quality of Debate & Multi-Model Score Movement
          </h3>
        </div>

        <span className="bg-[#15181C] text-[11px] font-mono font-medium px-3 py-1.5 rounded border border-white/10 text-[#D4A537] flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#D4A537]" /> Real Multi-Provider Parallel Dispatch
        </span>
      </div>

      {/* 4 Agent Score Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="bg-[#15181C] text-white/70 border-b border-white/10 uppercase tracking-wider">
              <th className="p-3 font-medium">Panel Member</th>
              <th className="p-3 font-medium">AI Provider & Model Engine</th>
              <th className="p-3 font-medium text-center">Step 2 Initial</th>
              <th className="p-3 font-medium text-center">Debate Delta</th>
              <th className="p-3 font-medium text-center">Step 3 Final</th>
              <th className="p-3 font-medium">Post-Debate Stance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {AGENTS.map((ag) => {
              const init = initialOpinions.find((o) => o.agentId === ag.id);
              const deb = debateOpinions.find((o) => o.agentId === ag.id);
              const initScore = init?.score ?? 0;
              const finalScore = deb?.score ?? initScore;
              const delta = deb?.scoreDelta ?? (finalScore - initScore);

              let deltaBadge = (
                <span className="text-white/50 font-mono bg-[#15181C] px-2 py-0.5 rounded border border-white/10">
                  0
                </span>
              );

              if (delta > 0) {
                deltaBadge = (
                  <span className="text-[#3E7CB1] font-mono font-bold bg-[#3E7CB1]/10 px-2 py-0.5 rounded border border-[#3E7CB1]/40">
                    +{delta} (Revised Upward)
                  </span>
                );
              } else if (delta < 0) {
                deltaBadge = (
                  <span className="text-[#C4432B] font-mono font-bold bg-[#C4432B]/10 px-2 py-0.5 rounded border border-[#C4432B]/40">
                    {delta} (Revised Downward)
                  </span>
                );
              }

              return (
                <tr key={ag.id} className="hover:bg-[#15181C]/50 transition-colors">
                  <td className="p-3 font-body font-medium text-[#E8E4D8]">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{ag.avatar}</span>
                      <div>
                        <p className="text-[#E8E4D8] text-sm font-medium">{ag.name}</p>
                        <p className="text-[11px] text-white/50 font-mono">{ag.roleTitle}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">
                    <span className="bg-[#232830] text-[#D4A537] border border-[#D4A537]/40 px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[#D4A537]" /> {ag.provider} · {ag.modelTag}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm font-mono font-bold text-white/80">{initScore}/10</td>
                  <td className="p-3 text-center">{deltaBadge}</td>
                  <td className="p-3 text-center text-base font-mono font-bold text-[#E8E4D8]">{finalScore}/10</td>
                  <td className="p-3 font-mono text-xs font-medium">
                    {finalScore >= 7 ? (
                      <span className="text-[#3E7CB1] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-[#3E7CB1]" /> Recommend Hire
                      </span>
                    ) : finalScore >= 5 ? (
                      <span className="text-[#D4A537] font-bold flex items-center gap-1">
                        <HelpCircle className="w-4 h-4 text-[#D4A537]" /> Lean Hire / Caution
                      </span>
                    ) : (
                      <span className="text-[#C4432B] font-bold flex items-center gap-1">
                        <XSquare className="w-4 h-4 text-[#C4432B]" /> Recommend Not Hire
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Disagreement List */}
      <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
        <span className="text-xs font-mono font-bold text-[#D4A537] uppercase tracking-wider block">
          Where the Multi-Provider Panel Disagreed (Auto-Generated Tensions)
        </span>

        {unresolvedDisagreements.length > 0 ? (
          <div className="space-y-2">
            {unresolvedDisagreements.map((dis, idx) => (
              <div key={idx} className="p-3 bg-[#232830] rounded border border-white/10 text-xs font-body text-[#E8E4D8]">
                <span className="text-[#D4A537] font-mono font-bold mr-2">Dispute #{idx + 1}:</span>
                {dis}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-white/60">
            No unresolved disputes remain. Post-debate cross-examination produced multi-provider consensus.
          </p>
        )}
      </div>
    </div>
  );
};
