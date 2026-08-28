"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Sparkles, X, Terminal, Bot, User, RefreshCw, Shield, HelpCircle } from "lucide-react";
import { JudgeModeModal } from "@/components/JudgeModeModal";

interface InterrogatePanelChatProps {
  candidate: {
    id: string;
    name: string;
    roleAppliedFor: string;
    verdict?: any;
    opinions?: any[];
  };
  judgeMode?: boolean;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  rawPrompt?: string;
  rawResponse?: string;
}

export const InterrogatePanelChat: React.FC<InterrogatePanelChatProps> = ({
  candidate,
  judgeMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Reset chat context when switching candidates
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [candidate.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate candidate-specific suggested questions dynamically
  const isRohan = candidate.name.toLowerCase().includes("rohan");
  const isAnanya = candidate.name.toLowerCase().includes("ananya");

  const suggestedQuestions = isRohan
    ? [
        "Why should I trust the ownership claim on this resume?",
        "Why did Cassandra flag the sole architect claim?",
        "What did the Hiring Manager and Skeptic disagree about?",
        "Does this candidate have a criminal record?",
      ]
    : isAnanya
    ? [
        "What was Ananya's production prompt outage ownership?",
        "Why did Dr. Aris Vance revise his score post-debate?",
        "How confident is the panel really?",
        "What's her salary expectation?",
      ]
    : [
        `What are ${candidate.name}'s verified strengths?`,
        `What concerns were raised during debate?`,
        `What would change the final verdict?`,
        `Does this candidate have a criminal record?`,
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
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`/api/candidates/${candidate.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to complete interrogation");
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
      console.error("Chat error:", err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Interrogation Error: ${(err as Error).message}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#232830] text-[#E8E4D8] border-2 border-[#D4A537] p-3.5 rounded shadow-2xl flex items-center gap-2 hover:bg-[#2D343F] transition-all font-mono text-xs font-bold uppercase"
        >
          <MessageSquare className="w-5 h-5 text-[#D4A537]" />
          <span>Cross-Examine Panel</span>
        </button>
      )}

      {/* Slide-out Panel Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#15181C] border-l-2 border-l-white/20 shadow-2xl flex flex-col justify-between text-[#E8E4D8]">
          {/* Header */}
          <div className="p-4 bg-[#232830] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D4A537]" />
              <div>
                <h4 className="font-display font-bold text-sm text-[#E8E4D8] uppercase tracking-wide">
                  Cross-Examine — {candidate.name}
                </h4>
                <p className="font-mono text-[10px] text-white/60">Grounded strictly in persisted case file</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Scroll Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Empty State with Dynamic Suggested Questions */}
            {messages.length === 0 && (
              <div className="space-y-4 pt-2">
                <div className="bg-[#232830] p-4 rounded border border-white/10 space-y-2 text-xs">
                  <span className="font-mono font-bold text-[#D4A537] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4A537]" /> Panel Cross-Examination Guidance
                  </span>
                  <p className="font-body text-white/80 leading-relaxed">
                    Ask follow-up questions regarding {candidate.name}'s testimonies, debate cross-examination, or cited quotes. Answers are strictly grounded in persisted evidence.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-white/60 uppercase block">
                    Suggested Questions for {candidate.name}:
                  </span>
                  {suggestedQuestions.map((q, idx) => (
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
                  /* User Typed Interview Question Style */
                  <div className="bg-[#15181C] border-l-4 border-l-[#D4A537] p-3 rounded text-xs font-mono text-[#E8E4D8] space-y-1">
                    <span className="text-[10px] text-[#D4A537] uppercase font-bold block flex items-center gap-1">
                      <User className="w-3 h-3 text-[#D4A537]" /> Interrogator Question:
                    </span>
                    <p className="font-body text-sm text-[#E8E4D8]">{msg.content}</p>
                  </div>
                ) : (
                  /* Panel Testimony Card Style */
                  <div className="precinct-card p-4 space-y-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-[10px] font-mono text-[#3E7CB1] uppercase font-bold flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-[#3E7CB1]" /> Panel Evidence Response
                      </span>

                      {judgeMode && msg.rawPrompt && (
                        <button
                          onClick={() =>
                            setModalState({
                              isOpen: true,
                              title: "Panel Interrogation Model Call",
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
                <span>Searching persisted candidate evidence...</span>
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
                placeholder={`Ask about ${candidate.name}'s evaluation...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 bg-[#15181C] border border-white/20 rounded px-3 py-2.5 text-xs text-[#E8E4D8] font-body focus:border-[#D4A537] outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="precinct-btn-primary p-2.5 rounded disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[10px] font-mono text-white/50 text-center">
              Grounded strictly in persisted evaluation data. Rejects snap verdict overrides.
            </p>
          </div>
        </div>
      )}

      {/* Judge Mode Modal for Interrogation Call */}
      <JudgeModeModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        stepName="interrogatePanel"
        rawPrompt={modalState.rawPrompt}
        rawResponse={modalState.rawResponse}
      />
    </>
  );
};
