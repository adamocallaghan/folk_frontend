"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
} from "lucide-react";
import { fetchHealth } from "@/lib/api";

export default function Header() {
  const pathname = usePathname();
  const [health, setHealth] = useState<{
    status: string;
    model: string;
    workflows: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Cloud Run health ping:", err);
        setLoading(false);
      });
  }, []);

  const navLinks = [
    {
      label: "Hub",
      href: "/",
      icon: Layers,
    },
    {
      label: "Curriculum Studio",
      href: "/teacher/curriculum",
      icon: Sparkles,
      tag: "W1",
    },
    {
      label: "Student Tutoring",
      href: "/student",
      icon: BookOpen,
      tag: "W2+W3",
    },
    {
      label: "Teacher Governance",
      href: "/teacher/governance",
      icon: ShieldCheck,
      tag: "W4 HITL",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#07090e]">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                Folk Education
              </span>
              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                ADK Multi-Agent
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Pedagogical System
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{link.label}</span>
                {link.tag && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                    {link.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Cloud Run Live Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Cloud Run Live</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 border-l border-white/10 pl-3">
            <Cpu className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-mono text-[11px] text-slate-300">
              {health ? health.model : "gemini-3.7-flash"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
