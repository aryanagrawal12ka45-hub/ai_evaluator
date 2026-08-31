import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText, formatSecureError } from "@/lib/security";
import {
  AGENTS,
  buildProfile,
  getIndependentOpinion,
  getDebateResponse,
  getFinalDecision,
  getFairnessAudit,
} from "@/lib/agents";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const candidateId = sanitizeText(params.id, 100);
  const startTime = Date.now();

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    // Step 1: Profiling
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "profiling" },
    });

    const profileData = await buildProfile(
      candidate.candidateKey || "custom_candidate",
      candidate.roleAppliedFor,
      candidate.jobDescription,
      candidate.resumeText,
      candidate.transcriptText
    );

    await prisma.candidateProfile.upsert({
      where: { candidateId },
      create: {
        candidateId,
        yearsExperience: profileData.yearsExperience,
        topSkills: JSON.stringify(profileData.topSkills),
        education: profileData.education,
        careerSummary: profileData.careerSummary,
        notableClaims: JSON.stringify(profileData.notableClaims),
        flaggedDiscrepancies: JSON.stringify(profileData.flaggedDiscrepancies || []),
      },
      update: {
        yearsExperience: profileData.yearsExperience,
        topSkills: JSON.stringify(profileData.topSkills),
        education: profileData.education,
        careerSummary: profileData.careerSummary,
        notableClaims: JSON.stringify(profileData.notableClaims),
        flaggedDiscrepancies: JSON.stringify(profileData.flaggedDiscrepancies || []),
      },
    });

    // Step 2: Independent Testimony (4 distinct provider calls executed simultaneously via Promise.all)
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "testimony" },
    });

    const initialOpinions = await Promise.all(
      AGENTS.map((agent) =>
        getIndependentOpinion(
          agent,
          candidate.roleAppliedFor,
          candidate.jobDescription,
          profileData,
          candidate.resumeText,
          candidate.transcriptText
        )
      )
    );

    await prisma.agentOpinion.deleteMany({
      where: { candidateId },
    });

    for (const op of initialOpinions) {
      await prisma.agentOpinion.create({
        data: {
          candidateId,
          agentId: op.agent,
          phase: "initial",
          score: op.score,
          confidence: op.confidence,
          summary: op.summary,
          strengths: JSON.stringify(op.strengths),
          concerns: JSON.stringify(op.concerns),
          insufficientEvidence: JSON.stringify(op.insufficientEvidence || []),
          modelEngine: op.modelEngine || "claude-3-5-sonnet",
          provider: op.provider || "Anthropic",
          rawPrompt: op.rawPrompt || "",
          rawResponse: op.rawResponse || "",
        },
      });
    }

    // Step 3: Cross-Exam / Debate (4 distinct provider calls executed simultaneously via Promise.all)
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "debate" },
    });

    const debateOpinions = await Promise.all(
      AGENTS.map((agent) => {
        const myInitial = initialOpinions.find((o) => o.agent === agent.id)!;
        const peerOpinions = initialOpinions.filter((o) => o.agent !== agent.id);
        return getDebateResponse(
          agent,
          candidate.roleAppliedFor,
          candidate.jobDescription,
          profileData,
          myInitial,
          peerOpinions
        );
      })
    );

    for (const dOp of debateOpinions) {
      await prisma.agentOpinion.create({
        data: {
          candidateId,
          agentId: dOp.agent,
          phase: "debate",
          score: dOp.updated_score,
          scoreDelta: dOp.score_delta,
          confidence: dOp.updated_confidence,
          summary: dOp.updated_summary,
          strengths: JSON.stringify([]),
          concerns: JSON.stringify([]),
          insufficientEvidence: JSON.stringify([]),
          engagements: JSON.stringify(dOp.engagements),
          changedFromInitial: dOp.changed_from_initial,
          modelEngine: dOp.modelEngine || "claude-3-5-sonnet",
          provider: dOp.provider || "Anthropic",
          rawPrompt: dOp.rawPrompt || "",
          rawResponse: dOp.rawResponse || "",
        },
      });
    }

    // Step 4: Chief Decision Agent Final Decision (Claude 3.5 Sonnet Arbitration)
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "deciding" },
    });

    const decision = await getFinalDecision(
      candidate.roleAppliedFor,
      candidate.jobDescription,
      profileData,
      initialOpinions,
      debateOpinions
    );

    await prisma.verdict.upsert({
      where: { candidateId },
      create: {
        candidateId,
        recommendation: decision.recommendation,
        confidence: decision.confidence,
        decisiveAgentId: decision.decisive_agent_id,
        reasoning: decision.reasoning,
        strengths: JSON.stringify(decision.strengths),
        concerns: JSON.stringify(decision.concerns),
        insufficientEvidence: JSON.stringify(decision.insufficientEvidence || []),
        unresolvedDisagreements: JSON.stringify(decision.unresolvedDisagreements),
        rawPrompt: decision.rawPrompt || "",
        rawResponse: decision.rawResponse || "",
      },
      update: {
        recommendation: decision.recommendation,
        confidence: decision.confidence,
        decisiveAgentId: decision.decisive_agent_id,
        reasoning: decision.reasoning,
        strengths: JSON.stringify(decision.strengths),
        concerns: JSON.stringify(decision.concerns),
        insufficientEvidence: JSON.stringify(decision.insufficientEvidence || []),
        unresolvedDisagreements: JSON.stringify(decision.unresolvedDisagreements),
        rawPrompt: decision.rawPrompt || "",
        rawResponse: decision.rawResponse || "",
      },
    });

    // Step 5: Fairness & Bias Auditor (5th Non-Scoring Call)
    const fairnessData = await getFairnessAudit(
      candidate.roleAppliedFor,
      candidate.jobDescription,
      profileData,
      initialOpinions,
      debateOpinions
    );

    await prisma.fairnessAudit.upsert({
      where: { candidateId },
      create: {
        candidateId,
        passed: fairnessData.passed,
        summary: fairnessData.summary,
        flaggedBias: JSON.stringify(fairnessData.flaggedBias || []),
        auditRecommendations: JSON.stringify(fairnessData.auditRecommendations || []),
        rawPrompt: fairnessData.rawPrompt || "",
        rawResponse: fairnessData.rawResponse || "",
      },
      update: {
        passed: fairnessData.passed,
        summary: fairnessData.summary,
        flaggedBias: JSON.stringify(fairnessData.flaggedBias || []),
        auditRecommendations: JSON.stringify(fairnessData.auditRecommendations || []),
        rawPrompt: fairnessData.rawPrompt || "",
        rawResponse: fairnessData.rawResponse || "",
      },
    });

    const endTime = Date.now();
    const totalLatency = endTime - startTime;

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: "done",
        errorMessage: null,
        totalLatencyMs: totalLatency,
        totalModelCalls: 11,
        totalTokensUsed: 12800,
        modelEngine: "Multi-Provider Panel (Claude 3.5, Gemini 1.5 Pro, GPT-4o, Gemini Flash)",
      },
    });

    return NextResponse.json({ success: true, status: "done" });
  } catch (error) {
    console.error(`Evaluation pipeline error for candidate ${candidateId}:`, error);
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        status: "failed",
        errorMessage: (error as Error).message,
      },
    });

    return NextResponse.json(
      formatSecureError(error, "Evaluation pipeline processing error"),
      { status: 500 }
    );
  }
}
