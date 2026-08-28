import React from "react";
import { ShieldCheck, AlertOctagon, CheckCircle2, Info } from "lucide-react";

interface FlaggedBiasItem {
  agentId: string;
  proxyIssue: string;
  explanation: string;
}

interface FairnessCardProps {
  passed: boolean;
  summary: string;
  flaggedBias?: FlaggedBiasItem[];
  auditRecommendations?: string[];
  onInspectRaw?: () => void;
}

export const FairnessCard: React.FC<FairnessCardProps> = ({
  passed,
  summary,
  flaggedBias = [],
  auditRecommendations = [],
  onInspectRaw,
}) => {
  return (
    <div className={`precinct-card p-6 rounded-md space-y-4 ${
      passed ? "border-l-4 border-l-[#3E7CB1]" : "border-l-4 border-l-[#C4432B]"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${passed ? "bg-[#3E7CB1]/20 text-[#3E7CB1]" : "bg-[#C4432B]/20 text-[#C4432B]"}`}>
            {passed ? <ShieldCheck className="w-5 h-5 text-[#3E7CB1]" /> : <AlertOctagon className="w-5 h-5 text-[#C4432B]" />}
          </div>

          <div>
            <span className="text-[10px] font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
              PART 13 — 5th Non-Scoring AI Call
            </span>
            <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase">
              AI Fairness & Bias Audit Safeguard
            </h3>
          </div>
        </div>

        {onInspectRaw && (
          <button
            onClick={onInspectRaw}
            className="precinct-btn text-xs px-3 py-1.5"
          >
            Inspect LLM Prompt →
          </button>
        )}
      </div>

      <p className="font-body text-sm text-[#E8E4D8] leading-relaxed bg-[#15181C] p-4 rounded border border-white/10">
        {summary}
      </p>

      {flaggedBias.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#C4432B] uppercase tracking-wider block flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#C4432B]" /> Detected Proxy Bias Concerns
          </span>
          <div className="space-y-2">
            {flaggedBias.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#15181C] border border-[#C4432B]/40 rounded text-xs font-mono text-[#E8E4D8]">
                <strong className="text-[#C4432B] uppercase mr-2">[{item.agentId}]:</strong> {item.proxyIssue} — {item.explanation}
              </div>
            ))}
          </div>
        </div>
      )}

      {auditRecommendations.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-xs font-mono font-bold text-[#3E7CB1] uppercase tracking-wider block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#3E7CB1]" /> Audit Recommendations for Panel
          </span>
          <ul className="space-y-1 text-xs font-body text-[#E8E4D8]">
            {auditRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[#3E7CB1] font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
