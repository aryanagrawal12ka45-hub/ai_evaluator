"use client";

import React, { useState, useEffect, useRef } from "react";
import { Brain, Sparkles, Send, X, Terminal, Bot, RefreshCw, Eye } from "lucide-react";
import { JudgeModeModal } from "@/components/JudgeModeModal";

interface ArchivistWidgetProps {
  currentCandidateId?: string;
  judgeMode?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  rawPrompt?: string;
  rawResponse?: string;
}

export const ArchivistWidget: React.FC<ArchivistWidgetProps> = ({
  currentCandidateId,
  judgeMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [proactiveInsight, setProactiveInsight] = useState<string | null>(null);
  const [archiveCount, setArchiveCount] = useState<number>(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modal State for Judge Mode Inspector
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    rawPrompt?: string;
    rawResponse?: string;
  }>({
    isOpen: false,
    title: "",
  });

  const fetchArchivistOverview = async () => {
    try {
      const res = await fetch("/api/archivist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Proactive session insight request",
          currentCandidateId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProactiveInsight(data.proactiveInsight);
        setArchiveCount(data.archiveCount || 0);
      }
    } catch (err) {
      console.error("Error fetching Archivist overview:", err);
    }
  };

  useEffect(() => {
    fetchArchivistOverview();
  }, [currentCandidateId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const suggestedSessionQuestions = [
    "Which candidates has the panel been toughest on?",
    "Am I seeing a pattern across who I've evaluated?",
    "Which agent tends to disagree with others most?",
    "Summarize all session evaluation trends.",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query || query.trim() === "" || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/archivist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          currentCandidateId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Archivist request failed");
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        rawPrompt: data.rawPrompt,
        rawResponse: data.rawResponse,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Archivist chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Archivist Error: ${(err as Error).message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger (Bottom-Left Corner) */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-expanded={false}
            aria-label={`Open The Archivist Session Memory Widget (${archiveCount} candidates)`}
            className="bg-[#232830] text-[#E8E4D8] border-2 border-[#D4A537] px-4 py-3 rounded shadow-2xl flex items-center gap-2.5 hover:bg-[#2D343F] focus-visible:ring-2 focus-visible:ring-[#D4A537] focus-visible:outline-none transition-all font-mono text-xs font-bold uppercase relative group"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A537] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A537]"></span>
            </span>

            <Brain className="w-4 h-4 text-[#D4A537]" />
            <span>The Archivist — Session Memory ({archiveCount})</span>
          </button>
        </div>
      )}

      {/* Slide-out / Floating Archivist Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="The Archivist Session Memory Drawer"
          className="fixed bottom-6 left-6 z-50 w-full sm:w-[480px] h-[580px] bg-[#15181C] border-2 border-[#D4A537] rounded-md shadow-2xl flex flex-col justify-between text-[#E8E4D8]"
        >
          {/* Header */}
          <div className="p-4 bg-[#232830] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A537] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4A537]"></span>
              </span>
              <div>
                <h4 className="font-display font-bold text-base text-[#D4A537] uppercase tracking-wide flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#D4A537]" /> The Archivist — Session Memory
                </h4>
                <p className="font-mono text-[10px] text-white/70">6th Meta-Agent • Cross-Candidate Pattern Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Archivist Drawer"
              className="text-white/70 hover:text-white p-1 rounded focus-visible:ring-2 focus-visible:ring-[#D4A537] focus-visible:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Proactive Observation Banner */}
          {proactiveInsight && (
            <div className="bg-[#232830] p-3 border-b border-white/10 text-xs font-mono text-[#D4A537] flex items-center gap-2">
              <Eye className="w-4 h-4 flex-shrink-0 text-[#D4A537]" />
              <p className="line-clamp-2 leading-tight">{proactiveInsight}</p>
            </div>
          )}

          {/* Chat Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4 pt-1">
                <div className="bg-[#232830] p-4 rounded border border-white/10 space-y-2 text-xs">
                  <span className="font-mono font-bold text-[#D4A537] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4A537]" /> Cross-Candidate Pattern Intelligence
                  </span>
                  <p className="font-body text-white/80 leading-relaxed">
                    The Archivist sits above individual evaluations to spot trends, score movements, and agent dissent across all candidate case files in this session.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-white/60 uppercase block">
                    Ask Session-Level Questions:
                  </span>
                  {suggestedSessionQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(q)}
                      className="w-full text-left bg-[#232830] hover:bg-[#2D343F] border border-white/10 hover:border-[#D4A537] p-3 rounded text-xs font-mono text-[#E8E4D8] transition-all flex items-center justify-between group"
                    >
                      <span>"{q}"</span>
                      <Send className="w-3.5 h-3.5 text-[#D4A537] opacity-60 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Chat Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === "user" ? (
                  <div className="bg-[#15181C] border-l-4 border-l-[#D4A537] p-3 rounded text-xs font-mono text-[#E8E4D8] space-y-1">
                    <span className="text-[10px] text-[#D4A537] uppercase font-bold block">
                      Session Interrogation Question:
                    </span>
                    <p className="font-body text-sm text-[#E8E4D8]">{msg.content}</p>
                  </div>
                ) : (
                  <div className="precinct-card p-4 space-y-2 border-l-4 border-l-[#D4A537]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-mono text-[#D4A537] uppercase font-bold flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-[#D4A537]" /> The Archivist Session Report
                      </span>

                      {judgeMode && msg.rawPrompt && (
                        <button
                          onClick={() =>
                            setModalState({
                              isOpen: true,
                              title: "Archivist Meta-Agent Model Call",
                              rawPrompt: msg.rawPrompt,
                              rawResponse: msg.rawResponse,
                            })
                          }
                          className="precinct-btn text-[10px] px-2 py-0.5"
                        >
                          Inspect LLM Prompt
                        </button>
                      )}
                    </div>

                    <div className="font-body text-xs text-[#E8E4D8] leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="precinct-card p-4 flex items-center gap-3 text-xs font-mono text-[#D4A537]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#D4A537]" />
                <span>Scanning session candidate archive memory...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-4 bg-[#232830] border-t border-white/10 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about cross-candidate patterns..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[#15181C] border border-white/20 rounded px-3 py-2.5 text-xs text-[#E8E4D8] font-body focus:border-[#D4A537] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="precinct-btn-primary p-2.5 rounded border-[#D4A537] bg-[#D4A537] text-[#15181C] font-bold disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] font-mono text-white/50 text-center">
              Session Memory Meta-Agent • Grounded strictly in candidate database
            </p>
          </div>
        </div>
      )}

      {/* Judge Mode Modal */}
      <JudgeModeModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        stepName="archivistMetaAgent"
        rawPrompt={modalState.rawPrompt}
        rawResponse={modalState.rawResponse}
      />
    </>
  );
};
