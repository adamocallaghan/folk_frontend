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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Available Lessons
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Select a topic to start reading, view diagrams, and answer check-for-understanding questions.
          </p>
        </div>

        <span className="ui-tag">
          Student ID: <strong className="text-white">student_demo_101</strong>
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-[#71717a] flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-white" />
          <span>Loading lesson catalog...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="ui-panel p-12 text-center text-xs text-[#71717a]">
          No lessons found. Create a lesson in the Curriculum Studio first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <Link
              key={lesson.package_id}
              href={`/student/lesson/${lesson.package_id}`}
              className="ui-panel p-5 flex flex-col justify-between hover:border-[#3f3f46] hover:bg-[#18181b] transition-all group space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="ui-tag truncate max-w-[170px]">
                    {lesson.package_id}
                  </span>
                  <span className="text-[11px] text-[#71717a] flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" /> {lesson.duration_minutes || 25} min
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-white group-hover:text-white leading-snug">
                  {lesson.title}
                </h3>

                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-[#a1a1aa]">
                  <span className="ui-tag text-[#fafafa]">{lesson.target_age_group}</span>
                  {lesson.has_diagram && <span className="ui-tag">Diagram</span>}
                  {lesson.question_count > 0 && (
                    <span className="ui-tag">{lesson.question_count} Questions</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-medium text-white">
                <span>Start Lesson</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
