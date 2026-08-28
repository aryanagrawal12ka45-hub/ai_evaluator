"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, Square, Play, Pause, Radio } from "lucide-react";
import { AGENTS } from "@/lib/agents";

interface Engagement {
  with_agent: string;
  with_agent_name: string;
  their_point: string;
  stance: string;
  reasoning: string;
}

interface VoicePlayerProps {
  debateOpinions: any[];
  candidateName?: string;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({ debateOpinions, candidateName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const getVoiceSettings = (agentId: string) => {
    switch (agentId) {
      case "technical":
        return { pitch: 0.9, rate: 1.05 };
      case "hr":
        return { pitch: 1.2, rate: 0.95 };
      case "hiring_manager":
        return { pitch: 0.8, rate: 1.1 };
      case "skeptic":
        return { pitch: 0.7, rate: 0.9 };
      default:
        return { pitch: 1.0, rate: 1.0 };
    }
  };

  const handlePlay = () => {
    if (!synthRef.current) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    synthRef.current.cancel();

    const speechQueue: { text: string; agentId: string; agentName: string }[] = [];
    
    debateOpinions.forEach((dOp) => {
      const ag = AGENTS.find((a) => a.id === dOp.agentId);
      const engagements: Engagement[] = dOp.engagements ? (typeof dOp.engagements === "string" ? JSON.parse(dOp.engagements) : dOp.engagements) : [];
      const agentName = ag?.name || dOp.agentId;

      speechQueue.push({
        text: `Consultant ${agentName}. Summary: ${dOp.summary}`,
        agentId: dOp.agentId,
        agentName,
      });

      engagements.forEach((eng) => {
        speechQueue.push({
          text: `Regarding ${eng.with_agent_name}'s point: ${eng.their_point}. I ${eng.stance}. ${eng.reasoning}`,
          agentId: dOp.agentId,
          agentName,
        });
      });
    });

    if (speechQueue.length === 0) return;

    setIsPlaying(true);
    setIsPaused(false);

    let queueIndex = 0;

    const speakNext = () => {
      if (queueIndex >= speechQueue.length) {
        setIsPlaying(false);
        setActiveSpeaker(null);
        return;
      }

      const currentItem = speechQueue[queueIndex];
      setActiveSpeaker(currentItem.agentName);

      const utterance = new SpeechSynthesisUtterance(currentItem.text);
      const settings = getVoiceSettings(currentItem.agentId);
      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;

      const voices = synthRef.current?.getVoices() || [];
      if (voices.length > 0) {
        const agentIndex = AGENTS.findIndex((a) => a.id === currentItem.agentId);
        utterance.voice = voices[agentIndex % voices.length];
      }

      utterance.onend = () => {
        queueIndex++;
        speakNext();
      };

      utterance.onerror = () => {
        queueIndex++;
        speakNext();
      };

      synthRef.current?.speak(utterance);
    };

    speakNext();
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSpeaker(null);
    }
  };

  return (
    <div className="glass-panel p-5 rounded-2xl bg-slate-900 border-2 border-slate-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 relative">
          <Volume2 className="w-6 h-6 text-amber-400" />
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-display font-black text-sm uppercase tracking-wider text-white">
              Audio Cross-Examination Playback
            </h4>
            <span className="text-[10px] font-mono bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded border border-slate-800 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse text-amber-400" /> Web Speech Synthesis
            </span>
          </div>
          <p className="text-xs font-sans text-slate-300 mt-0.5">
            {activeSpeaker ? (
              <span className="text-amber-400 font-mono font-bold">Currently Speaking: {activeSpeaker}</span>
            ) : (
              "Synthesizes distinct speech pitch and rate per agent persona."
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isPlaying || isPaused ? (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all shadow-lg"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {isPaused ? "Resume Dialogue" : "Play Cross-Exam Audio"}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex items-center gap-2 bg-slate-800 text-amber-400 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-slate-700 transition-all"
          >
            <Pause className="w-4 h-4 fill-amber-400" />
            Pause
          </button>
        )}

        {isPlaying && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 bg-red-950 text-red-400 border border-red-500/50 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider hover:bg-red-900 transition-all"
          >
            <Square className="w-3.5 h-3.5 fill-red-400" />
            Stop
          </button>
        )}
      </div>
    </div>
  );
};
