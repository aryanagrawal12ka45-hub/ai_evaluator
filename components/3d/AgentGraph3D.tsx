"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Scale, CheckCircle2, XSquare, HelpCircle } from "lucide-react";

interface Engagement {
  with_agent: string;
  with_agent_name?: string;
  their_point?: string;
  stance: string;
  reasoning?: string;
}

interface AgentGraph3DProps {
  debateOpinions?: any[];
  debateEntries?: any[];
}

const AGENT_NODES: Record<string, { name: string; avatar: string; color: string; role: string; x: number; y: number }> = {
  technical: { name: "Dr. Vance", avatar: "⚙️", color: "#3E7CB1", role: "Technical Architect", x: 130, y: 70 },
  hr: { name: "Elena Rostova", avatar: "💬", color: "#3E7CB1", role: "HR & Culture Lead", x: 130, y: 230 },
  hiring_manager: { name: "Marcus Sterling", avatar: "🎯", color: "#D4A537", role: "VP of Engineering", x: 470, y: 230 },
  skeptic: { name: "Cassandra", avatar: "🔍", color: "#C4432B", role: "Adversarial Auditor", x: 470, y: 70 },
};

function safeParseJSON<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    return fallback;
  }
}

export function AgentGraph3D({ debateOpinions = [], debateEntries = [] }: AgentGraph3DProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const entries = debateOpinions.length > 0 ? debateOpinions : debateEntries;

  const connections = useMemo(() => {
    const lines: {
      id: string;
      sourceId: string;
      targetId: string;
      sourceName: string;
      targetName: string;
      sourcePos: { x: number; y: number };
      targetPos: { x: number; y: number };
      stance: string;
      theirPoint?: string;
      reasoning?: string;
    }[] = [];

    entries.forEach((entry) => {
      const sourceNode = AGENT_NODES[entry.agentId];
      if (!sourceNode) return;

      const engagements: Engagement[] = safeParseJSON<Engagement[]>(entry.engagements, []);

      engagements.forEach((eng, idx) => {
        const targetNode = AGENT_NODES[eng.with_agent];
        if (!targetNode) return;

        lines.push({
          id: `${entry.agentId}-${eng.with_agent}-${idx}`,
          sourceId: entry.agentId,
          targetId: eng.with_agent,
          sourceName: sourceNode.name,
          targetName: targetNode.name || eng.with_agent_name || "Peer Agent",
          sourcePos: { x: sourceNode.x, y: sourceNode.y },
          targetPos: { x: targetNode.x, y: targetNode.y },
          stance: eng.stance || "agree",
          theirPoint: eng.their_point,
          reasoning: eng.reasoning,
        });
      });
    });

    return lines;
  }, [entries]);

  if (!isClient) {
    return (
      <div className="h-72 w-full bg-[#15181C] border border-white/10 rounded flex items-center justify-center text-white/50 font-mono text-xs">
        Loading Neural Debate Network...
      </div>
    );
  }

  return (
    <div className="precinct-card p-4 space-y-3">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-[#D4A537] font-mono text-xs font-medium uppercase tracking-wider">
          <Scale className="w-4 h-4 text-[#D4A537]" />
          <span>Cross-Examination Neural Debate Canvas</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-white/70 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3E7CB1]" /> Agree
          </span>
          <span className="flex items-center gap-1.5">
            <XSquare className="w-3.5 h-3.5 text-[#C4432B]" /> Disagree
          </span>
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#D4A537]" /> Revise
          </span>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="h-[280px] w-full rounded bg-[#15181C] border border-white/10 relative overflow-hidden flex items-center justify-center">
        {/* SVG Stance Connection Lines */}
        <svg className="w-full h-full absolute inset-0 z-0 pointer-events-none" viewBox="0 0 600 280">
          {connections.map((conn) => {
            const strokeColor =
              conn.stance === "agree"
                ? "#3E7CB1"
                : conn.stance === "disagree"
                ? "#C4432B"
                : "#D4A537";

            return (
              <g key={conn.id}>
                <line
                  x1={conn.sourcePos.x}
                  y1={conn.sourcePos.y}
                  x2={conn.targetPos.x}
                  y2={conn.targetPos.y}
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeDasharray={conn.stance === "revise" ? "5 5" : "none"}
                />
                {/* Mid-point Stance Marker */}
                <circle
                  cx={(conn.sourcePos.x + conn.targetPos.x) / 2}
                  cy={(conn.sourcePos.y + conn.targetPos.y) / 2}
                  r="5"
                  fill={strokeColor}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive Agent Nodes */}
        <div className="relative z-10 w-full h-full">
          {Object.entries(AGENT_NODES).map(([id, node]) => {
            const myOpinions = entries.filter((e) => e.agentId === id);
            const score = myOpinions[0]?.score ?? 7;

            return (
              <div
                key={id}
                style={{
                  position: "absolute",
                  left: `${(node.x / 600) * 85 + 2}%`,
                  top: `${(node.y / 280) * 70 + 5}%`,
                }}
                className="transform -translate-x-1/2 -translate-y-1/2"
              >
                <div
                  className="p-3 bg-[#232830] border-2 rounded shadow-lg flex items-center gap-2"
                  style={{ borderColor: node.color }}
                >
                  <span className="text-lg">{node.avatar}</span>
                  <div>
                    <p className="font-body font-medium text-xs text-[#E8E4D8] leading-tight">{node.name}</p>
                    <p className="font-mono text-[10px] text-white/50 leading-tight">{node.role}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#E8E4D8] bg-[#15181C] px-2 py-0.5 rounded border border-white/10">
                    {score}/10
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-2 left-3 text-[10px] font-mono text-white/50 pointer-events-none bg-[#15181C] px-2 py-0.5 rounded border border-white/10">
          Agent Cross-Examination Lines: Blue (Agree) • Red (Disagree) • Brass (Revise)
        </div>
      </div>
    </div>
  );
}
