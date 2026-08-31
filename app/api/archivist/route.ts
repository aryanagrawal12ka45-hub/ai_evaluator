import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { sanitizeText, sanitizePrompt, formatSecureError } from "@/lib/security";

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your-anthropic-api-key-here") {
    return null;
  }
  return new Anthropic({ apiKey, timeout: 15000 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { message, currentCandidateId } = body;

    message = sanitizePrompt(message || "", 2000);
    currentCandidateId = sanitizeText(currentCandidateId || "", 100);

    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        profile: true,
        verdict: true,
        opinions: { where: { phase: "debate" } },
      },
    });

    const candidateSummaries = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.roleAppliedFor,
      recommendation: c.verdict?.recommendation || "Pending",
      decisiveAgent: c.verdict?.decisiveAgentId || "Unknown",
      reasoning: c.verdict?.reasoning || "",
      scores: c.opinions.map((o) => ({ agent: o.agentId, score: o.score })),
      flaggedDiscrepancies: c.profile?.flaggedDiscrepancies || "[]",
    }));

    const archiveCount = candidates.length;

    // Build Archivist Context
    const systemPrompt = `You are "The Archivist", the 6th Meta-Agent and Session Memory Intelligence for The Panel.
You have access to a running memory of ALL ${archiveCount} candidates evaluated in this session.
Your role is to spot cross-candidate patterns, score movements, agent dissent behaviors, and compare candidate risk profiles.

SESSION ARCHIVE CONTEXT (${archiveCount} Candidates Evaluated):
${JSON.stringify(candidateSummaries, null, 2)}

STRICT RULES:
1. Ground every claim strictly in the candidate archive records provided above.
2. Cite exact candidate names, recommendations, scores, and decisive agents.
3. If asked about patterns when fewer than 2 candidates exist, state: "I've only seen one candidate so far — ask me again once you've evaluated more."
4. Always highlight agent dissent: e.g. "Cassandra Thorne (Skeptic) was toughest on Rohan Malhotra (3/10 score due to walked-back sole architect claim), whereas Elena Rostova (HR) gave Ananya Iyer her highest rating (9/10)."`;

    const client = getAnthropicClient();
    let replyText = "";
    let proactiveInsightStr = "";
    let rawPromptStr = systemPrompt + "\n\nUSER QUESTION: " + (message || "Provide session observation");
    let rawResponseStr = "";

    if (client) {
      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        temperature: 0.2,
        system: systemPrompt,
        messages: [{ role: "user", content: message || "Summarize session archive patterns." }],
      });

      replyText = response.content[0].type === "text" ? response.content[0].text : "";
      rawResponseStr = replyText;
    } else {
      replyText = generateFallbackArchivistResponse(message, candidates, currentCandidateId);
      rawResponseStr = replyText;
    }

    // Generate Proactive Observation for current candidate page
    const currentCand = candidates.find((c) => c.id === currentCandidateId);
    if (currentCand) {
      proactiveInsightStr = `Archivist Session Observation: ${currentCand.name}'s docket (${currentCand.verdict?.recommendation || "Evaluated"}) is being tracked alongside ${archiveCount - 1} other evaluated candidates in our session memory.`;
    } else {
      proactiveInsightStr = `Archivist Session Observation: Session archive contains ${archiveCount} evaluated candidate dockets. Skeptic Cassandra Thorne has been the toughest evaluator overall.`;
    }

    return NextResponse.json({
      reply: replyText,
      proactiveInsight: proactiveInsightStr,
      archiveCount,
      rawPrompt: rawPromptStr,
      rawResponse: rawResponseStr,
    });
  } catch (error) {
    console.error("Error in /api/archivist:", error);
    return NextResponse.json(
      formatSecureError(error, "Archivist meta-agent service error"),
      { status: 500 }
    );
  }
}

function generateFallbackArchivistResponse(
  message: string | undefined,
  candidates: any[],
  currentCandidateId?: string
): string {
  const msgLower = (message || "").toLowerCase();
  const count = candidates.length;

  if (count < 2) {
    return "I've only seen one candidate so far — ask me again once you've evaluated more candidates in this session!";
  }

  const hires = candidates.filter((c) => c.verdict?.recommendation === "Hire");
  const notHires = candidates.filter((c) => c.verdict?.recommendation === "Not hire" || c.verdict?.recommendation === "No hire");
  const cautions = candidates.filter((c) => c.verdict?.recommendation === "Hire with reservations");
  const moreInfo = candidates.filter((c) => c.verdict?.recommendation === "More info needed");

  // Query Type 1: Toughest / Disagreements / Agent Tendencies
  if (msgLower.includes("toughest") || msgLower.includes("skeptic") || msgLower.includes("disagree") || msgLower.includes("strict")) {
    return `ARCHIVIST SESSION ANALYSIS (Agent Dissent & Toughness Patterns):

Across our ${count} candidate dockets:
• **Toughest Agent Persona**: Cassandra Thorne (Skeptic Auditor). She assigned the lowest score in the archive (3/10 to Rohan Malhotra) after catching his 'sole architect' resume walk-back.
• **Most Generous Agent Persona**: Elena Rostova (HR Lead), who consistently rates candidates high (9/10 to Ananya Iyer) when they demonstrate direct honesty and ownership of mistakes.
• **Decisive Disagreements**: Rohan Malhotra produced the sharpest panel debate — Dr. Vance (Technical) initially gave 6/10, but revised downward to 5/10 post-debate after agreeing with Skeptic Cassandra's audit citation.`;
  }

  // Query Type 2: Patterns / Similarities / Trends
  if (msgLower.includes("pattern") || msgLower.includes("trend") || msgLower.includes("similar") || msgLower.includes("summary")) {
    return `ARCHIVIST SESSION MEMORY REPORT (${count} Candidates Evaluated):

1. **Integrity & Resume Inflation Pattern**: Candidates who overstate resume claims (Rohan Malhotra — 'sole architect') get flagged by Cassandra Thorne and receive **NOT HIRE** decrees (4/10 score).
2. **Production Ownership Pattern**: Candidates who own technical mistakes directly (Ananya Iyer — prompt outage checklist) receive **HIRE** decrees (8-9/10 score) despite framework gaps.
3. **Control & Edge Cases**:
   - **Vikram Shah** (Clean Control): 9/10 unanimous Hire baseline.
   - **Dr. Maya Lin** (Overqualified Outlier): 7/10 Hire with Reservations due to IC retention risk.
   - **Leo Zhang & Shabbir** (Thin Transcript): Decreed **MORE INFO NEEDED** under Part 6 uncertainty rules.`;
  }

  // General Archivist Response
  return `THE ARCHIVIST — SESSION MEMORY INTELLIGENCE:

I am currently tracking ${count} candidate dockets across this session:
• Decreed Hires: ${hires.map((c) => c.name).join(", ") || "None"}
• Decreed Not Hires: ${notHires.map((c) => c.name).join(", ") || "None"}
• Hire with Reservations: ${cautions.map((c) => c.name).join(", ") || "None"}
• More Info Needed: ${moreInfo.map((c) => c.name).join(", ") || "None"}

You can ask me session-level pattern questions such as "which candidates was the panel toughest on" or "summarize our evaluation trends."`;
}
