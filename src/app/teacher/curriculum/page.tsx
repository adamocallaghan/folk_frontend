'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  FileText,
  HelpCircle,
  Volume2,
  Layers,
  ChevronRight,
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
  const [generationStep, setGenerationStep] = useState<number>(0);
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
    setGenerationStep(1);

    const timer = setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await generateCurriculum({
        teacher_input: topic,
        target_age_group: ageGroup,
        enable_audio: enableAudio,
        enable_simplification: enableSimplification,
      });
      clearInterval(timer);
      setGenerationStep(5);
      setActivePackage(res.curriculum);
      setSelectedPkgId(res.package_id);
      setIsCreatingNew(false);
      refreshList();
    } catch (err: any) {
      clearInterval(timer);
      setError(err.message || 'Failed to generate curriculum');
    } finally {
      setGenerating(false);
    }
  };

  // Resolve sections regardless of schema key
  const resolvedSections: LessonSectionItem[] =
    activePackage?.primary_text?.sections ||
    activePackage?.primary_text?.main_content_sections ||
    [];

  // Resolve diagram list
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-tag text-indigo-400">Workflow 1 &bull; Autonomous Curriculum Authoring</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Curriculum Studio & Library</h1>
          <p className="text-xs text-slate-400">
            Browse stored Firestore lesson modules or synthesize a new multi-modal pedagogical curriculum.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedPkgId(null);
          }}
          className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Curriculum</span>
        </button>
      </div>

      {/* Main Grid: Left Library Sidebar (340px) | Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Saved Library */}
        <div className="lg:col-span-4 panel p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              Stored Modules ({curriculaList.length})
            </h3>
            <button
              onClick={refreshList}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Refresh list"
            >
              <RefreshCw className={`h-3 w-3 ${loadingList ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading modules...</div>
          ) : (
            <div className="space-y-1.5 max-h-[640px] overflow-y-auto pr-1">
              {curriculaList.map((item) => {
                const isSelected = selectedPkgId === item.package_id && !isCreatingNew;
                return (
                  <button
                    key={item.package_id}
                    onClick={() => loadPackage(item.package_id)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] text-indigo-400 font-semibold truncate max-w-[200px]">
                        {item.package_id}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" /> {item.duration_minutes || 25}m
                      </span>
                    </div>

                    <h4 className="font-semibold text-slate-100 line-clamp-1">{item.title}</h4>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{item.target_age_group}</span>
                      {item.has_diagram && <span className="text-cyan-400 font-mono">&bull; Diagram</span>}
                      {item.question_count > 0 && (
                        <span className="text-emerald-400 font-mono">&bull; {item.question_count} Qs</span>
                      )}
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
            <div className="panel p-6 space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" /> Synthesize Curriculum Package
                </h2>
                <p className="text-xs text-slate-400">
                  Runs the 4-stage sequential authoring pipeline on Google Cloud Run.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Topic & Syllabus Notes</label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter lesson topic, raw notes, or syllabus outline..."
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Age Group</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Grade 5-6 (10-12yo)">Grade 5-6 (10-12yo) &bull; Elementary Foundation</option>
                    <option value="Grade 7-8 (12-14yo)">Grade 7-8 (12-14yo) &bull; Middle School Core</option>
                    <option value="Grade 9-10 (14-16yo)">Grade 9-10 (14-16yo) &bull; High School Introductory</option>
                    <option value="Grade 11-12 (16-18yo)">Grade 11-12 (16-18yo) &bull; Advanced Placement / IB</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 rounded bg-slate-900 border border-slate-800">
                    <input
                      type="checkbox"
                      checked={enableAudio}
                      onChange={(e) => setEnableAudio(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-950"
                    />
                    <span>Generate TTS Audio SSML</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-2.5 rounded bg-slate-900 border border-slate-800">
                    <input
                      type="checkbox"
                      checked={enableSimplification}
                      onChange={(e) => setEnableSimplification(e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-slate-950"
                    />
                    <span>Generate Simplified Lexile</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={generating} className="btn-primary flex-1 py-2.5 px-4 text-xs">
                    {generating ? 'Synthesizing with ADK...' : 'Generate Full Curriculum Package'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (curriculaList.length > 0) loadPackage(curriculaList[0].package_id);
                    }}
                    className="btn-secondary px-4 py-2.5 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {generating && (
                <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs text-indigo-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    <span>Executing Pipeline on Google Cloud Run...</span>
                  </div>
                </div>
              )}
            </div>
          ) : loadingPackage ? (
            <div className="panel p-16 text-center text-xs text-slate-500">Loading module from Firestore...</div>
          ) : activePackage ? (
            /* Full Package Inspector */
            <div className="panel p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-indigo-400 bg-indigo-950/50 px-2.5 py-0.5 rounded border border-indigo-500/30">
                      {selectedPkgId}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: <strong className="text-slate-200">{activePackage.framework?.target_age_group || activePackage.target_age_group || 'Grade 7-8'}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {activePackage.primary_text?.lesson_title || activePackage.framework?.topic || activePackage.topic}
                  </h2>
                </div>

                <span className="badge-tag text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                  <CheckCircle2 className="h-3 w-3" /> Firestore Synced
                </span>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'text' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📖 Lesson Prose ({resolvedSections.length} Sections)
                </button>
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'diagram' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📐 Visual Diagrams ({resolvedDiagrams.length > 0 ? resolvedDiagrams.length : (resolvedChart ? 1 : 0)})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1.5 rounded transition-colors ${
                    activeTab === 'quiz' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ❓ Quizzes ({resolvedQuestions.length})
                </button>
                {(activePackage.audio || activePackage.audio_package) && (
                  <button
                    onClick={() => setActiveTab('audio')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      activeTab === 'audio' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🎙️ Audio SSML
                  </button>
                )}
                {activePackage.simplified_variation && (
                  <button
                    onClick={() => setActiveTab('simplified')}
                    className={`px-3 py-1.5 rounded transition-colors ${
                      activeTab === 'simplified' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌱 Simplified Lexile
                  </button>
                )}
              </div>

              {/* Tab 1: Lesson Prose */}
              {activeTab === 'text' && (
                <div className="space-y-5 text-xs text-slate-300 leading-relaxed">
                  {activePackage.framework?.pedagogical_hook && (
                    <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
                      <h4 className="font-bold text-indigo-300 mb-1">🎯 Pedagogical Hook:</h4>
                      <p className="text-slate-200">{activePackage.framework.pedagogical_hook}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.introduction && (
                    <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Introduction</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{activePackage.primary_text.introduction}</p>
                    </div>
                  )}

                  {/* All Core Sections */}
                  {resolvedSections.map((sec, idx) => {
                    const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                    const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                    const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                    return (
                      <div key={idx} className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-white">{secTitle}</h3>
                          {sec.estimated_minutes && (
                            <span className="text-[10px] font-mono text-slate-500">{sec.estimated_minutes} min</span>
                          )}
                        </div>

                        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">{secBody}</div>

                        {sec.key_concepts && sec.key_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {sec.key_concepts.map((kc, i) => (
                              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                #{kc}
                              </span>
                            ))}
                          </div>
                        )}

                        {checkpoint && (
                          <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/20 text-cyan-200 font-medium">
                            💡 <strong>Checkpoint Question:</strong> {checkpoint}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activePackage.primary_text?.conclusion && (
                    <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">Conclusion & Synthesis</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{activePackage.primary_text.conclusion}</p>
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
                    <span className="text-xs text-slate-400 font-mono">
                      Passing Score: {activePackage.assessment?.passing_score || 80}%
                    </span>
                  </div>

                  {resolvedQuestions.length > 0 ? (
                    resolvedQuestions.map((q, idx) => (
                      <QuizCard key={q.question_id || q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 panel">
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
                      <div key={i} className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-indigo-400 font-semibold text-[11px]">
                          <span>Speaker: {seg.speaker_role || 'Tutor'}</span>
                          <span className="text-slate-500">{seg.voice_tone || 'Standard'}</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">{seg.ssml_content}</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tab 5: Simplified Variation */}
              {activeTab === 'simplified' && activePackage.simplified_variation && (
                <div className="space-y-4">
                  <div className="p-3 rounded bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs">
                    Simplified Lexile Level: <strong>{activePackage.simplified_variation.simplified_lexile_level}</strong>
                  </div>
                  <div className="p-5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activePackage.simplified_variation.simplified_text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="panel p-16 text-center text-xs text-slate-500">
              Select a curriculum module from the library on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
