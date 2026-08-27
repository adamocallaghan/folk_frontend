"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  Database,
  Zap,
} from "lucide-react";
import { fetchHealth } from "@/lib/api";

export default function HomePage() {
  const [healthData, setHealthData] = useState<any>(null);
  const [pingStatus, setPingStatus] = useState<"connecting" | "online" | "offline">("connecting");

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealthData(data);
        setPingStatus("online");
      })
      .catch((err) => {
        console.warn("Backend ping error:", err);
        setPingStatus("offline");
      });
  }, []);

  const features = [
    {
      title: "Curriculum Generation Studio",
      description:
        "Multi-modal AI authoring pipeline that transforms teacher syllabi into structured frameworks, reading-level aligned text, Mermaid diagrams, quizzes, and SSML audio.",
      href: "/teacher/curriculum",
      workflowTag: "Workflow 1",
      icon: Sparkles,
      color: "from-indigo-500/20 via-indigo-500/5 to-transparent",
      borderColor: "group-hover:border-indigo-500/50",
      iconColor: "text-indigo-400",
      cta: "Launch Studio",
    },
    {
      title: "Interactive Socratic Tutoring",
      description:
        "Student delivery chamber with step-by-step chunked pacing, live Mermaid diagrams, and real-time Socratic hints powered by the empathetic tutor Aura.",
      href: "/student",
      workflowTag: "Workflow 2 & 3",
      icon: BookOpen,
      color: "from-cyan-500/20 via-cyan-500/5 to-transparent",
      borderColor: "group-hover:border-cyan-500/50",
      iconColor: "text-cyan-400",
      cta: "Start Learning",
    },
    {
      title: "Teacher Governance & HITL",
      description:
        "Educator analytics hub and collaborative AI strategist 'Athena'. Review longitudinal cognitive maps, friction points, and sign-off on formal remediation plans.",
      href: "/teacher/governance",
      workflowTag: "Workflow 4 HITL",
      icon: ShieldCheck,
      color: "from-purple-500/20 via-purple-500/5 to-transparent",
      borderColor: "group-hover:border-purple-500/50",
      iconColor: "text-purple-400",
      cta: "Open Governance",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-md">
          <Zap className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span>Folk Multi-Agent Educational Operating System</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Autonomous Pedagogical Ecosystem Powered by{" "}
          <span className="gradient-text-indigo">Google ADK & Gemini 3.7</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
          Orchestrating 4 specialized multi-agent workflows spanning curriculum synthesis, Socratic tutoring, longitudinal cognitive memory, and teacher human-in-the-loop governance.
        </p>

        {/* Live Cloud Run Status Pill */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2 text-slate-300">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>Firestore DB: <strong className="text-white">folk-agents-store</strong></span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Model: <strong className="text-white">{healthData?.model || "gemini-3.7-flash"}</strong></span>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Cloud Run: <strong>{pingStatus === "online" ? "Active (us-east1)" : "Connecting..."}</strong></span>
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Link
              key={i}
              href={f.href}
              className={`group glass-panel p-8 flex flex-col justify-between border border-white/10 ${f.borderColor} transition-all duration-300 hover:scale-[1.02] relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${f.color} pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity`} />
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${f.iconColor}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/5">
                    {f.workflowTag}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                  {f.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 relative z-10">
                <span>{f.cta}</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Architecture Highlights */}
      <div className="glass-panel p-8 border border-white/10 rounded-2xl bg-[#090d16]/70">
        <div className="flex items-center gap-3 mb-6">
          <Layers className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">
            System Workflow Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">Workflow 1</span>
            <h4 className="text-sm font-semibold text-white">Curriculum Synthesis</h4>
            <p className="text-xs text-slate-400">Sequential & Parallel sub-agents outputting Lexile text, diagrams, and quizzes.</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Workflow 2</span>
            <h4 className="text-sm font-semibold text-white">Student Socratic Delivery</h4>
            <p className="text-xs text-slate-400">Aura delivers lessons chunk-by-chunk and tracks real-time misconception signals.</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Workflow 3</span>
            <h4 className="text-sm font-semibold text-white">Longitudinal Memory</h4>
            <p className="text-xs text-slate-400">Ephemeral session evaluation synthesized into persistent cognitive profiles.</p>
          </div>

          <div className="rounded-xl bg-white/[0.02] p-4 border border-white/5 space-y-1.5">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Workflow 4</span>
            <h4 className="text-sm font-semibold text-white">Teacher HITL Governance</h4>
            <p className="text-xs text-slate-400">Athena copilot formulates remediation plans requiring human sign-off.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
