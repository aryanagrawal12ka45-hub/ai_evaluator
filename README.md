# 📁 The Panel — AI Hiring Panel Simulator & Case File System

> **A confidential, multi-agent AI hiring evaluation platform built with Next.js 14, TypeScript, Prisma ORM, `@anthropic-ai/sdk` (Claude 3.5 Sonnet), and Three.js.**

---

## 🎯 Rubric Compliance Mapping

This project is built explicitly to satisfy every line of the evaluation rubric (Parts 1–18):

| Rubric Section | Feature & Purpose | Implementation Details |
|---|---|---|
| **Part 11: Panel Consensus Matrix** | Quality of debate audit matrix at a glance | Side-by-side Step 2 initial vs Step 3 final scores with green/red deltas, plus an auto-generated unresolved disagreement tension list ([`components/ConsensusMatrix.tsx`](file:///d:/PROMPTWARS/components/ConsensusMatrix.tsx)). |
| **Part 12: "Judge Mode" Audit Trail** | Raw prompt & raw response inspector | Toggle switch in top header. Displays `[ Inspect LLM Call ]` on every claim, opening a modal showing exact system/user prompt & unedited raw LLM JSON ([`components/JudgeModeModal.tsx`](file:///d:/PROMPTWARS/components/JudgeModeModal.tsx)). |
| **Part 13: Bias & Fairness Auditor** | 5th non-scoring AI model call | `Fairness Auditor` reviews Step 2 + Step 3 outputs to detect proxy bias (tenure as loyalty, direct tone as unconfident) vs JD evidence ([`components/FairnessCard.tsx`](file:///d:/PROMPTWARS/components/FairnessCard.tsx)). |
| **Part 14: Pipeline Transparency** | In-flight model call tracker | Live server multi-agent status rail showing step progress, simultaneous 5-agent execution status, and step error retry states ([`components/ProgressRail.tsx`](file:///d:/PROMPTWARS/components/ProgressRail.tsx)). |
| **Part 15: Export Case File PDF** | Printable dossier report | "Generate Case File PDF" button invoking `window.print()` with styled `@media print` CSS for manila folder reports. |
| **Part 16: Cost & Latency Panel** | Engineering maturity & cost transparency | Footer stats displaying total model calls (11 calls), total latency (~4.2s), estimated tokens (~12,800 tokens), and LLM engine name. |
| **Part 17: Accessibility & Keyboard** | Inclusive design & reduced-motion | Keyboard-navigable focus states, non-3D list fallback views, `prefers-reduced-motion` compliance, and colorblind-safe stance labels (`CheckCircle2` for agree, `XSquare` for disagree). |
| **Part 18: Edge Case Verification** | Thin response & contradiction handling | Tested with Candidate A (Rohan Malhotra: walked-back architect claim) and Candidate B (Ananya Iyer: missing multi-agent experience, owned prod outage). |

---

## 📂 Seed Data (Real Source Documents)

The repository contains real, pre-seeded evaluations for **Cargonet AI Freight Operations**:

1. **Job Description**: `AI Engineer — Agentic Systems (Freight Operations)` at Cargonet AI. Requires Python backend, RAG, multi-agent workflows, and long-term production reliability ownership.
2. **Candidate A — Rohan Malhotra**: Resume claims "sole architect" of Voltrix retry engine. Transcript walk-back reveals teammate Priya built production code while he led high-level design. Job hopping (3 jobs in 3.5 yrs), unknown reviewer override rate. **DECREED: `NO HIRE`**.
3. **Candidate B — Ananya Iyer**: 6-year single-company tenure, no production multi-agent framework experience. Direct about prompt outage she caused, owned it fully, and built pre-deploy checklist team still uses. **DECREED: `HIRE`**.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Sync database schema
npx prisma db push --force-reset

# 3. Seed real candidate case files (Rohan Malhotra & Ananya Iyer)
node prisma/seed.js

# 4. Start Next.js development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.
