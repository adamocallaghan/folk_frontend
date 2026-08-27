'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchHealth } from '@/lib/api';

export default function HomePage() {
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealthData).catch(console.warn);
  }, []);

  const sections = [
    {
      title: 'Curriculum Studio',
      description: 'Generate complete, grade-appropriate lesson plans with reading materials, diagrams, and quizzes from your notes or syllabus.',
      href: '/teacher/curriculum',
      label: 'Teacher',
      icon: Sparkles,
    },
    {
      title: 'Student Lessons',
      description: 'Interactive reading modules with visual diagrams, step-by-step checks, and an on-demand tutor to answer questions.',
      href: '/student',
      label: 'Student',
      icon: BookOpen,
    },
    {
      title: 'Teacher Governance',
      description: 'Review student comprehension profiles, identify recurring knowledge gaps, and approve targeted remediation strategies.',
      href: '/teacher/governance',
      label: 'Teacher',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <div className="space-y-3 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
          Folk Learning System
        </h1>
        <p className="text-sm text-[#a1a1aa] leading-relaxed">
          An adaptive teaching and tutoring workspace. Build structured curricula, guide student practice, and review student progress with AI assistance.
        </p>

        <div className="flex flex-wrap gap-2 pt-2 text-xs">
          <span className="ui-tag text-white">Database: Connected</span>
          <span className="ui-tag text-white">Model: {healthData?.model || 'gemini-3.7-flash'}</span>
          <span className="ui-tag text-emerald-400">Status: Operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {sections.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link
              key={i}
              href={s.href}
              className="ui-panel p-6 flex flex-col justify-between hover:border-[#3f3f46] hover:bg-[#18181b] transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#18181b] border border-[#27272a] text-white">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="ui-tag">{s.label}</span>
                </div>

                <h3 className="text-base font-semibold text-white">{s.title}</h3>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">{s.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#27272a] flex items-center justify-between text-xs font-medium text-white">
                <span>Open {s.title}</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
