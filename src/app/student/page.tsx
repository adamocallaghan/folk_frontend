'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowRight, Clock, RefreshCw, UserCheck } from 'lucide-react';
import { listAllCurricula, listStudentProfiles, CurriculumSummary } from '@/lib/api';
import { LongitudinalProfile } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export default function StudentHubPage() {
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [lessons, setLessons] = useState<CurriculumSummary[]>([]);
  const [students, setStudents] = useState<LongitudinalProfile[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('g1_sarah_jenkins');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('folk_active_student_id');
    if (saved) setActiveStudentId(saved);

    Promise.all([
      listAllCurricula().catch(() => ({ curricula: [] })),
      listStudentProfiles().catch(() => ({ profiles: [] })),
    ])
      .then(([curriculaRes, studentsRes]) => {
        setLessons(curriculaRes.curricula || []);
        const profs = studentsRes.profiles || [];
        setStudents(profs);
        if (profs.length > 0 && !saved) {
          setActiveStudentId(profs[0].student_id);
          localStorage.setItem('folk_active_student_id', profs[0].student_id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load hub data:', err);
        setLoading(false);
      });
  }, []);

  const handleStudentChange = (id: string) => {
    setActiveStudentId(id);
    localStorage.setItem('folk_active_student_id', id);
  };

  const bentoColors = ['bg-[#ebd9be]', 'bg-[#cbd7c7]', 'bg-[#ebd4cc]', 'bg-[#cbd9db]', 'bg-[#e9e2d5]'];
  const activeStudentObj = students.find((s) => s.student_id === activeStudentId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
        <div>
          {!isRefined && <span className="tag-ink mb-1">Student Portal</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1714] font-serif tracking-tight">
            Available Lessons
          </h1>
          <p className="text-xs sm:text-sm text-[#8a8075] mt-1">
            Interactive reading modules with step-by-step checks, visual diagrams, and an on-demand tutor.
          </p>
        </div>

        {/* Student Switcher */}
        <div className="flex flex-col sm:items-end gap-1">
          <label className="text-xs font-semibold text-[#1a1714] flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" /> Simulating Student:
          </label>
          <select
            value={activeStudentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="border border-[#1a1714]/30 bg-[#ffffff] px-3 py-1.5 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
          >
            {students.length > 0 ? (
              students.map((st) => (
                <option key={st.student_id} value={st.student_id}>
                  {st.display_name || st.student_id} &bull; {st.reading_level || 'Grade 7-8'}
                </option>
              ))
            ) : (
              <option value="student_demo_101">student_demo_101</option>
            )}
          </select>
        </div>
      </div>

      {activeStudentObj && (
        <div className={isRefined ? 'p-3.5 bg-[#ffffff] border border-[#1a1714]/15 flex flex-wrap items-center justify-between gap-2 text-xs shadow-sm' : 'p-3 bg-[#e9e2d5] border border-[#1a1714] flex flex-wrap items-center justify-between gap-2 text-xs'}>
          <div className="flex items-center gap-2 font-medium">
            <span>Reading as: <strong className="font-serif text-sm">{activeStudentObj.display_name || activeStudentObj.student_id}</strong></span>
            <span className={isRefined ? 'text-[#8a8075]' : 'tag-ink'}>({activeStudentObj.reading_level || 'Grade 7-8'})</span>
          </div>
          {activeStudentObj.reading_difficulty_flags && activeStudentObj.reading_difficulty_flags.length > 0 && (
            <div className="text-xs text-[#c84b2f]">
              Accommodations: {activeStudentObj.reading_difficulty_flags.join(', ')}
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-[#8a8075] flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-[#1a1714]" />
          <span>Loading lesson catalog...</span>
        </div>
      ) : lessons.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#8a8075]">
          No lessons found. Create a lesson in Curriculum Studio first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson, idx) => {
            const cardBg = bentoColors[idx % bentoColors.length];

            if (isRefined) {
              return (
                <Link
                  key={lesson.package_id}
                  href={`/student/lesson/${lesson.package_id}`}
                  className="p-6 flex flex-col justify-between bg-[#ffffff] border border-[#1a1714]/15 hover:border-[#1a1714] transition-all group space-y-4 shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#8a8075]">
                      <span>{lesson.target_age_group}</span>
                      <span className="flex items-center gap-1 font-sans">
                        <Clock className="h-3 w-3" /> {lesson.duration_minutes || 25} min
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#1a1714] font-serif leading-snug">
                      {lesson.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#8a8075]">
                      {lesson.has_diagram && <span>Diagram included</span>}
                      {lesson.question_count > 0 && (
                        <span>&bull; {lesson.question_count} Questions</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1a1714]/10 flex items-center justify-between text-xs font-semibold text-[#1a1714]">
                    <span>Start Lesson</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform text-[#c84b2f]" />
                  </div>
                </Link>
              );
            }

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
