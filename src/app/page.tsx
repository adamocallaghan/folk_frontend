'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, ShieldCheck, ArrowRight, Database, Cpu, CheckCircle2 } from 'lucide-react';
import { fetchHealth } from '@/lib/api';

export default function HomePage() {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealthData).catch(console.warn);
  }, []);

  const features = [
    {
      title: 'Curriculum Generation Studio',
      description: 'Multi-modal authoring pipeline translating raw teacher notes into structured frameworks, Lexile-aligned prose, Mermaid diagrams, and quizzes.',
      href: '/teacher/curriculum',
      tag: 'Workflow 1',
      icon: Sparkles,
    },
    {
      title: 'Student Socratic Tutoring',
      description: 'Step-by-step reading chamber with real-time empathetic guidance, interactive visual diagrams, and instant Socratic hints by Aura.',
      href: '/student',
      tag: 'Workflow 2 & 3',
      icon: BookOpen,
    },
    {
      title: 'Teacher Governance & HITL',
      description: 'Cognitive analytics hub with AI strategist Athena. Review longitudinal friction maps and sign-off on remediation intervention rules.',
      href: '/teacher/governance',
      tag: 'Workflow 4',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero */}
      <div className="space-y-4 max-w-2xl">
        <div className="ui-tag">Autonomous Multi-Agent Educational Platform</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
          Pedagogical Multi-Agent Ecosystem Powered by Google ADK & Gemini 3.7
        </h1>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">
          Orchestrating 4 autonomous workflows across curriculum synthesis, Socratic tutoring, longitudinal memory, and teacher governance.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <span className="ui-tag text-white">Firestore: folk-agents-store</span>
          <span className="ui-tag text-white">Model: {healthData?.model || 'gemini-3.7-flash'}</span>
          <span className="ui-tag text-emerald-400">Cloud Run: us-east1</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <Link
              key={i}
              href={f.href}
              className="ui-panel p-6 flex flex-col justify-between hover:border-[#3f3f46] hover:bg-[#18181b] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#18181b] border border-[#27272a] text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="ui-tag">{f.tag}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-white transition-colors">{f.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{f.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#27272a] flex items-center justify-between text-xs font-semibold text-white">
                <span>Open Workspace</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
