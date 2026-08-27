"use client";

import React from "react";
import { LongitudinalProfile } from "@/types";
import { Award, Brain, CheckCircle2, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

interface CognitiveRadarProps {
  profile: LongitudinalProfile;
}

export default function CognitiveRadar({ profile }: CognitiveRadarProps) {
  const masteryEntries = Object.entries(profile.mastery_map || {});

  return (
    <div className="glass-panel p-6 border border-white/10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">
              Cognitive Profile & Longitudinal Memory
            </h3>
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono text-indigo-400 border border-indigo-500/20">
              {profile.student_id}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Reading Level: <span className="text-slate-200 font-medium">{profile.reading_level}</span> | Total Sessions: <span className="text-slate-200 font-medium">{profile.total_sessions_completed}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 text-xs">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-300 font-medium">
            {profile.cognitive_growth_trend || "Active Growth"}
          </span>
        </div>
      </div>

      {/* Learning Style Affinities */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-indigo-400" /> Preferred Learning Affinities
        </h4>
        <div className="flex flex-wrap gap-2">
          {profile.learning_style_affinities?.map((aff, i) => (
            <span
              key={i}
              className="rounded-lg bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 border border-indigo-500/20 font-medium flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3 text-cyan-400" />
              {aff}
            </span>
          ))}
        </div>
      </div>

      {/* Mastery Map */}
      <div>
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-amber-400" /> Concept Mastery Tracker
        </h4>
        {masteryEntries.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No concept mastery entries recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {masteryEntries.map(([key, item]) => {
              const isMastered = item.mastery_percentage >= 80;
              const isRemediation = item.mastery_percentage < 60;
              return (
                <div key={key} className="rounded-lg bg-white/[0.02] p-3 border border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-200">
                      {item.concept_name}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isMastered
                          ? "text-emerald-400"
                          : isRemediation
                          ? "text-amber-400"
                          : "text-indigo-400"
                      }`}
                    >
                      {item.mastery_percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMastered
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : isRemediation
                          ? "bg-gradient-to-r from-amber-500 to-rose-400"
                          : "bg-gradient-to-r from-indigo-500 to-cyan-400"
                      }`}
                      style={{ width: `${item.mastery_percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recurrent Misconceptions & Scaffolding Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="rounded-xl bg-rose-500/5 p-4 border border-rose-500/15">
          <h5 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Friction Points & Misconceptions
          </h5>
          <ul className="space-y-1.5">
            {profile.recurrent_misconceptions?.map((m, i) => (
              <li key={i} className="text-xs text-rose-200/80 leading-relaxed flex items-start gap-1.5">
                <span className="text-rose-400 mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-indigo-500/5 p-4 border border-indigo-500/15">
          <h5 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active Scaffolding Directives
          </h5>
          <ul className="space-y-1.5">
            {profile.scaffolding_recommendations?.map((r, i) => (
              <li key={i} className="text-xs text-indigo-200/80 leading-relaxed flex items-start gap-1.5">
                <span className="text-indigo-400 mt-0.5">✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
