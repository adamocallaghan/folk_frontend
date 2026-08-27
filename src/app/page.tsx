'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { fetchHealth } from '@/lib/api';

export default function HomePage() {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealthData).catch(console.warn);
  }, []);

  const sections = [
    {
      title: 'Curriculum Studio',
      description: 'Author complete lesson plans with structured sections, conceptual diagrams, quizzes, and personalized student adaptations.',
      href: '/teacher/curriculum',
      label: 'Teacher Workspace',
      bgCard: 'bg-[#e9e2d5]',
      icon: Sparkles,
    },
    {
      title: 'Student Profiles',
      description: 'Configure reading difficulty flags, learning modalities, and teacher accommodations to guide adaptive curriculum synthesis.',
      href: '/teacher/students',
      label: 'Teacher Workspace',
      bgCard: 'bg-[#ebd4cc]',
      icon: Users,
    },
    {
      title: 'Student Lessons',
      description: 'Guided reading modules with step-by-step checks, visual diagrams, and an on-demand Socratic assistant.',
      href: '/student',
      label: 'Student Portal',
      bgCard: 'bg-[#cbd7c7]',
      icon: BookOpen,
    },
    {
      title: 'Teacher Governance',
      description: 'Review longitudinal student understanding, analyze recurring points of friction, and approve remediation interventions.',
      href: '/teacher/governance',
      label: 'Analytics & HITL',
      bgCard: 'bg-[#ebd9be]',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Header */}
      <div className="space-y-4 max-w-2xl border-b border-[#1a1714] pb-8">
        <span className="tag-ink">Pedagogical System</span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#1a1714] font-serif leading-tight">
          Adaptive Teaching & Tutoring
        </h1>
        <p className="text-base text-[#8a8075] leading-relaxed">
          Synthesize structured curricula, target individual student strengths, deliver interactive student lessons, and govern adaptive remediation plans.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <span className="tag-ink">DB: folk-agents-store</span>
          <span className="tag-ink">Model: {healthData?.model || 'gemini-3.7-flash'}</span>
          <span className="tag-ink">Cloud Run: us-east1</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={i}
              href={s.href}
              className={`p-6 flex flex-col justify-between border border-[#1a1714] ${s.bgCard} hover:shadow-[4px_4px_0px_0px_#1a1714] transition-all group`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#1a1714] text-[#f5f0e8]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1a1714]">
                    {s.label}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#1a1714] font-serif">{s.title}</h3>
                <p className="text-xs text-[#1a1714]/80 leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#1a1714] flex items-center justify-between text-xs font-bold text-[#1a1714]">
                <span>Open {s.title}</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
