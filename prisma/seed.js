const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const CARGONET_JD = `JOB DESCRIPTION: AI Engineer — Agentic Systems (Freight Operations) at Cargonet AI

ABOUT CARGONET AI:
Cargonet AI is building autonomous multi-agent systems to orchestrate global freight operations (quoting, booking, tracking, document processing, exception handling).

ROLE OVERVIEW:
We are seeking an AI Engineer to improve and expand our live planner/executor/reviewer multi-agent freight ops engine.
This is explicitly NOT a "build once and walk away" role — long-term reliability ownership matters as much as v1 velocity.

KEY RESPONSIBILITIES:
• Architect, deploy, and maintain Python microservices, vector search RAG pipelines, and multi-agent workflows.
• Own production failure modes, prompt regressions, reviewer override-rate tracking, and automated eval suites.
• Collaborate with freight dispatchers and customer support to handle edge-case exceptions under tight SLA constraints.

REQUIREMENTS:
• 3+ years experience with solid Python backend engineering & API design (FastAPI, Pydantic, PostgreSQL).
• Hands-on LLM experience in production (prompt engineering, RAG/vector databases, eval benchmarks).
• High accountability: proven track record of owning production breakage, post-mortems, and deployment safety.
• Basic React frontend familiarity.
• Nice-to-have: logistics/freight domain knowledge, OCR document parsing, complex systems integration.`;

// CANDIDATE A — Rohan Malhotra (The Resume Inflation & Job Hopper)
const ROHAN_MALHOTRA = {
  candidateKey: "rohan_malhotra",
  name: "Rohan Malhotra",
  roleAppliedFor: "AI Engineer — Agentic Systems (Freight Operations)",
  jobDescription: CARGONET_JD,
  resumeText: `ROHAN MALHOTRA
Email: rohan.m@example.com | San Francisco, CA

SUMMARY:
Backend & AI Engineer with 3.5 years experience designing agentic workflows, FastAPI microservices, and vector search systems.

WORK EXPERIENCE:
Voltrix AI — Senior AI Systems Engineer (2023 – Present)
• Sole architect of production retry/escalation engine processing 15k daily LLM agent requests.
• Implemented multi-agent planner/executor routing using FastAPI and Redis queues.

Nexus Logistics — Backend Engineer (2022 – 2023)
• Built Python REST APIs for shipment tracking and automated document parser.

DataPulse Inc — Junior Software Engineer (2021 – 2022)
• Developed PostgreSQL query optimization scripts and basic internal React dashboards.

EDUCATION:
B.S. in Computer Science (2021)`,

  transcriptText: `INTERVIEW TRANSCRIPT — ROHAN MALHOTRA
Interviewer: "Welcome Rohan. Your resume states you were the 'sole architect' of Voltrix's production retry and escalation engine. Walk me through how you handled model routing failure modes."

Rohan Malhotra: "Thanks! Well, to be transparent, 'sole architect' was probably too strong on my resume. A teammate, Priya, built most of the production implementation while I led the high-level design in our initial sprint."

Interviewer: "I see. What is your current human reviewer override rate for agent routing decisions?"

Rohan Malhotra: "Honestly, I haven't looked at the reviewer override-rate number recently. We monitor overall API uptime on Datadog, but we haven't done a formal benchmark study on model routing accuracy."

Interviewer: "How have you handled major production incident outages when multi-agent loops break down?"

Rohan Malhotra: "Voltrix's active user base is still relatively small, so we haven't handled serious production incident volume yet under heavy load."

Interviewer: "You've had three roles in 3.5 years. What drove those career moves?"

Rohan Malhotra: "Better pay and title, mostly. I like joining early-stage projects, shipping the initial architecture, and moving on when better offers come up."`,
};

// CANDIDATE B — Ananya Iyer (The Honest & Accountable 6-Yr Veteran)
const ANANYA_IYER = {
  candidateKey: "ananya_iyer",
  name: "Ananya Iyer",
  roleAppliedFor: "AI Engineer — Agentic Systems (Freight Operations)",
  jobDescription: CARGONET_JD,
  resumeText: `ANANYA IYER
Email: ananya.iyer@example.com | Seattle, WA

SUMMARY:
Senior Software Engineer with 6 years experience at single company building Python services, PostgreSQL databases, and RAG pipelines.

WORK EXPERIENCE:
OmniStream Systems — Senior Software Engineer (2018 – Present)
• Progressed from Junior Engineer (2018) to Senior Software Engineer (2022).
• Architected production single-agent RAG search pipeline handling 100k daily user queries.
• Built internal Python microservices, vector search indexing scripts, and PostgreSQL schema migrations.
• ~40% accuracy improvement on document search pipeline through systematic prompt iterations.

EDUCATION:
B.S. in Software Engineering (2018)`,

  transcriptText: `INTERVIEW TRANSCRIPT — ANANYA IYER
Interviewer: "Welcome Ananya. Looking at your background, have you used multi-agent frameworks like LangGraph, CrewAI, or AutoGen in production?"

Ananya Iyer: "I want to be completely direct upfront: I have not deployed multi-agent orchestration frameworks like LangGraph or CrewAI in production. In production, I built a single-agent RAG search pipeline. On my own time, I built a toy planner/executor side project to understand multi-agent state machines, but I haven't run one at scale yet."

Interviewer: "Tell me about a time you caused or managed a major production outage."

Ananya Iyer: "Early last year, I pushed a prompt modification straight to production without a staging eval test. It caused a 2-hour bad-response spike for our enterprise users. I owned it immediately, led the rollback, wrote the post-mortem, and created a pre-deployment checklist with mandatory staging evals that our entire engineering team still uses today."

Interviewer: "Your resume mentions a ~40% accuracy improvement on document search. How did you benchmark that?"

Ananya Iyer: "To qualify that claim: the ~40% accuracy figure was an informal internal benchmark from our team's sample evaluation set, not a formal published academic benchmark. I wanted to make sure I didn't overstate that."`,
};

// CANDIDATE C — Vikram Shah (The Clean Control Profile)
const VIKRAM_SHAH = {
  candidateKey: "vikram_shah",
  name: "Vikram Shah",
  roleAppliedFor: "AI Engineer — Agentic Systems (Freight Operations)",
  jobDescription: CARGONET_JD,
  resumeText: `VIKRAM SHAH
Email: vikram.shah@example.com | Austin, TX

SUMMARY:
Senior AI Systems Engineer with 5 years experience building production multi-agent logistics pipelines in Python, LangGraph, and PostgreSQL.

WORK EXPERIENCE:
FreightPulse Technologies — Senior AI Engineer (2021 – Present)
• Architected 4-agent dispatch engine processing 50k daily freight quote requests.
• Built automated fallback state machines for planner timeouts and OCR document parsing.
• Reduced human dispatcher intervention rate from 18% to 3.2% via prompt regression testing.

LogiTech Labs — Backend Software Engineer (2019 – 2021)
• Built Python FastAPI microservices and PostgreSQL data pipelines.

EDUCATION:
M.S. in Artificial Intelligence, UT Austin (2019)`,

  transcriptText: `INTERVIEW TRANSCRIPT — VIKRAM SHAH
Interviewer: "Welcome Vikram. Walk me through your multi-agent dispatch system at FreightPulse."

Vikram Shah: "At FreightPulse, we built a 4-agent graph using LangGraph. The Planner agent parses incoming shipping orders, the Executor calls freight rates APIs, and the Reviewer verifies SLA compliance before dispatching."

Interviewer: "How do you handle reviewer overrides when an agent makes a bad routing decision?"

Vikram Shah: "We log every reviewer override directly to PostgreSQL. Our current override rate is 3.2%. I'd want to double check the exact number from this morning's dashboard, but it has stayed consistently below 4% for the past 6 months."

Interviewer: "How do you handle production failure modes when LLM providers experience latency spikes?"

Vikram Shah: "We built a circuit-breaker fallback. If the primary planner model exceeds a 3-second SLA, our state machine falls back to a lightweight deterministic rule engine so dispatchers are never blocked."`,
};

// CANDIDATE D — Dr. Maya Lin (The Overqualified Outlier)
const DR_MAYA_LIN = {
  candidateKey: "dr_maya_lin",
  name: "Dr. Maya Lin",
  roleAppliedFor: "AI Engineer — Agentic Systems (Freight Operations)",
  jobDescription: CARGONET_JD,
  resumeText: `DR. MAYA LIN
Email: maya.lin@example.com | San Jose, CA

SUMMARY:
Former Vice President of Engineering with 12 years experience in distributed systems, AI infrastructure, and engineering leadership.

WORK EXPERIENCE:
QuantumScale Inc — Vice President of Engineering (2020 – 2024)
• Led 40+ engineers across AI infrastructure, backend microservices, and MLOps teams.
• Managed $4M annual cloud infrastructure budget and executive roadmap.

Apex Systems — Principal Software Architect (2016 – 2020)
• Architected high-throughput distributed messaging systems in Python and C++.

EDUCATION:
Ph.D. in Computer Science (Distributed Systems), Stanford University (2016)`,

  transcriptText: `INTERVIEW TRANSCRIPT — DR. MAYA LIN
Interviewer: "Welcome Dr. Lin. You were previously Vice President of Engineering managing 40+ engineers at QuantumScale. Why are you applying for an individual contributor AI Engineer role at Cargonet AI?"

Dr. Maya Lin: "I spent four years in executive management, but I realized my true passion is building software directly. I genuinely miss writing Python code, designing system architectures, and solving technical problems hands-on every single day."

Interviewer: "How will you adapt to working as an IC in an early-stage startup environment where you don't manage a team?"

Dr. Maya Lin: "I have zero ego about title or management authority. My goal is to write clean, reliable production code and help the team ship fast. Having managed teams, I understand how crucial it is for ICs to be self-directed and take complete ownership of production reliability."`,
};

// CANDIDATE E — Leo Zhang (The Thin Transcript Case)
const LEO_ZHANG = {
  candidateKey: "leo_zhang",
  name: "Leo Zhang",
  roleAppliedFor: "AI Engineer — Agentic Systems (Freight Operations)",
  jobDescription: CARGONET_JD,
  resumeText: `LEO ZHANG
Email: leo.zhang@example.com | Chicago, IL

SUMMARY:
Backend Engineer with 5 years experience building Python microservices and vector search indexing pipelines.

WORK EXPERIENCE:
ApexAI Labs — Software Engineer (2021 – Present)
• Built vector search pipeline using Python, FastAPI, and Qdrant.
• Maintained PostgreSQL databases and REST endpoints.

DataCore Inc — Software Engineer (2019 – 2021)
• Built internal API microservices in Python.

EDUCATION:
B.S. in Computer Science (2019)`,

  transcriptText: `INTERVIEW TRANSCRIPT — LEO ZHANG (SHORT RUSHED SESSION)
Interviewer: "Welcome Leo. Can you tell us about your experience building multi-agent systems and handling production failure modes?"

Leo Zhang: "Built vector search pipelines at ApexAI. Handled standard deployments."

Interviewer: "What is your experience with prompt evals and reviewer override tracking?"

Leo Zhang: "Monitored standard API logs."

Interviewer: "Can you elaborate on a complex technical challenge you faced?"

Leo Zhang: "Pushed API updates on schedule."`,
};

async function main() {
  console.log("Cleaning old database records...");
  await prisma.agentOpinion.deleteMany({});
  await prisma.verdict.deleteMany({});
  await prisma.candidateProfile.deleteMany({});
  await prisma.fairnessAudit.deleteMany({});
  await prisma.candidateComparison.deleteMany({});
  await prisma.candidate.deleteMany({});

  const candidatesList = [ROHAN_MALHOTRA, ANANYA_IYER, VIKRAM_SHAH, DR_MAYA_LIN, LEO_ZHANG];

  for (const candData of candidatesList) {
    console.log(`Seeding ${candData.name}...`);
    const cand = await prisma.candidate.create({
      data: {
        candidateKey: candData.candidateKey,
        name: candData.name,
        roleAppliedFor: candData.roleAppliedFor,
        jobDescription: candData.jobDescription,
        resumeText: candData.resumeText,
        transcriptText: candData.transcriptText,
        portfolioText: "",
        modelEngine: "claude-3-5-sonnet",
        status: "done",
      },
    });

    // Profile Seed
    let profileSkills = ["Python", "FastAPI", "PostgreSQL"];
    let recLabel = "Hire";
    let scoreVal = 8;

    if (candData.candidateKey === "rohan_malhotra") {
      profileSkills = ["Python", "Multi-Agent Systems", "FastAPI"];
      recLabel = "Not hire";
      scoreVal = 4;
    } else if (candData.candidateKey === "vikram_shah") {
      profileSkills = ["Python", "LangGraph", "Multi-Agent Freight Logistics"];
      recLabel = "Hire";
      scoreVal = 9;
    } else if (candData.candidateKey === "dr_maya_lin") {
      profileSkills = ["Python", "System Architecture", "Distributed Systems"];
      recLabel = "Hire with reservations";
      scoreVal = 7;
    } else if (candData.candidateKey === "leo_zhang") {
      profileSkills = ["Python", "Vector Search", "FastAPI"];
      recLabel = "More info needed";
      scoreVal = 5;
    }

    await prisma.candidateProfile.create({
      data: {
        candidateId: cand.id,
        yearsExperience: candData.candidateKey === "dr_maya_lin" ? 12 : 5,
        topSkills: JSON.stringify(profileSkills),
        education: "B.S. in Computer Science",
        careerSummary: `Application profile for ${candData.name}.`,
        notableClaims: JSON.stringify([
          { claim: `Experience relevant to ${candData.roleAppliedFor}`, quote: candData.resumeText.slice(0, 40), source: "resume" },
        ]),
        flaggedDiscrepancies: JSON.stringify(
          candData.candidateKey === "rohan_malhotra"
            ? [{ topic: "Sole Architect Claim", resumeQuote: "Sole architect of production retry engine", transcriptQuote: "sole architect was probably too strong" }]
            : []
        ),
      },
    });

    // Initial Opinions
    const agentsIds = ["technical", "hr", "hiring_manager", "skeptic"];
    for (const agId of agentsIds) {
      await prisma.agentOpinion.create({
        data: {
          candidateId: cand.id,
          agentId: agId,
          phase: "initial",
          score: scoreVal,
          confidence: candData.candidateKey === "leo_zhang" ? "low" : "high",
          summary: `Evaluation by ${agId} for ${candData.name}.`,
          strengths: JSON.stringify([{ point: "Relevant backend experience", quote: candData.resumeText.slice(0, 30), source: "resume" }]),
          concerns: JSON.stringify([]),
          insufficientEvidence: JSON.stringify(candData.candidateKey === "leo_zhang" ? [{ topic: "Production Multi-Agent Scale", note: "Thin transcript" }] : []),
        },
      });

      await prisma.agentOpinion.create({
        data: {
          candidateId: cand.id,
          agentId: agId,
          phase: "debate",
          score: scoreVal,
          scoreDelta: 0,
          confidence: candData.candidateKey === "leo_zhang" ? "low" : "high",
          summary: `Post-debate stance by ${agId} for ${candData.name}.`,
          strengths: JSON.stringify([]),
          concerns: JSON.stringify([]),
          insufficientEvidence: JSON.stringify([]),
          engagements: JSON.stringify([{ with_agent: "technical", with_agent_name: "Dr. Aris Vance", their_point: "Peer opinion reviewed.", stance: "agree", reasoning: "Panel consensus reached." }]),
          changedFromInitial: false,
        },
      });
    }

    // Verdict
    await prisma.verdict.create({
      data: {
        candidateId: cand.id,
        recommendation: recLabel,
        confidence: candData.candidateKey === "leo_zhang" ? "low" : "high",
        decisiveAgentId: candData.candidateKey === "rohan_malhotra" ? "skeptic" : candData.candidateKey === "dr_maya_lin" ? "hiring_manager" : candData.candidateKey === "leo_zhang" ? "skeptic" : "hiring_manager",
        reasoning: `JUDICIAL TRIBUNAL DECREE for ${candData.name}: Official panel verdict rendered as ${recLabel.toUpperCase()}.`,
        strengths: JSON.stringify(["Core backend capabilities"]),
        concerns: JSON.stringify([]),
        insufficientEvidence: JSON.stringify(candData.candidateKey === "leo_zhang" ? ["UNPROVEN: Production multi-agent failure recovery due to thin transcript."] : []),
        unresolvedDisagreements: JSON.stringify([]),
      },
    });

    // Fairness Audit
    await prisma.fairnessAudit.create({
      data: {
        candidateId: cand.id,
        passed: true,
        summary: `Fairness Audit Verified for ${candData.name}.`,
        flaggedBias: JSON.stringify([]),
        auditRecommendations: JSON.stringify([]),
      },
    });
  }

  console.log("Successfully seeded Candidates A, B, C, D, E into the Case Archive!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
