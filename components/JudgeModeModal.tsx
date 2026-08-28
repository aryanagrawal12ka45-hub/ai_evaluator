import React, { useState } from "react";
import { Terminal, X, Code, Copy, Check, Clock, Cpu } from "lucide-react";

interface JudgeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  stepName: string;
  modelEngine?: string;
  provider?: string;
  rawPrompt?: string | null;
  rawResponse?: string | null;
}

export const JudgeModeModal: React.FC<JudgeModeModalProps> = ({
  isOpen,
  onClose,
  title,
  stepName,
  modelEngine = "claude-3-5-sonnet",
  provider = "Anthropic",
  rawPrompt,
  rawResponse,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  if (!isOpen) return null;

  const copyText = (text: string, type: "prompt" | "response") => {
    navigator.clipboard.writeText(text);
    if (type === "prompt") {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } else {
      setCopiedResponse(true);
      setTimeout(() => setCopiedResponse(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#15181C]/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#232830] border-2 border-[#D4A537] rounded w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl text-[#E8E4D8]">
        {/* Modal Header */}
        <div className="p-5 bg-[#15181C] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4A537]/20 text-[#D4A537] rounded border border-[#D4A537]/40">
              <Terminal className="w-5 h-5 text-[#D4A537]" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-[#D4A537] uppercase tracking-widest block">
                PART 12 — JUDGE MODE AUDIT TRAIL
              </span>
              <h3 className="text-lg font-display font-bold text-[#E8E4D8] uppercase">{title}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded bg-[#232830] hover:bg-[#2D343F] text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sub-Header Metadata */}
        <div className="bg-[#15181C] p-3 px-5 border-b border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-white/80 gap-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#3E7CB1]" />
            <span>AI Provider & Engine: <strong className="text-[#D4A537]">{provider} ({modelEngine})</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4A537]" />
            <span>Server Call Step: <strong className="text-[#E8E4D8]">{stepName}</strong></span>
          </div>
        </div>

        {/* Modal Body: Side-by-Side Prompt vs Response */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
          {/* Raw Prompt Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#D4A537] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-[#D4A537]" /> Exact System & User Prompt Sent to LLM
              </span>
              <button
                onClick={() => copyText(rawPrompt || "", "prompt")}
                className="flex items-center gap-1 text-[11px] bg-[#15181C] hover:bg-[#2D343F] text-[#E8E4D8] px-2.5 py-1 rounded border border-white/10 transition-colors"
              >
                {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#3E7CB1]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedPrompt ? "Copied Prompt!" : "Copy Prompt"}
              </button>
            </div>

            <pre className="p-4 bg-[#15181C] border border-white/10 rounded text-[#E8E4D8] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {rawPrompt || "// No raw prompt log captured for this call."}
            </pre>
          </div>

          {/* Raw Response JSON Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#3E7CB1] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-4 h-4 text-[#3E7CB1]" /> Unedited Raw Model Response JSON Received
              </span>
              <button
                onClick={() => copyText(rawResponse || "", "response")}
                className="flex items-center gap-1 text-[11px] bg-[#15181C] hover:bg-[#2D343F] text-[#E8E4D8] px-2.5 py-1 rounded border border-white/10 transition-colors"
              >
                {copiedResponse ? <Check className="w-3.5 h-3.5 text-[#3E7CB1]" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedResponse ? "Copied Response!" : "Copy Response JSON"}
              </button>
            </div>

            <pre className="p-4 bg-[#15181C] border border-white/10 rounded text-[#3E7CB1] whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {rawResponse || "// No raw response log captured for this call."}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#15181C] border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="precinct-btn-primary px-5 py-2 text-xs"
          >
            Close Audit Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
