'use client';

import React from 'react';
import { LongitudinalProfile } from '@/types';
import { Award, Brain, CheckCircle2, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';

interface CognitiveRadarProps {
  profile: LongitudinalProfile;
}

export default function CognitiveRadar({ profile }: CognitiveRadarProps) {
  const masteryEntries = Object.entries(profile.mastery_map || {});

  return (
    <div className="ui-panel p-5 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Student Longitudinal Memory</h3>
            <span className="ui-tag">{profile.student_id}</span>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Reading Level: <strong className="text-white">{profile.reading_level}</strong> &bull; Sittings: <strong className="text-white">{profile.total_sessions_completed}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181b] border border-[#27272a] text-xs text-emerald-400">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{profile.cognitive_growth_trend || 'Active Progress'}</span>
        </div>
      </div>

      {/* Concept Mastery Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Concept Mastery Index</h4>
        <div className="space-y-2">
          {masteryEntries.map(([key, item]) => (
            <div key={key} className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{item.concept_name || key}</span>
                <span className="font-mono text-xs font-bold text-emerald-400">{item.mastery_percentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#27272a] overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.min(100, Math.max(5, item.mastery_percentage))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                <span>Status: {item.status}</span>
                <span>Attempts: {item.attempts}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recurrent Misconceptions */}
      {profile.recurrent_misconceptions && profile.recurrent_misconceptions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Detected Misconception Signals
          </h4>
          <div className="space-y-1.5">
            {profile.recurrent_misconceptions.map((m, i) => (
              <div key={i} className="p-3 rounded bg-[#18181b] border border-amber-500/20 text-xs text-[#fafafa] leading-relaxed">
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Style Affinities */}
      {profile.learning_style_affinities && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wider">Preferred Pedagogical Scaffolds</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.learning_style_affinities.map((aff, i) => (
              <span key={i} className="ui-tag text-white">
                {aff}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
