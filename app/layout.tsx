import type { Metadata } from "next";
import Link from "next/link";
import { FolderGit2, PlusCircle, Scale, Shield } from "lucide-react";
import { ArchivistWidget } from "@/components/ArchivistWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Panel — AI Hiring Panel Simulator & Case File Database",
  description: "Multi-agent confidential hiring panel evaluator for freight operations systems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#15181C] text-[#E8E4D8] min-h-screen font-sans selection:bg-[#D4A537] selection:text-[#15181C]">
        <header className="border-b border-white/10 bg-[#15181C]/90 backdrop-blur-xl sticky top-0 z-50 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded bg-[#D4A537] text-[#15181C] font-display font-bold text-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                CF
              </div>
              <div>
                <h1 className="font-display font-bold text-lg md:text-xl text-[#E8E4D8] tracking-tight flex items-center gap-2 group-hover:text-[#D4A537] transition-colors">
                  CANDIDATE CASE FILE <span className="bg-[#D4A537] text-[#15181C] text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">CONFIDENTIAL</span>
                </h1>
                <p className="text-[11px] font-mono text-white/60">
                  The Panel — Multi-Agent AI Hiring Panel Simulator
                </p>
              </div>
            </Link>

            <nav className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-mono font-medium uppercase text-white/80 hover:text-[#D4A537] px-3 py-2 rounded transition-colors"
              >
                <FolderGit2 className="w-4 h-4 text-[#D4A537]" />
                <span className="hidden sm:inline">Case Archive</span>
              </Link>

              <Link
                href="/compare"
                className="flex items-center gap-1.5 text-xs font-mono font-medium uppercase bg-[#232830] border border-white/10 text-[#D4A537] hover:border-[#D4A537] px-3.5 py-2 rounded transition-all"
              >
                <Scale className="w-4 h-4 text-[#D4A537]" />
                <span className="hidden sm:inline">Compare Candidates</span>
              </Link>

              <Link
                href="/new"
                className="flex items-center gap-2 bg-[#3E7CB1] text-[#E8E4D8] text-xs font-mono font-medium uppercase tracking-wider px-4 py-2 rounded shadow-xl hover:bg-[#326490] transition-all"
              >
                <PlusCircle className="w-4 h-4 fill-[#E8E4D8]" />
                <span>Open New Case</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* 6th Meta-Agent: The Archivist Session Memory Widget */}
        <ArchivistWidget judgeMode={true} />

        <footer className="border-t border-white/10 bg-[#15181C] py-6 text-center font-mono text-xs text-white/50 space-y-1">
          <p className="font-bold text-white/70">CONFIDENTIAL HIRING EVALUATION DOSSIER — AUTHORIZED ACCESS ONLY</p>
          <p className="text-[#D4A537]">6-Agent Judicial Pipeline (4 Panel + 1 Fairness Auditor + 1 Archivist Meta-Agent) • Claude 3.5 Sonnet</p>
        </footer>
      </body>
    </html>
  );
}
