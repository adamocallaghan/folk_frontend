'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { listAllCurricula, CurriculumSummary } from '@/lib/api';

export default function StudentHubPage() {
  const [lessons, setLessons] = useState<CurriculumSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAllCurricula()
      .then((data) => {
        setLessons(data.curricula || []);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load lessons:', err);
        setLoading(false);
      });
  }, []);

  const bentoColors = ['bg-[#ebd9be]', 'bg-[#cbd7c7]', 'bg-[#ebd4cc]', 'bg-[#cbd9db]', 'bg-[#e9e2d5]'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a1714]">
        <div>
          <span className="tag-ink mb-1">Student Portal</span>
          <h1 className="text-3xl font-bold text-[#1a1714] font-serif tracking-tight mt-1">
            Available Lessons
          </h1>
          <p className="text-xs text-[#8a8075] mt-0.5">
            Select a lesson to start reading, view diagrams, and test your understanding.
          </p>
        </div>

        <span className="tag-ink">
          Student ID: <strong className="text-[#1a1714]">student_demo_101</strong>
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#8a8075] flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-[#1a1714]" />
          <span>Loading lesson catalog...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="paper-card p-12 text-center text-xs text-[#8a8075]">
          No lessons found. Create a lesson in Curriculum Studio first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, idx) => {
            const cardBg = bentoColors[idx % bentoColors.length];
            return (
              <Link
                key={lesson.package_id}
                href={`/student/lesson/${lesson.package_id}`}
                className={`p-5 flex flex-col justify-between border border-[#1a1714] ${cardBg} hover:shadow-[4px_4px_0px_0px_#1a1714] transition-all group space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="tag-ink truncate max-w-[170px]">
                      {lesson.package_id}
                    </span>
                    <span className="text-[11px] text-[#1a1714] flex items-center gap-1 font-mono font-medium">
                      <Clock className="h-3 w-3" /> {lesson.duration_minutes || 25} min
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#1a1714] font-serif leading-snug">
                    {lesson.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                    <span className="bg-[#1a1714] text-[#f5f0e8] px-1.5 py-0.5 font-mono">
                      {lesson.target_age_group}
                    </span>
                    {lesson.has_diagram && (
                      <span className="border border-[#1a1714] bg-[#f5f0e8] text-[#1a1714] px-1.5 py-0.5 font-mono">
                        Diagram
                      </span>
                    )}
                    {lesson.question_count > 0 && (
                      <span className="border border-[#1a1714] bg-[#f5f0e8] text-[#1a1714] px-1.5 py-0.5 font-mono">
                        {lesson.question_count} Questions
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1a1714] flex items-center justify-between text-xs font-bold text-[#1a1714]">
                  <span>Start Lesson</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
