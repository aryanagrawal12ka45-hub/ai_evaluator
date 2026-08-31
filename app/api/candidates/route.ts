import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeText, formatSecureError } from "@/lib/security";

const CARGONET_JD_DEFAULT = `JOB DESCRIPTION: AI Engineer — Agentic Systems (Freight Operations) at Cargonet AI
Role improves a live planner/executor/reviewer multi-agent system for freight ops (quoting, booking, tracking, doc processing, error handling). Needs: solid Python backend/API skills; real hands-on LLM experience (prompting, RAG/vector search, eval); comfortable owning production breakage, not just demos; basic React. Explicitly NOT a "build once and walk away" role — long-term reliability ownership matters as much as v1 velocity.`;

export async function GET() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        verdict: {
          select: {
            recommendation: true,
            confidence: true,
          },
        },
      },
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error("GET /api/candidates error:", error);
    return NextResponse.json(
      formatSecureError(error, "Failed to fetch candidate database"),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { name, roleAppliedFor, jobDescription, resumeText, transcriptText, portfolioText, modelEngine } = body;

    // Sanitize and validate inputs
    name = sanitizeText(name, 150);
    roleAppliedFor = sanitizeText(roleAppliedFor, 150);
    jobDescription = sanitizeText(jobDescription, 20000);
    resumeText = sanitizeText(resumeText, 50000);
    transcriptText = sanitizeText(transcriptText, 50000);
    portfolioText = sanitizeText(portfolioText, 20000);
    modelEngine = sanitizeText(modelEngine, 50);

    if (!name || !roleAppliedFor || !resumeText || !transcriptText) {
      return NextResponse.json(
        { error: "Missing or invalid required candidate intake fields" },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        roleAppliedFor,
        jobDescription: jobDescription || CARGONET_JD_DEFAULT,
        resumeText,
        transcriptText,
        portfolioText: portfolioText || "",
        modelEngine: modelEngine || "claude-3-5-sonnet",
        status: "pending",
      },
    });

    return NextResponse.json({ id: candidate.id, status: candidate.status }, { status: 201 });
  } catch (error) {
    console.error("POST /api/candidates error:", error);
    return NextResponse.json(
      formatSecureError(error, "Failed to create candidate record"),
      { status: 500 }
    );
  }
}

