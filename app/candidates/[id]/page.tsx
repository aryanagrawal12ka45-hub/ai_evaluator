"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { ProgressRail } from "@/components/ProgressRail";
import { StampBadge3DLazy } from "@/components/3d/Lazy3DComponents";
import { VoicePlayer } from "@/components/VoicePlayer";
import { ConsensusMatrix } from "@/components/ConsensusMatrix";
import { FairnessCard } from "@/components/FairnessCard";
import { JudgeModeModal } from "@/components/JudgeModeModal";
import { InterrogatePanelChat } from "@/components/InterrogatePanelChat";
import { AGENTS } from "@/lib/agents";
import {
  ShieldCheck,
  FileText,
  MessageSquare,
  Scale,
  Award,
  RefreshCw,
  Printer,
  Terminal,
  Cpu,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XSquare,
  BookOpen,
  Eye,
} from "lucide-react";

const AgentGraph3D = dynamic(
  () => import("@/components/3d/AgentGraph3D").then((mod) => mod.AgentGraph3D),
  { ssr: false }
);

interface CandidateData {
  id: string;
  name: string;
  roleAppliedFor: string;
  jobDescription: string;
  resumeText: string;
  transcriptText: string;
  modelEngine: string;
  status: string;
  errorMessage?: string | null;
  totalLatencyMs?: number;
  totalTokensUsed?: number;
  totalModelCalls?: number;
  profile?: any;
  opinions: any[];
  verdict?: any;
  fairnessAudit?: any;
}

function safeParseJSON<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== "string") return val as T;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    return fallback;
  }
}

export default function CandidateDetailPage() {
  const params = useParams();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dossier" | "testimony" | "debate" | "verdict">("verdict");
  const [judgeMode, setJudgeMode] = useState(false);
  const [highlightQuote, setHighlightQuote] = useState<string | null>(null);
  const [sourceDocTab, setSourceDocTab] = useState<"jd" | "resume" | "transcript">("transcript");

  // Modal State for Judge Mode Audit Inspector
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    stepName: string;
    modelEngine?: string;
    provider?: string;
    rawPrompt?: string | null;
    rawResponse?: string | null;
  }>({
    isOpen: false,
    title: "",
    stepName: "",
  });

  const fetchCandidate = async () => {
    try {
      const res = await fetch(`/api/candidates/${candidateId}`);
      if (!res.ok) throw new Error("Failed to load candidate record");
      const data = await res.json();
      setCandidate(data);
      setError(null);

      if (data.status === "pending" && !evaluating) {
        evaluateCandidate();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const evaluateCandidate = async () => {
    try {
      setEvaluating(true);
      setError(null);
      const res = await fetch(`/api/candidates/${candidateId}/evaluate`, {
        method: "POST",
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Evaluation pipeline failed");
      }
      await fetchCandidate();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  useEffect(() => {
    if (!candidate || candidate.status === "done" || candidate.status === "failed") return;

    const interval = setInterval(() => {
      fetchCandidate();
    }, 1500);

    return () => clearInterval(interval);
  }, [candidate?.status, candidateId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-[#E8E4D8]">
        <RefreshCw className="w-10 h-10 text-[#D4A537] animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#D4A537]">
          Retrieving Multi-Provider Confidential Case File...
        </p>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="precinct-card p-8 border-l-4 border-l-[#C4432B] max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-display font-bold text-[#C4432B]">Pipeline Evaluation Error</h2>
        <p className="font-body text-sm text-[#E8E4D8]">{error || candidate?.errorMessage || "Candidate record not found."}</p>
        <button onClick={evaluateCandidate} className="precinct-btn text-xs px-4 py-2 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-[#D4A537]" /> Retry Multi-Agent Evaluation Pipeline
        </button>
      </div>
    );
  }

  const opinions = candidate.opinions || [];
  const initialOps = opinions.filter((o) => o.phase === "initial");
  const debateOps = opinions.filter((o) => o.phase === "debate");
  const profile = candidate.profile;
  const verdict = candidate.verdict;
  const fairness = candidate.fairnessAudit;

  const notableClaims = safeParseJSON<any[]>(profile?.notableClaims, []);
  const flaggedDiscrepancies = safeParseJSON<any[]>(profile?.flaggedDiscrepancies, []);
  const verdictStrengths = safeParseJSON<string[]>(verdict?.strengths, []);
  const verdictConcerns = safeParseJSON<string[]>(verdict?.concerns, []);
  const insufficientEvidence = safeParseJSON<string[]>(verdict?.insufficientEvidence, []);
  const unresolvedDisagreements = safeParseJSON<string[]>(verdict?.unresolvedDisagreements, []);

  const handleQuoteClick = (quote: string, source: "resume" | "transcript" | "jd") => {
    setHighlightQuote(quote);
    setSourceDocTab(source === "resume" ? "resume" : source === "jd" ? "jd" : "transcript");
  };

  const openAuditModal = (
    title: string,
    stepName: string,
    prompt?: string | null,
    resp?: string | null,
    engine?: string,
    provider?: string
  ) => {
    setModalState({
      isOpen: true,
      title,
      stepName,
      modelEngine: engine || "claude-3-5-sonnet",
      provider: provider || "Anthropic",
      rawPrompt: prompt,
      rawResponse: resp,
    });
  };

  return (
    <div className="space-y-8 text-[#E8E4D8] max-w-7xl mx-auto py-2">
      {/* Case Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#D4A537]">
            <Link href="/" className="hover:underline">Case Archive</Link>
            <span>/</span>
            <span className="text-[#E8E4D8]">Docket #{candidate.id.slice(-6).toUpperCase()}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-[#E8E4D8] tracking-tight uppercase">
            {candidate.name}
          </h2>
          <p className="text-base font-body text-white/70 flex items-center gap-2 flex-wrap">
            <span>Target Position: <strong className="text-[#E8E4D8] font-mono">{candidate.roleAppliedFor}</strong></span>
            <span className="bg-[#232830] text-[#D4A537] border border-[#D4A537]/40 text-xs font-mono px-2.5 py-0.5 rounded font-bold flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#D4A537]" /> Multi-Provider Real Independence (Claude, Gemini, GPT)
            </span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setJudgeMode(!judgeMode)}
            className={`precinct-btn text-xs px-4 py-2.5 flex items-center gap-2 ${
              judgeMode ? "bg-[#D4A537] text-[#15181C] font-bold border-[#D4A537]" : ""
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Judge Mode / Audit Trail: {judgeMode ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="precinct-btn text-xs px-4 py-2.5 flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#D4A537]" />
            <span>Generate Case PDF</span>
          </button>
        </div>
      </div>

      {/* Progress Rail */}
      <ProgressRail status={candidate.status} errorMessage={candidate.errorMessage} />

      {/* PART 11: Panel Consensus Matrix */}
      {initialOps.length > 0 && (
        <ConsensusMatrix
          initialOpinions={initialOps}
          debateOpinions={debateOps}
          unresolvedDisagreements={unresolvedDisagreements}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tab Bar */}
          <div className="flex bg-[#15181C] p-1 rounded border border-white/10 gap-1 overflow-x-auto">
            {[
              { id: "verdict", label: "Chief Verdict (Arbitration)", icon: Award },
              { id: "dossier", label: "Dossier Profile", icon: FileText },
              { id: "testimony", label: "Multi-Provider Testimony", icon: MessageSquare },
              { id: "debate", label: "3D Cross-Exam Debate", icon: Scale },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 text-xs font-mono font-medium uppercase px-4 py-2.5 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-[#232830] text-[#E8E4D8] border-b-2 border-b-[#D4A537]"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Chief Verdict & Multi-Provider Arbitration */}
          {activeTab === "verdict" && verdict && (
            <div className="space-y-6">
              <div className={`precinct-card p-6 md:p-8 space-y-6 ${
                verdict.recommendation.toLowerCase().includes("no hire") || verdict.recommendation.toLowerCase().includes("not hire")
                  ? "border-l-4 border-l-[#C4432B]"
                  : "border-l-4 border-l-[#3E7CB1]"
              }`}>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-5">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-[#D4A537] uppercase tracking-widest block font-medium flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#D4A537]" /> Multi-Provider Arbitration Decree (Claude 3.5 Sonnet)
                    </span>
                    <h3 className="text-3xl md:text-4xl font-display font-bold text-[#E8E4D8] uppercase">
                      Recommendation: {verdict.recommendation}
                    </h3>
                    <p className="text-xs font-mono text-white/70">
                      Decisive Agent Evidence: <strong className="text-[#D4A537]">{verdict.decisiveAgentId?.toUpperCase()}</strong>
                    </p>
                  </div>

                  <div>
                    <StampBadge3DLazy recommendation={verdict.recommendation} size="lg" animate={true} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#D4A537]">
                      Court Decree & Multi-Model Arbitration Rationale
                    </h4>
                    {judgeMode && (
                      <button
                        onClick={() => openAuditModal("Step 4: Chief Magistrate Arbitration", "getFinalDecision", verdict.rawPrompt, verdict.rawResponse, "claude-3-5-sonnet", "Anthropic")}
                        className="precinct-btn text-[10px] px-2 py-0.5"
                      >
                        Inspect LLM Call
                      </button>
                    )}
                  </div>

                  <div className="bg-[#15181C] p-5 rounded border border-white/10">
                    <p className="font-body text-base text-[#E8E4D8] leading-relaxed">
                      {verdict.reasoning}
                    </p>
                  </div>
                </div>

                {/* Strengths & Concerns Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#15181C] p-4 rounded border-l-4 border-l-[#3E7CB1] border-white/10 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#3E7CB1] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#3E7CB1]" /> Verified Strengths
                    </span>
                    <ul className="space-y-1.5 text-xs font-body text-[#E8E4D8]">
                      {verdictStrengths.map((str: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#3E7CB1] font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#15181C] p-4 rounded border-l-4 border-l-[#C4432B] border-white/10 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#C4432B] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#C4432B]" /> Risk Concerns
                    </span>
                    <ul className="space-y-1.5 text-xs font-body text-[#E8E4D8]">
                      {verdictConcerns.map((con: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#C4432B] font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Redacted Insufficient Evidence */}
                {insufficientEvidence.length > 0 && (
                  <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2">
                    <span className="text-xs font-mono font-bold text-[#D4A537] uppercase tracking-wider block flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-[#D4A537]" /> Insufficient Evidence (Hover Redaction Bar to Reveal)
                    </span>
                    <div className="space-y-2 font-mono text-xs">
                      {insufficientEvidence.map((ie: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[#D4A537] font-bold">[UNPROVEN #{idx + 1}]:</span>
                          <span className="redaction-bar inline-block">{ie}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fairness Card */}
              {fairness && (
                <FairnessCard
                  passed={fairness.passed}
                  summary={fairness.summary}
                  flaggedBias={safeParseJSON<any[]>(fairness.flaggedBias, [])}
                  auditRecommendations={safeParseJSON<string[]>(fairness.auditRecommendations, [])}
                  onInspectRaw={judgeMode ? () => openAuditModal("Step 5: Multi-Provider Fairness Audit", "getFairnessAudit", fairness.rawPrompt, fairness.rawResponse, "claude-3-5-sonnet", "Anthropic") : undefined}
                />
              )}
            </div>
          )}

          {/* TAB 2: Dossier Profile */}
          {activeTab === "dossier" && profile && (
            <div className="precinct-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
                    Court Reporter Extract
                  </span>
                  <h3 className="text-3xl font-display font-bold text-[#E8E4D8] uppercase">Factual Candidate Dossier</h3>
                </div>

                {judgeMode && (
                  <button
                    onClick={() => openAuditModal("Step 1: Candidate Profile Extract", "buildProfile", profile.rawPrompt, profile.rawResponse, "claude-3-5-sonnet", "Anthropic")}
                    className="precinct-btn text-xs px-3 py-1"
                  >
                    Inspect LLM Call
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="bg-[#15181C] p-3 rounded border border-white/10">
                  <span className="text-white/50 block text-[10px]">Years Experience</span>
                  <span className="text-sm font-bold text-[#E8E4D8]">{profile.yearsExperience} Years</span>
                </div>
                <div className="bg-[#15181C] p-3 rounded border border-white/10">
                  <span className="text-white/50 block text-[10px]">Education</span>
                  <span className="text-xs font-bold text-[#E8E4D8] truncate block">{profile.education}</span>
                </div>
                <div className="bg-[#15181C] p-3 rounded border border-white/10 col-span-2 md:col-span-1">
                  <span className="text-white/50 block text-[10px]">Skills Extracted</span>
                  <span className="text-xs font-bold text-[#3E7CB1]">
                    {safeParseJSON<string[]>(profile.topSkills, []).slice(0, 3).join(", ")}
                  </span>
                </div>
              </div>

              {/* Flagged Discrepancies */}
              {flaggedDiscrepancies.length > 0 && (
                <div className="bg-[#15181C] border-l-4 border-l-[#C4432B] p-5 rounded space-y-3">
                  <span className="text-xs font-mono font-bold text-[#C4432B] uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-[#C4432B]" /> Flagged Discrepancies (Resume vs Transcript)
                  </span>
                  {flaggedDiscrepancies.map((disc: any, idx: number) => (
                    <div key={idx} className="bg-[#232830] p-4 rounded border border-white/10 space-y-2 text-xs font-mono">
                      <p className="font-bold text-[#D4A537] uppercase">Topic: {disc.topic}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-[#15181C] p-3 rounded border border-white/10">
                          <span className="text-[10px] text-white/50 block font-bold">Resume Claim Quote:</span>
                          <p
                            onClick={() => handleQuoteClick(disc.resumeQuote, "resume")}
                            className="text-[#E8E4D8] cursor-pointer hover:text-[#D4A537] transition-colors"
                          >
                            "{disc.resumeQuote}"
                          </p>
                        </div>
                        <div className="bg-[#15181C] p-3 rounded border border-white/10">
                          <span className="text-[10px] text-white/50 block font-bold">Transcript Walk-Back Quote:</span>
                          <p
                            onClick={() => handleQuoteClick(disc.transcriptQuote, "transcript")}
                            className="text-[#C4432B] font-bold cursor-pointer hover:underline transition-colors"
                          >
                            "{disc.transcriptQuote}"
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Notable Claims with Quote Citations */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-[#D4A537] uppercase tracking-wider block">
                  Notable Claims & Verbatim Citations
                </span>
                <div className="space-y-2">
                  {notableClaims.map((item: any, idx: number) => (
                    <div key={idx} className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1 text-xs">
                      <p className="font-body text-[#E8E4D8] text-sm">{item.claim}</p>
                      <button
                        onClick={() => handleQuoteClick(item.quote, item.source)}
                        className="text-[#3E7CB1] font-mono italic hover:underline text-left block"
                      >
                        "{item.quote}" ({item.source?.toUpperCase()})
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 4 Agent Testimonies (Multi-Provider Tagged) */}
          {activeTab === "testimony" && (
            <div className="space-y-6">
              {AGENTS.map((ag) => {
                const opinion = initialOps.find((o) => o.agentId === ag.id);
                if (!opinion) return null;
                const strengths = safeParseJSON<any[]>(opinion.strengths, []);
                const concerns = safeParseJSON<any[]>(opinion.concerns, []);
                const isConcern = concerns.length > 0 || opinion.score < 6;

                return (
                  <div key={ag.id} className={`precinct-card p-6 space-y-4 ${
                    isConcern ? "border-l-4 border-l-[#C4432B]" : "border-l-4 border-l-[#3E7CB1]"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ag.avatar}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-display font-bold text-[#E8E4D8]">{ag.name}</h4>
                            <span className="bg-[#15181C] text-[#D4A537] border border-[#D4A537]/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-[#D4A537]" /> {ag.provider} · {ag.modelTag}
                            </span>
                          </div>
                          <p className="text-xs font-mono text-white/50">{ag.roleTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-mono font-bold text-[#E8E4D8] bg-[#15181C] px-3 py-1 rounded border border-white/10">
                          {opinion.score}/10
                        </span>
                        {judgeMode && (
                          <button
                            onClick={() => openAuditModal(`Step 2: ${ag.name} Testimony`, `getIndependentOpinion(${ag.id})`, opinion.rawPrompt, opinion.rawResponse, ag.modelEngine, ag.provider)}
                            className="precinct-btn text-[10px] px-2 py-0.5"
                          >
                            Inspect LLM Call
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="font-body text-base text-[#E8E4D8] leading-relaxed bg-[#15181C] p-4 rounded border border-white/10">
                      {opinion.summary}
                    </p>

                    {strengths.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono font-bold text-[#3E7CB1] uppercase tracking-wider block">
                          Cited Strengths
                        </span>
                        {strengths.map((s: any, idx: number) => (
                          <div key={idx} className="bg-[#15181C] p-3 rounded border border-white/10 text-xs">
                            <p className="font-body text-[#E8E4D8]">{s.point}</p>
                            <button
                              onClick={() => handleQuoteClick(s.quote, s.source)}
                              className="text-[#3E7CB1] font-mono italic hover:underline text-left mt-0.5 block"
                            >
                              "{s.quote}"
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {concerns.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-mono font-bold text-[#C4432B] uppercase tracking-wider block">
                          Cited Concerns
                        </span>
                        {concerns.map((c: any, idx: number) => (
                          <div key={idx} className="bg-[#15181C] p-3 rounded border border-white/10 text-xs">
                            <p className="font-body text-[#E8E4D8]">{c.point}</p>
                            <button
                              onClick={() => handleQuoteClick(c.quote, c.source)}
                              className="text-[#C4432B] font-mono italic hover:underline text-left mt-0.5 block"
                            >
                              "{c.quote}"
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: 3D Debate Network */}
          {activeTab === "debate" && (
            <div className="space-y-6">
              <VoicePlayer debateOpinions={debateOps} candidateName={candidate.name} />

              <AgentGraph3D debateOpinions={debateOps} />

              <div className="space-y-4">
                {debateOps.map((dOp) => {
                  const engagements = safeParseJSON<any[]>(dOp.engagements, []);
                  const ag = AGENTS.find((a) => a.id === dOp.agentId);

                  return (
                    <div key={dOp.agentId} className="precinct-card p-6 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{ag?.avatar}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-lg text-[#E8E4D8]">{ag?.name}</h4>
                              <span className="bg-[#15181C] text-[#D4A537] border border-[#D4A537]/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                                {ag?.provider} · {ag?.modelTag}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#E8E4D8] bg-[#15181C] px-2.5 py-1 rounded border border-white/10">
                          Updated Score: {dOp.score}/10
                        </span>
                      </div>

                      {engagements.map((eng: any, idx: number) => (
                        <div key={idx} className="bg-[#15181C] p-4 rounded border border-white/10 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <span className="text-white/70">Engagement: <strong>{ag?.name} → {eng.with_agent_name}</strong></span>
                            <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                              eng.stance === "agree" ? "bg-[#3E7CB1]/20 text-[#3E7CB1] border border-[#3E7CB1]/40" :
                              eng.stance === "disagree" ? "bg-[#C4432B]/20 text-[#C4432B] border border-[#C4432B]/40" :
                              "bg-[#D4A537]/20 text-[#D4A537] border border-[#D4A537]/40"
                            }`}>
                              Stance: {eng.stance}
                            </span>
                          </div>
                          <p className="text-white/80 italic font-body text-xs">"{eng.their_point}"</p>
                          <p className="text-[#E8E4D8] font-body text-sm leading-relaxed">{eng.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Evidence Source Viewer Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="precinct-card p-6 space-y-4 sticky top-20 source-document-paper">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4A537]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8E4D8]">
                  PART 8 — Source Evidence Document
                </h3>
              </div>

              {highlightQuote && (
                <button
                  onClick={() => setHighlightQuote(null)}
                  className="text-[10px] font-mono text-white/50 hover:text-white underline"
                >
                  Clear Quote Highlight
                </button>
              )}
            </div>

            <div className="flex bg-[#15181C] p-1 rounded border border-white/10 text-xs font-mono">
              {[
                { id: "transcript", label: "Transcript" },
                { id: "resume", label: "Resume" },
                { id: "jd", label: "Job Description" },
              ].map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSourceDocTab(doc.id as any)}
                  className={`flex-1 py-1.5 rounded transition-colors uppercase ${
                    sourceDocTab === doc.id
                      ? "bg-[#232830] text-[#E8E4D8] font-bold border-b-2 border-b-[#D4A537]"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  {doc.label}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#15181C] border border-white/10 rounded font-body text-sm text-[#E8E4D8] max-h-[550px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {sourceDocTab === "transcript" && (
                <p>
                  {highlightQuote ? (
                    candidate.transcriptText.split(highlightQuote).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <mark className="bg-[#D4A537] text-[#15181C] px-1 font-bold rounded">
                            {highlightQuote}
                          </mark>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    candidate.transcriptText
                  )}
                </p>
              )}

              {sourceDocTab === "resume" && (
                <p>
                  {highlightQuote ? (
                    candidate.resumeText.split(highlightQuote).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <mark className="bg-[#D4A537] text-[#15181C] px-1 font-bold rounded">
                            {highlightQuote}
                          </mark>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    candidate.resumeText
                  )}
                </p>
              )}

              {sourceDocTab === "jd" && (
                <p>{candidate.jobDescription}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PART 16: Multi-Provider Cost & Latency Transparency Footer */}
      <div className="precinct-card p-6 space-y-4 text-xs font-mono text-[#E8E4D8]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2 text-[#D4A537] font-bold uppercase">
            <Zap className="w-4 h-4 text-[#D4A537]" />
            <span>PART 16 — Per-Provider Cost & Latency Breakdown</span>
          </div>

          <span className="text-white/60">
            Total Pipeline Latency: <strong className="text-[#3E7CB1]">{(candidate.totalLatencyMs || 4200) / 1000}s</strong> (Parallel Dispatch)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#15181C] p-3 rounded border border-white/10 space-y-1">
            <span className="text-[#D4A537] font-bold uppercase block text-[11px]">Anthropic (Claude 3.5)</span>
            <p className="text-[#E8E4D8]">3 Model Calls (Profile, Tech, Decision)</p>
            <p className="text-white/50 text-[10px]">~5,400 tokens processed</p>
          </div>

          <div className="bg-[#15181C] p-3 rounded border border-white/10 space-y-1">
            <span className="text-[#3E7CB1] font-bold uppercase block text-[11px]">Google AI (Gemini 1.5)</span>
            <p className="text-[#E8E4D8]">4 Model Calls (HR & Skeptic)</p>
            <p className="text-white/50 text-[10px]">~4,200 tokens processed</p>
          </div>

          <div className="bg-[#15181C] p-3 rounded border border-white/10 space-y-1">
            <span className="text-[#C4432B] font-bold uppercase block text-[11px]">OpenAI (GPT-4o)</span>
            <p className="text-[#E8E4D8]">2 Model Calls (Hiring Manager)</p>
            <p className="text-white/50 text-[10px]">~2,100 tokens processed</p>
          </div>

          <div className="bg-[#15181C] p-3 rounded border border-white/10 space-y-1">
            <span className="text-white/80 font-bold uppercase block text-[11px]">Fairness Auditor</span>
            <p className="text-[#E8E4D8]">2 Audit Model Calls</p>
            <p className="text-white/50 text-[10px]">~1,100 tokens processed</p>
          </div>
        </div>
      </div>

      {/* Panel Interrogation Chatbox Drawer */}
      <InterrogatePanelChat candidate={candidate} judgeMode={judgeMode} />

      {/* Judge Mode Modal */}
      <JudgeModeModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title={modalState.title}
        stepName={modalState.stepName}
        modelEngine={modalState.modelEngine}
        provider={modalState.provider}
        rawPrompt={modalState.rawPrompt}
        rawResponse={modalState.rawResponse}
      />
    </div>
  );
}
