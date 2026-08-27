'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { generateCurriculum, listAllCurricula, getCurriculumPackage, CurriculumSummary } from '@/lib/api';
import { LessonPackage, LessonSectionItem, AudioSegmentItem } from '@/types';
import MermaidViewer from '@/components/MermaidViewer';
import QuizCard from '@/components/QuizCard';

export default function CurriculumStudioPage() {
  const [curriculaList, setCurriculaList] = useState<CurriculumSummary[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [activePackage, setActivePackage] = useState<LessonPackage | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(false);

  // New Creation Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [topic, setTopic] = useState('Quantum Computing & Superposition Fundamentals');
  const [ageGroup, setAgeGroup] = useState('Grade 9-10 (14-16yo)');
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableSimplification, setEnableSimplification] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<'text' | 'diagram' | 'quiz' | 'audio' | 'simplified'>('text');

  const refreshList = async () => {
    setLoadingList(true);
    try {
      const res = await listAllCurricula();
      setCurriculaList(res.curricula || []);
      if (res.curricula && res.curricula.length > 0 && !selectedPkgId) {
        loadPackage(res.curricula[0].package_id);
      }
    } catch (err) {
      console.warn('Failed to load list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const loadPackage = async (pkgId: string) => {
    setSelectedPkgId(pkgId);
    setIsCreatingNew(false);
    setLoadingPackage(true);
    setError(null);
    try {
      const res = await getCurriculumPackage(pkgId);
      setActivePackage(res.curriculum);
    } catch (err: any) {
      console.error('Failed to load package:', err);
      setError(err.message || 'Failed to load package');
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);

    try {
      const res = await generateCurriculum({
        teacher_input: topic,
        target_age_group: ageGroup,
        enable_audio: enableAudio,
        enable_simplification: enableSimplification,
      });
      setActivePackage(res.curriculum);
      setSelectedPkgId(res.package_id);
      setIsCreatingNew(false);
      refreshList();
    } catch (err: any) {
      setError(err.message || 'Failed to generate curriculum');
    } finally {
      setGenerating(false);
    }
  };

  const resolvedSections: LessonSectionItem[] =
    activePackage?.primary_text?.sections ||
    activePackage?.primary_text?.main_content_sections ||
    [];

  const resolvedDiagrams =
    activePackage?.visuals?.diagrams ||
    activePackage?.visual_assets?.diagrams ||
    [];

  const resolvedChart =
    activePackage?.visuals?.mermaid_diagram_syntax ||
    activePackage?.visual_assets?.mermaid_diagram_syntax ||
    '';

  const resolvedQuestions = activePackage?.assessment?.questions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="ui-tag">Workflow 1 &bull; Autonomous Curriculum Authoring</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Curriculum Studio & Library</h1>
          <p className="text-xs text-[#a1a1aa]">
            Browse stored Firestore lesson modules or synthesize a new multi-modal pedagogical curriculum.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedPkgId(null);
          }}
          className="ui-btn-primary flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Curriculum</span>
        </button>
      </div>

      {/* Main Grid: Left Library Sidebar | Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Saved Library */}
        <div className="lg:col-span-4 ui-panel p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
            <h3 className="text-xs font-bold text-[#fafafa] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#a1a1aa]" />
              Stored Modules ({curriculaList.length})
            </h3>
            <button
              onClick={refreshList}
              className="text-[#a1a1aa] hover:text-white p-1 rounded hover:bg-[#18181b]"
              title="Refresh list"
            >
              <RefreshCw className={`h-3 w-3 ${loadingList ? 'animate-spin text-white' : ''}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-8 text-center text-xs text-[#71717a]">Loading modules...</div>
          ) : (
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {curriculaList.map((item) => {
                const isSelected = selectedPkgId === item.package_id && !isCreatingNew;
                return (
                  <button
                    key={item.package_id}
                    onClick={() => loadPackage(item.package_id)}
                    className={`w-full text-left p-3 rounded border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-white text-black border-white font-medium'
                        : 'bg-[#121215] border-[#27272a] text-[#fafafa] hover:bg-[#18181b]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-mono text-[10px] truncate max-w-[200px] ${isSelected ? 'text-black font-bold' : 'text-[#a1a1aa]'}`}>
                        {item.package_id}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 ${isSelected ? 'text-neutral-700' : 'text-[#71717a]'}`}>
                        <Clock className="h-2.5 w-2.5" /> {item.duration_minutes || 25}m
                      </span>
                    </div>

                    <h4 className="font-semibold line-clamp-1">{item.title}</h4>

                    <div className={`flex items-center gap-2 text-[10px] ${isSelected ? 'text-neutral-800' : 'text-[#71717a]'}`}>
                      <span>{item.target_age_group}</span>
                      {item.has_diagram && <span className="font-mono">&bull; Diagram</span>}
                      {item.question_count > 0 && <span className="font-mono">&bull; {item.question_count} Qs</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Creation Form OR Full Inspector */}
        <div className="lg:col-span-8">
          {isCreatingNew ? (
            /* Creation Form */
            <div className="ui-panel p-6 space-y-5">
              <div className="pb-3 border-b border-[#27272a]">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-white" /> Synthesize Curriculum Package
                </h2>
                <p className="text-xs text-[#a1a1aa]">
                  Runs the 4-stage sequential authoring pipeline on Google Cloud Run.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#fafafa] mb-1.5">Topic & Syllabus Notes</label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter lesson topic, raw notes, or syllabus outline..."
                    className="w-full rounded bg-[#18181b] border border-[#27272a] px-3 py-2.5 text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-[#3f3f46]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#fafafa] mb-1.5">Target Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full rounded bg-[#18181b] border border-[#27272a] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#3f3f46]"
                  >
                    <option value="Grade 5-6 (10-12yo)">Grade 5-6 (10-12yo) &bull; Elementary Foundation</option>
                    <option value="Grade 7-8 (12-14yo)">Grade 7-8 (12-14yo) &bull; Middle School Core</option>
                    <option value="Grade 9-10 (14-16yo)">Grade 9-10 (14-16yo) &bull; High School Introductory</option>
                    <option value="Grade 11-12 (16-18yo)">Grade 11-12 (16-18yo) &bull; Advanced Placement / IB</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#fafafa] cursor-pointer p-2.5 rounded bg-[#18181b] border border-[#27272a]">
                    <input
                      type="checkbox"
                      checked={enableAudio}
                      onChange={(e) => setEnableAudio(e.target.checked)}
                      className="rounded border-[#27272a] text-black focus:ring-0 h-4 w-4 bg-[#09090b]"
                    />
                    <span>Generate TTS Audio SSML</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#fafafa] cursor-pointer p-2.5 rounded bg-[#18181b] border border-[#27272a]">
                    <input
                      type="checkbox"
                      checked={enableSimplification}
                      onChange={(e) => setEnableSimplification(e.target.checked)}
                      className="rounded border-[#27272a] text-black focus:ring-0 h-4 w-4 bg-[#09090b]"
                    />
                    <span>Generate Simplified Lexile</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={generating} className="ui-btn-primary flex-1">
                    {generating ? 'Synthesizing on Cloud Run...' : 'Generate Full Curriculum Package'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (curriculaList.length > 0) loadPackage(curriculaList[0].package_id);
                    }}
                    className="ui-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {generating && (
                <div className="p-3.5 rounded bg-[#18181b] border border-[#27272a] flex items-center gap-2 text-xs text-white">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Executing Pipeline on Google Cloud Run...</span>
                </div>
              )}
            </div>
          ) : loadingPackage ? (
            <div className="ui-panel p-16 text-center text-xs text-[#71717a]">Loading module from Firestore...</div>
          ) : activePackage ? (
            /* Full Package Inspector */
            <div className="ui-panel p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#27272a]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="ui-tag">{selectedPkgId}</span>
                    <span className="text-xs text-[#a1a1aa]">
                      Target: <strong className="text-white">{activePackage.framework?.target_age_group || activePackage.target_age_group || 'Grade 7-8'}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {activePackage.primary_text?.lesson_title || activePackage.framework?.topic || activePackage.topic}
                  </h2>
                </div>

                <span className="ui-tag text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Firestore Synced
                </span>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 p-1 rounded bg-[#18181b] border border-[#27272a] text-xs font-medium">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'text' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Lesson Prose ({resolvedSections.length} Sections)
                </button>
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'diagram' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Visual Diagrams ({resolvedDiagrams.length > 0 ? resolvedDiagrams.length : (resolvedChart ? 1 : 0)})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'quiz' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
                  }`}
                >
                  Quizzes ({resolvedQuestions.length})
                </button>
                {(activePackage.audio || activePackage.audio_package) && (
                  <button
                    onClick={() => setActiveTab('audio')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      activeTab === 'audio' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    Audio SSML
                  </button>
                )}
                {activePackage.simplified_variation && (
                  <button
                    onClick={() => setActiveTab('simplified')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      activeTab === 'simplified' ? 'bg-white text-black font-semibold' : 'text-[#a1a1aa] hover:text-white'
                    }`}
                  >
                    Simplified Lexile
                  </button>
                )}
              </div>

              {/* Tab 1: Lesson Prose */}
              {activeTab === 'text' && (
                <div className="space-y-5 text-xs text-[#fafafa] leading-relaxed">
                  {activePackage.framework?.pedagogical_hook && (
                    <div className="p-4 rounded bg-[#18181b] border border-[#27272a]">
                      <h4 className="font-bold text-white mb-1">Pedagogical Hook:</h4>
                      <p className="text-[#a1a1aa]">{activePackage.framework.pedagogical_hook}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.introduction && (
                    <div className="p-4 rounded bg-[#18181b] border border-[#27272a] space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">Introduction</h4>
                      <p className="text-[#fafafa] text-sm leading-relaxed">{activePackage.primary_text.introduction}</p>
                    </div>
                  )}

                  {/* All Core Sections */}
                  {resolvedSections.map((sec, idx) => {
                    const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                    const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                    const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                    return (
                      <div key={idx} className="p-5 rounded bg-[#18181b] border border-[#27272a] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-white">{secTitle}</h3>
                          {sec.estimated_minutes && (
                            <span className="text-[10px] font-mono text-[#71717a]">{sec.estimated_minutes} min</span>
                          )}
                        </div>

                        <div className="text-[#fafafa] leading-relaxed whitespace-pre-wrap">{secBody}</div>

                        {sec.key_concepts && sec.key_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {sec.key_concepts.map((kc, i) => (
                              <span key={i} className="ui-tag">
                                #{kc}
                              </span>
                            ))}
                          </div>
                        )}

                        {checkpoint && (
                          <div className="p-3 rounded bg-[#121215] border border-[#3f3f46] text-white font-medium">
                            <strong>Checkpoint:</strong> {checkpoint}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activePackage.primary_text?.conclusion && (
                    <div className="p-4 rounded bg-[#18181b] border border-[#27272a] space-y-1">
                      <h4 className="font-bold text-white text-xs uppercase tracking-wider">Conclusion</h4>
                      <p className="text-[#fafafa] text-sm leading-relaxed">{activePackage.primary_text.conclusion}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Visual Diagrams */}
              {activeTab === 'diagram' && (
                <div>
                  <MermaidViewer
                    chart={resolvedChart}
                    diagrams={resolvedDiagrams}
                    caption={activePackage.visuals?.diagram_caption || activePackage.visual_assets?.diagram_caption}
                  />
                </div>
              )}

              {/* Tab 3: Quizzes */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">
                      {activePackage.assessment?.quiz_title || 'Assessment Checkpoints'}
                    </h3>
                    <span className="text-xs text-[#a1a1aa] font-mono">
                      Passing: {activePackage.assessment?.passing_score || 80}%
                    </span>
                  </div>

                  {resolvedQuestions.length > 0 ? (
                    resolvedQuestions.map((q, idx) => (
                      <QuizCard key={q.question_id || q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#71717a] ui-panel">
                      No quiz questions generated for this module.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Audio Script */}
              {activeTab === 'audio' && (
                <div className="space-y-3 font-mono text-xs">
                  {((activePackage.audio?.segments || activePackage.audio_package?.segments || []) as AudioSegmentItem[]).map(
                    (seg, i) => (
                      <div key={i} className="p-3 rounded bg-[#18181b] border border-[#27272a] space-y-1">
                        <div className="flex items-center justify-between text-white font-semibold text-[11px]">
                          <span>Speaker: {seg.speaker_role || 'Tutor'}</span>
                          <span className="text-[#71717a]">{seg.voice_tone || 'Standard'}</span>
                        </div>
                        <p className="text-[#a1a1aa] font-sans text-xs">{seg.ssml_content}</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tab 5: Simplified Variation */}
              {activeTab === 'simplified' && activePackage.simplified_variation && (
                <div className="space-y-4">
                  <div className="p-3 rounded bg-[#18181b] border border-[#27272a] text-xs">
                    Simplified Lexile: <strong className="text-white">{activePackage.simplified_variation.simplified_lexile_level}</strong>
                  </div>
                  <div className="p-5 rounded bg-[#18181b] border border-[#27272a] text-xs text-[#fafafa] leading-relaxed whitespace-pre-wrap">
                    {activePackage.simplified_variation.simplified_text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="ui-panel p-16 text-center text-xs text-[#71717a]">
              Select a curriculum module from the library on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
