"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Zap,
  Cpu,
  Brain,
  Bot,
  Globe,
  Code2,
  AlertTriangle,
} from "lucide-react";

interface CandidatePreset {
  name: string;
  role: string;
  engine: string;
  resume: string;
  transcript: string;
  portfolio: string;
  tag: string;
  tagColor: string;
}

const PRESET_SAMPLES: CandidatePreset[] = [
  {
    name: "Maya Chen",
    role: "Senior Backend Engineer",
    engine: "gemini-3.5-flash",
    tag: "Direct Gemini Evaluation Engine",
    tagColor: "bg-[#3E7CB1] text-[#E8E4D8]",
    resume: `MAYA CHEN
Email: maya.chen@example.com | Location: San Francisco, CA

PROFESSIONAL SUMMARY
Senior Backend Engineer with 6+ years of experience designing mission-critical payment infrastructure, event streaming pipelines, and microservices in Go and Python.

TECHNICAL SKILLS
Languages & Frameworks: Go (Golang), Python, TypeScript, gRPC, Node.js
Storage & Data Pipelines: PostgreSQL, Redis, Apache Kafka, Cassandra, DynamoDB
Infrastructure: Docker, Kubernetes, AWS (ECS, Lambda, S3), Terraform

EXPERIENCE
FinTech Flow Inc. — Senior Backend Engineer (2021 – Present)
• Architected zero-downtime distributed transaction layer processing 50k TPS using multi-region two-phase commit consensus protocols.
• Decomposed legacy monolithic billing service into 12 Go microservices communicating asynchronously via Kafka event queues.
• Optimized PostgreSQL query performance, reducing tail latency (p99) from 450ms to 28ms under heavy burst loads.

PayStream Labs — Backend Software Engineer (2018 – 2021)
• Built high-throughput payment ingestion gateway handling $4M+ in daily transaction volume.
• Designed automated reconciliation cron jobs preventing double-charging during network partition events.

EDUCATION
B.S. in Computer Science — University of California, Berkeley (2018)`,
    transcript: `INTERVIEW TRANSCRIPT — MAYA CHEN
Interviewer: "Welcome Maya. Let's start with your work at FinTech Flow. Your resume mentions architecting a zero-downtime transaction layer with 50,000 TPS using multi-region two-phase commit consensus. Could you walk me through the exact failure modes and network partition handling in your 2PC implementation?"

Maya Chen: "Sure! At FinTech Flow, we processed high transaction volumes across our primary database clusters. To clarify the transaction model: we relied heavily on PostgreSQL row locking with exponential backoff retries and explicit idempotency keys in Redis, rather than implementing a custom Raft or 2PC consensus protocol from scratch. The 50,000 TPS figure represented our total aggregate throughput across all partitioned microservices during flash sale events, not a single monolithic consensus node."

Interviewer: "I see. What happens when a network partition occurs between database replicas during a write?"

Maya Chen: "We configured our primary-standby replication to fail fast on writes if synchronous commit acknowledgment wasn't received within 150ms. The application layer catches the lock timeout error and enqueues the transaction payload into a Kafka dead-letter queue for asynchronous retry once the network heals."

Interviewer: "How do you handle team collaboration when an unexpected production outage happens?"

Maya Chen: "I am usually focused on immediate technical triage — pulling up Grafana dashboards, inspecting log streams, and writing hotfixes. My engineering manager typically handles status communications with executive stakeholders so I can maintain deep focus on resolution."`,
    portfolio: `GITHUB REPOSITORY & PORTFOLIO CODE AUDIT:
Repository: github.com/mayachen/go-payment-gateway
Stars: 340 | Language: Go (94.2%), Shell (5.8%)`,
  },
  {
    name: "Alexander Wright",
    role: "Staff Systems Architect",
    engine: "multi-provider",
    tag: "Multi-Provider Hybrid Panel",
    tagColor: "bg-[#D4A537] text-[#15181C]",
    resume: `ALEXANDER WRIGHT
Staff Systems Architect | 10+ Years Experience
Specializing in C++ distributed storage engines, Raft consensus, and kernel-level IO optimization.`,
    transcript: `INTERVIEW TRANSCRIPT — ALEXANDER WRIGHT
Interviewer: "Walk me through your Raft consensus implementation in C++."
Alexander Wright: "We wrote a zero-copy Raft log engine using io_uring in Linux kernel 5.10. Every log entry is persisted using O_DIRECT disk writes to avoid OS page cache jitter."`,
    portfolio: `GITHUB REPOSITORY & PORTFOLIO CODE AUDIT:
Repository: github.com/alexwright/cpp-raft-storage-engine
Stars: 1,280 | Language: C++20 (98.5%), CMake (1.5%)`,
  },
  {
    name: "Jordan Miller",
    role: "Senior Full Stack Developer",
    engine: "gemini-3.5-flash",
    tag: "Direct Gemini Evaluation Engine",
    tagColor: "bg-[#C4432B] text-[#E8E4D8]",
    resume: `JORDAN MILLER
Senior Full Stack Developer | 5 Years Experience
Expert in Node.js, React, MongoDB, GraphQL, and cloud infrastructure.`,
    transcript: `INTERVIEW TRANSCRIPT — JORDAN MILLER
Interviewer: "How did you optimize MongoDB query performance for 1 million records?"
Jordan Miller: "We added indexes on high query fields and restarted the server when memory spiked."`,
    portfolio: `GITHUB REPOSITORY & PORTFOLIO CODE AUDIT:
Repository: github.com/jordanmiller/todo-app-express`,
  },
];

export default function AddNewCandidatePage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [name, setName] = useState("");
  const [roleAppliedFor, setRoleAppliedFor] = useState("");
  const [modelEngine, setModelEngine] = useState("gemini-3.5-flash");
  const [resumeText, setResumeText] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [portfolioText, setPortfolioText] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadPreset = (preset: CandidatePreset) => {
    setName(preset.name);
    setRoleAppliedFor(preset.role);
    setModelEngine(preset.engine);
    setResumeText(preset.resume);
    setTranscriptText(preset.transcript);
    setPortfolioText(preset.portfolio);
  };

  const handleSubmit = async () => {
    if (!name || !roleAppliedFor || !resumeText || !transcriptText) {
      alert("Please fill in all mandatory intake fields before launching the AI Judicial Tribunal.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const createRes = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          roleAppliedFor,
          resumeText,
          transcriptText,
          portfolioText,
          modelEngine,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error || "Failed to create candidate case record");
      }

      const { id } = await createRes.json();

      const evalRes = await fetch(`/api/candidates/${id}/evaluate`, {
        method: "POST",
      });

      if (!evalRes.ok) {
        const evalErr = await evalRes.json();
        throw new Error(evalErr.error || "Server multi-agent evaluation pipeline failed");
      }

      router.push(`/candidates/${id}`);
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 text-[#E8E4D8]">
      {/* Header */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-[#D4A537] font-medium">
          <span>TRIBUNAL CASE INTAKE</span>
          <span>/</span>
          <span className="text-[#E8E4D8]">OPEN NEW DOCKET</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-[#E8E4D8] uppercase tracking-tight">
          AI Candidate Intake & Judicial Docket Setup
        </h2>
        <p className="text-sm font-body text-white/80">
          Upload candidate resume material, interview Q&A transcripts, and choose between Direct Google Gemini Evaluation vs. Multi-Provider Hybrid Panel.
        </p>
      </div>

      {submitError && (
        <div className="precinct-card border-l-4 border-l-[#C4432B] p-4 text-xs font-mono text-[#E8E4D8] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#C4432B]">
            <AlertTriangle className="w-4 h-4" />
            <span>Intake Error: {submitError}</span>
          </div>
          <button onClick={handleSubmit} className="precinct-btn text-xs px-3 py-1">
            Retry Intake Pipeline
          </button>
        </div>
      )}

      {/* Preset Test Candidates */}
      <div className="precinct-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-xs font-mono uppercase font-bold text-[#D4A537] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D4A537]" /> Pre-Configured Test Candidate Scenarios
          </span>
          <span className="text-[11px] font-mono text-white/60">Click to load complete case data</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_SAMPLES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(sample)}
              className="text-left bg-[#15181C] border border-white/10 hover:border-[#D4A537] p-4 rounded transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-[#E8E4D8] text-base group-hover:text-[#D4A537]">
                  {sample.name}
                </span>
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${sample.tagColor}`}>
                  {sample.tag}
                </span>
              </div>
              <p className="text-xs font-mono text-[#D4A537] font-medium">{sample.role}</p>
              <p className="text-[11px] font-mono text-white/60">Engine: <span className="text-[#E8E4D8] font-bold">{sample.engine}</span></p>
            </button>
          ))}
        </div>
      </div>

      {/* Wizard Stepper Rail */}
      <div className="grid grid-cols-5 gap-2 border-b border-white/10 pb-4">
        {[
          { num: 1, title: "1. Metadata", icon: Cpu },
          { num: 2, title: "2. Resume", icon: FileText },
          { num: 3, title: "3. Transcript", icon: Bot },
          { num: 4, title: "4. Portfolio", icon: Code2 },
          { num: 5, title: "5. Review & Launch", icon: Zap },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`p-3 rounded border font-mono text-xs font-medium uppercase flex items-center justify-center gap-2 transition-all ${
                isActive
                  ? "bg-[#232830] border-[#D4A537] text-[#D4A537] border-b-2"
                  : isDone
                  ? "bg-[#15181C] border-[#3E7CB1] text-[#3E7CB1]"
                  : "bg-[#15181C] border-white/10 text-white/50 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: Metadata & AI Engine Selection */}
      {step === 1 && (
        <div className="precinct-card p-8 space-y-6">
          <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2 border-b border-white/10 pb-3">
            <Cpu className="w-5 h-5 text-[#D4A537]" /> Step 1: Candidate Metadata & AI Evaluation Engine Choice
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="candidate-name" className="text-xs font-mono font-bold uppercase text-[#D4A537] block">
                Candidate Full Name *
              </label>
              <input
                id="candidate-name"
                type="text"
                placeholder="e.g. Maya Chen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#15181C] border border-white/20 rounded px-4 py-3 text-[#E8E4D8] font-body focus:border-[#D4A537] focus-visible:ring-2 focus-visible:ring-[#D4A537] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="target-role" className="text-xs font-mono font-bold uppercase text-[#D4A537] block">
                Target Role Applied For *
              </label>
              <input
                id="target-role"
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={roleAppliedFor}
                onChange={(e) => setRoleAppliedFor(e.target.value)}
                className="w-full bg-[#15181C] border border-white/20 rounded px-4 py-3 text-[#E8E4D8] font-body focus:border-[#D4A537] focus-visible:ring-2 focus-visible:ring-[#D4A537] outline-none"
              />
            </div>
          </div>

          {/* AI Model Engine Selector */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono font-bold uppercase text-[#D4A537] block">
              AI Evaluation Engine Mode *
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => setModelEngine("gemini-3.5-flash")}
                className={`p-4 rounded border text-left transition-all space-y-2 ${
                  modelEngine === "gemini-3.5-flash"
                    ? "bg-[#232830] border-[#3E7CB1] text-[#E8E4D8] ring-2 ring-[#3E7CB1]"
                    : "bg-[#15181C] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#3E7CB1] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#3E7CB1]" /> Direct Google Gemini Engine
                  </span>
                  <span className="bg-[#3E7CB1]/20 text-[#3E7CB1] px-2 py-0.5 rounded text-[10px] font-bold">
                    LIVE GEMINI KEY
                  </span>
                </div>
                <p className="font-body text-xs text-white/80">
                  Routes all 4 panel agent evaluations, profile extraction, debate cross-examination, and Chief Magistrate verdict directly through Google Gemini API (<code className="text-[#3E7CB1]">gemini-3.5-flash</code>).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setModelEngine("multi-provider")}
                className={`p-4 rounded border text-left transition-all space-y-2 ${
                  modelEngine === "multi-provider"
                    ? "bg-[#232830] border-[#D4A537] text-[#E8E4D8] ring-2 ring-[#D4A537]"
                    : "bg-[#15181C] border-white/10 text-white/60 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#D4A537] uppercase flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-[#D4A537]" /> Multi-Provider Hybrid Panel
                  </span>
                  <span className="bg-[#D4A537]/20 text-[#D4A537] px-2 py-0.5 rounded text-[10px] font-bold">
                    HYBRID PANEL
                  </span>
                </div>
                <p className="font-body text-xs text-white/80">
                  Runs HR & Skeptic agents on Google Gemini, while Technical & Hiring Manager run on Claude 3.5 Sonnet with multi-provider arbitration.
                </p>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!name || !roleAppliedFor}
              className="precinct-btn-primary text-xs px-6 py-3 flex items-center gap-2 disabled:opacity-40"
            >
              Continue to Step 2: Resume <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Resume Material */}
      {step === 2 && (
        <div className="precinct-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4A537]" /> Step 2: Resume & Employment Record
            </h3>
          </div>

          <div className="space-y-2">
            <label htmlFor="resume-text" className="text-xs font-mono font-bold uppercase text-[#D4A537] block">
              Resume Text Content *
            </label>
            <textarea
              id="resume-text"
              rows={12}
              placeholder="Paste candidate resume plain text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full bg-[#15181C] border border-white/20 rounded p-4 text-[#E8E4D8] font-mono text-xs leading-relaxed focus:border-[#D4A537] focus-visible:ring-2 focus-visible:ring-[#D4A537] outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="precinct-btn text-xs px-5 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Metadata
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!resumeText.trim()}
              className="precinct-btn-primary text-xs px-6 py-3 flex items-center gap-2 disabled:opacity-40"
            >
              Continue to Step 3: Transcript <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Interview Q&A Transcript */}
      {step === 3 && (
        <div className="precinct-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#D4A537]" /> Step 3: Interview Q&A Transcript
            </h3>
          </div>

          <textarea
            rows={12}
            placeholder="Paste interview transcript text here..."
            value={transcriptText}
            onChange={(e) => setTranscriptText(e.target.value)}
            className="w-full bg-[#15181C] border border-white/20 rounded p-4 text-[#E8E4D8] font-mono text-xs leading-relaxed focus:border-[#D4A537] outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="precinct-btn text-xs px-5 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Resume
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              disabled={!transcriptText.trim()}
              className="precinct-btn-primary text-xs px-6 py-3 flex items-center gap-2 disabled:opacity-40"
            >
              Continue to Step 4: Portfolio <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: GitHub Portfolio */}
      {step === 4 && (
        <div className="precinct-card p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#D4A537]" /> Step 4: GitHub Repository & Portfolio Evidence
            </h3>
          </div>

          <textarea
            rows={12}
            placeholder="Paste GitHub repository code snippets, portfolio links, or open-source contribution details here..."
            value={portfolioText}
            onChange={(e) => setPortfolioText(e.target.value)}
            className="w-full bg-[#15181C] border border-white/20 rounded p-4 text-[#E8E4D8] font-mono text-xs leading-relaxed focus:border-[#D4A537] outline-none"
          />

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="precinct-btn text-xs px-5 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Transcript
            </button>
            <button
              type="button"
              onClick={() => setStep(5)}
              className="precinct-btn-primary text-xs px-6 py-3 flex items-center gap-2"
            >
              Continue to Step 5: Review & Launch <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Executive Review & Launch */}
      {step === 5 && (
        <div className="precinct-card p-8 space-y-6">
          <h3 className="text-xl font-display font-bold text-[#E8E4D8] uppercase flex items-center gap-2 border-b border-white/10 pb-3">
            <Zap className="w-5 h-5 text-[#D4A537]" /> Step 5: Executive Docket Summary & Tribunal Launch
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px]">Candidate Name</span>
              <p className="font-display font-bold text-lg text-[#E8E4D8]">{name}</p>
            </div>

            <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px]">Target Role</span>
              <p className="font-display font-bold text-lg text-[#3E7CB1]">{roleAppliedFor}</p>
            </div>

            <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
              <span className="text-white/50 block text-[10px]">AI Evaluation Engine</span>
              <p className="font-display font-bold text-sm text-[#D4A537] uppercase">{modelEngine}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="precinct-btn text-xs px-5 py-3 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Portfolio
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="precinct-btn-primary text-xs px-8 py-4 flex items-center gap-3 disabled:opacity-50"
            >
              {submitting ? (
                <>Evaluating via {modelEngine}...</>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Launch AI Tribunal Docket
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
