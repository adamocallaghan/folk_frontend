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
    <div className="border border-[#1a1714] bg-[#ffffff] p-5 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a1714]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#1a1714] font-serif">Student Progress Profile</h3>
            <span className="tag-ink">{profile.student_id}</span>
          </div>
          <p className="text-xs text-[#8a8075] mt-0.5">
            Reading Level: <strong className="text-[#1a1714]">{profile.reading_level}</strong> &bull; Sittings: <strong className="text-[#1a1714]">{profile.total_sessions_completed}</strong>
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#cbd7c7] border border-[#1a1714] text-xs text-[#1a1714] font-bold">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>{profile.cognitive_growth_trend || 'Active Progress'}</span>
        </div>
      </div>

      {/* Concept Mastery Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider font-mono">Concept Mastery Index</h4>
        <div className="space-y-2">
          {masteryEntries.map(([key, item]) => (
            <div key={key} className="p-3 bg-[#f5f0e8] border border-[#1a1714] space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a1714] font-serif">{item.concept_name || key}</span>
                <span className="font-mono text-xs font-bold text-[#1a1714]">{item.mastery_percentage}%</span>
              </div>
              <div className="h-2 w-full border border-[#1a1714] bg-[#ffffff] overflow-hidden">
                <div
                  className="h-full bg-[#1a1714]"
                  style={{ width: `${Math.min(100, Math.max(5, item.mastery_percentage))}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#8a8075] font-mono">
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
          <h4 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <AlertTriangle className="h-3.5 w-3.5 text-[#c84b2f]" /> Common Areas for Review
          </h4>
          <div className="space-y-1.5">
            {profile.recurrent_misconceptions.map((m, i) => (
              <div key={i} className="p-3 bg-[#ebd4cc] border border-[#1a1714] text-xs text-[#1a1714] leading-relaxed">
                {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Style Affinities */}
      {profile.learning_style_affinities && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider font-mono">Effective Teaching Strategies</h4>
          <div className="flex flex-wrap gap-1.5">
            {profile.learning_style_affinities.map((aff, i) => (
              <span key={i} className="tag-ink">
                {aff}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
