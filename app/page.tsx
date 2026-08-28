import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StampBadge3D } from "@/components/3d/StampBadge3D";
import { TiltCard } from "@/components/TiltCard";
import {
  FolderGit2,
  PlusCircle,
  Scale,
  ShieldCheck,
  Award,
  Users,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const revalidate = 0;

export default async function DashboardPage() {
  const candidates = await prisma.candidate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      profile: true,
      verdict: true,
      opinions: true,
    },
  });

  const totalCases = candidates.length;
  const hiresCount = candidates.filter((c) => c.verdict?.recommendation === "Hire").length;
  const notHiresCount = candidates.filter((c) => c.verdict?.recommendation === "Not hire" || c.verdict?.recommendation === "No hire").length;

  return (
    <div className="space-y-10 text-[#E8E4D8] max-w-7xl mx-auto py-2">
      {/* Hero Banner */}
      <div className="precinct-card p-8 md:p-10 rounded-md bg-[#232830] border-white/10 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-[#3E7CB1] text-[#E8E4D8] text-xs font-mono font-bold px-3 py-1 rounded uppercase flex items-center gap-1.5 shadow-md">
                <ShieldCheck className="w-4 h-4 text-[#E8E4D8]" /> CONFIDENTIAL DOSSIER SYSTEM
              </span>
              <span className="bg-[#15181C] text-white/70 text-xs font-mono px-3 py-1 rounded border border-white/10">
                Claude 3.5 Sonnet Engine
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-[#E8E4D8] tracking-tight uppercase leading-none">
              The Panel — AI Hiring Simulator
            </h1>
            <p className="text-white/80 text-sm md:text-base font-body leading-relaxed">
              Multi-Agent Judicial Hiring Tribunal evaluating freight engineering candidates through 4 isolated agent lenses, inspectable debate cross-examination, and court magistrate decrees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/compare"
              className="precinct-btn text-xs px-5 py-3.5 flex items-center justify-center gap-2 border-[#D4A537] text-[#D4A537]"
            >
              <Scale className="w-4 h-4 text-[#D4A537]" />
              <span>Compare Candidates</span>
            </Link>

            <Link
              href="/new"
              className="precinct-btn-primary text-xs px-6 py-3.5 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 fill-[#E8E4D8]" />
              <span>Open New Candidate Case</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 font-mono text-xs relative z-10">
          <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px] uppercase font-bold">Total Docket Cases</span>
            <p className="text-2xl font-bold text-[#E8E4D8]">{totalCases} Cases</p>
          </div>
          <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px] uppercase font-bold">Decreed Hires</span>
            <p className="text-2xl font-bold text-[#3E7CB1]">{hiresCount} Decreed</p>
          </div>
          <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px] uppercase font-bold">Decreed Not Hires</span>
            <p className="text-2xl font-bold text-[#C4432B]">{notHiresCount} Decreed</p>
          </div>
          <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1">
            <span className="text-white/50 text-[10px] uppercase font-bold">Panel Concurrency</span>
            <p className="text-2xl font-bold text-[#D4A537]">4 AI Agents</p>
          </div>
        </div>
      </div>

      {/* Case Archive List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#D4A537]" />
            <h2 className="text-2xl font-display font-bold text-[#E8E4D8] uppercase tracking-tight">
              Confidential Case Files Archive
            </h2>
          </div>
          <span className="text-xs font-mono text-white/50 font-medium uppercase">
            Showing {candidates.length} Registered Docket Cases
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {candidates.map((candidate) => {
            const profile = candidate.profile;
            const verdict = candidate.verdict;
            const topSkills = profile?.topSkills ? JSON.parse(profile.topSkills) : [];

            return (
              <TiltCard key={candidate.id} maxTilt={3} perspective={1200}>
                <div className="precinct-card p-6 md:p-7 space-y-6 group hover:border-[#D4A537]/50 transition-all">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[#D4A537] uppercase tracking-widest block font-medium">
                        Case #{candidate.id.slice(-6).toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-display font-bold text-[#E8E4D8] group-hover:text-[#D4A537] transition-colors">
                        {candidate.name}
                      </h3>
                      <p className="text-xs font-mono text-white/70">
                        {candidate.roleAppliedFor}
                      </p>
                    </div>

                    <div>
                      <StampBadge3D
                        recommendation={verdict?.recommendation || "Hire"}
                        size="sm"
                        animate={false}
                      />
                    </div>
                  </div>

                  {/* Career Extract Preview */}
                  <div className="space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#15181C] p-3 rounded border border-white/10">
                        <span className="text-white/50 block text-[10px]">Tenure / Experience</span>
                        <span className="text-sm font-bold text-[#E8E4D8]">
                          {profile?.yearsExperience ? `${profile.yearsExperience} Years` : "4 Years"}
                        </span>
                      </div>
                      <div className="bg-[#15181C] p-3 rounded border border-white/10">
                        <span className="text-white/50 block text-[10px]">Model Engine</span>
                        <span className="text-xs font-bold text-[#3E7CB1]">Claude 3.5 Sonnet</span>
                      </div>
                    </div>

                    {topSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topSkills.slice(0, 4).map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-[#15181C] text-white/80 text-[10px] font-mono px-2.5 py-1 rounded border border-white/10 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verdict Preview Box */}
                  {verdict && (
                    <div className="bg-[#15181C] p-4 rounded border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#D4A537] uppercase tracking-widest block">
                        Chief Magistrate Rationale
                      </span>
                      <p className="text-xs font-body text-[#E8E4D8] line-clamp-2 leading-relaxed">
                        {verdict.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Card Action Footer */}
                  <div className="pt-2">
                    <Link
                      href={`/candidates/${candidate.id}`}
                      className="precinct-btn w-full p-3 text-xs flex items-center justify-between"
                    >
                      <span>Inspect Candidate Dossier</span>
                      <ArrowRight className="w-4 h-4 text-[#D4A537]" />
                    </Link>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
