"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, RefreshCw, Award, Sparkles } from "lucide-react";
import { listAllCurricula, CurriculumSummary } from "@/lib/api";

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
        console.warn("Failed to load curricula:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
            Student Portal &bull; Workflows 2 & 3
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Interactive Learning Chamber
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Learn with <strong>Aura</strong>, your empathetic Socratic tutor. Choose any live lesson from Firestore.
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/5">
          Student ID: <strong className="text-white">student_demo_101</strong>
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
          Loading live curricula from Firestore...
        </div>
      ) : lessons.length === 0 ? (
        <div className="folk-card p-12 text-center text-xs text-slate-500">
          No lessons found in Firestore. Generate one in Curriculum Studio first.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link
              key={lesson.package_id}
              href={`/student/lesson/${lesson.package_id}`}
              className="folk-card-interactive p-6 flex flex-col justify-between border border-white/10 group space-y-4 relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 font-semibold truncate max-w-[180px]">
                    {lesson.package_id}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {lesson.duration_minutes || 25}m
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {lesson.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1">
                  <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                    {lesson.target_age_group}
                  </span>
                  {lesson.has_diagram && (
                    <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">
                      Visual Diagram
                    </span>
                  )}
                  {lesson.question_count > 0 && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                      {lesson.question_count} Quizzes
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-cyan-400 group-hover:text-cyan-300">
                <span>Enter Lesson</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
