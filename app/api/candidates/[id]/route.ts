import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: {
        profile: true,
        opinions: true,
        verdict: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate dossier not found" },
        { status: 404 }
      );
    }

    // Safely parse JSON strings stored in database for client consumption
    const formattedCandidate = {
      ...candidate,
      profile: candidate.profile
        ? {
            ...candidate.profile,
            topSkills: JSON.parse(candidate.profile.topSkills || "[]"),
            notableClaims: JSON.parse(candidate.profile.notableClaims || "[]"),
          }
        : null,
      opinions: candidate.opinions.map((op) => ({
        ...op,
        strengths: JSON.parse(op.strengths || "[]"),
        concerns: JSON.parse(op.concerns || "[]"),
        engagements: op.engagements ? JSON.parse(op.engagements) : null,
      })),
      verdict: candidate.verdict
        ? {
            ...candidate.verdict,
            strengths: JSON.parse(candidate.verdict.strengths || "[]"),
            concerns: JSON.parse(candidate.verdict.concerns || "[]"),
            unresolvedDisagreements: JSON.parse(
              candidate.verdict.unresolvedDisagreements || "[]"
            ),
          }
        : null,
    };

    return NextResponse.json(formattedCandidate);
  } catch (error) {
    console.error(`GET /api/candidates/${params.id} error:`, error);
    return NextResponse.json(
      { error: "Failed to retrieve candidate case file" },
      { status: 500 }
    );
  }
}
