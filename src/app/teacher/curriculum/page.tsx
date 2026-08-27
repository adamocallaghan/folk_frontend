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
import MarkdownRenderer from '@/components/MarkdownRenderer';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a1714]">
        <div>
          <span className="tag-ink mb-1">Teacher Workspace</span>
          <h1 className="text-3xl font-bold text-[#1a1714] font-serif tracking-tight mt-1">Curriculum Studio</h1>
          <p className="text-xs text-[#8a8075]">
            Browse saved lesson modules or create a new multi-modal curriculum.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedPkgId(null);
          }}
          className="btn-ink flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Curriculum</span>
        </button>
      </div>

      {/* Main Grid: Left Library Sidebar | Right Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Saved Library */}
        <div className="lg:col-span-4 border border-[#1a1714] bg-[#e9e2d5] p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1a1714]">
            <h3 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <BookOpen className="h-3.5 w-3.5 text-[#1a1714]" />
              Saved Modules ({curriculaList.length})
            </h3>
            <button
              onClick={refreshList}
              className="text-[#1a1714] p-1 border border-[#1a1714] bg-[#f5f0e8] hover:bg-[#ebd9be]"
              title="Refresh list"
            >
              <RefreshCw className={`h-3 w-3 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">Loading modules...</div>
          ) : (
            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {curriculaList.map((item) => {
                const isSelected = selectedPkgId === item.package_id && !isCreatingNew;
                return (
                  <button
                    key={item.package_id}
                    onClick={() => loadPackage(item.package_id)}
                    className={`w-full text-left p-3 border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714] shadow-[2px_2px_0px_0px_#c84b2f]'
                        : 'bg-[#f5f0e8] border-[#1a1714] text-[#1a1714] hover:bg-[#ebd9be]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-mono text-[10px] truncate max-w-[200px] ${isSelected ? 'text-[#ebd9be] font-bold' : 'text-[#8a8075]'}`}>
                        {item.package_id}
                      </span>
                      <span className={`text-[10px] flex items-center gap-1 font-mono ${isSelected ? 'text-[#f5f0e8]' : 'text-[#8a8075]'}`}>
                        <Clock className="h-2.5 w-2.5" /> {item.duration_minutes || 25}m
                      </span>
                    </div>

                    <h4 className="font-bold font-serif line-clamp-1">{item.title}</h4>

                    <div className={`flex items-center gap-2 text-[10px] ${isSelected ? 'text-[#e8e0d0]' : 'text-[#8a8075]'}`}>
                      <span>{item.target_age_group}</span>
                      {item.has_diagram && <span className="font-mono font-bold">&bull; Diagram</span>}
                      {item.question_count > 0 && <span className="font-mono font-bold">&bull; {item.question_count} Qs</span>}
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
            <div className="border border-[#1a1714] bg-[#ebd9be] p-6 space-y-5">
              <div className="pb-3 border-b border-[#1a1714]">
                <h2 className="text-lg font-bold text-[#1a1714] font-serif flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c84b2f]" /> Create Lesson Package
                </h2>
                <p className="text-xs text-[#1a1714]/80">
                  Runs the multi-agent curriculum authoring workflow on Google Cloud Run.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#1a1714] mb-1.5 font-mono">TOPIC & SYLLABUS NOTES</label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter lesson topic, raw notes, or syllabus outline..."
                    className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1a1714] mb-1.5 font-mono">TARGET GRADE LEVEL</label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none"
                  >
                    <option value="Grade 5-6 (10-12yo)">Grade 5-6 (10-12yo) &bull; Elementary Foundation</option>
                    <option value="Grade 7-8 (12-14yo)">Grade 7-8 (12-14yo) &bull; Middle School Core</option>
                    <option value="Grade 9-10 (14-16yo)">Grade 9-10 (14-16yo) &bull; High School Introductory</option>
                    <option value="Grade 11-12 (16-18yo)">Grade 11-12 (16-18yo) &bull; Advanced Placement / IB</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#1a1714] cursor-pointer p-2.5 border border-[#1a1714] bg-[#f5f0e8]">
                    <input
                      type="checkbox"
                      checked={enableAudio}
                      onChange={(e) => setEnableAudio(e.target.checked)}
                      className="border-[#1a1714] text-[#1a1714] h-4 w-4"
                    />
                    <span>Generate TTS Audio SSML</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#1a1714] cursor-pointer p-2.5 border border-[#1a1714] bg-[#f5f0e8]">
                    <input
                      type="checkbox"
                      checked={enableSimplification}
                      onChange={(e) => setEnableSimplification(e.target.checked)}
                      className="border-[#1a1714] text-[#1a1714] h-4 w-4"
                    />
                    <span>Generate Simplified Variation</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={generating} className="btn-ink flex-1">
                    {generating ? 'Generating on Cloud Run...' : 'Generate Full Curriculum'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (curriculaList.length > 0) loadPackage(curriculaList[0].package_id);
                    }}
                    className="btn-paper"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {generating && (
                <div className="p-3.5 border border-[#1a1714] bg-[#f5f0e8] flex items-center gap-2 text-xs text-[#1a1714]">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#c84b2f]" />
                  <span>Pipeline executing on Google Cloud Run...</span>
                </div>
              )}
            </div>
          ) : loadingPackage ? (
            <div className="paper-card p-16 text-center text-xs text-[#8a8075]">Loading module from Firestore...</div>
          ) : activePackage ? (
            /* Full Package Inspector */
            <div className="border border-[#1a1714] bg-[#ffffff] p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#1a1714]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="tag-ink">{selectedPkgId}</span>
                    <span className="text-xs text-[#8a8075]">
                      Target: <strong className="text-[#1a1714]">{activePackage.framework?.target_age_group || activePackage.target_age_group || 'Grade 7-8'}</strong>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1a1714] font-serif tracking-tight">
                    {activePackage.primary_text?.lesson_title || activePackage.framework?.topic || activePackage.topic}
                  </h2>
                </div>

                <span className="tag-ink bg-[#cbd7c7] border-[#1a1714] text-[#1a1714]">
                  <CheckCircle2 className="h-3 w-3" /> Synced
                </span>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 p-1 border border-[#1a1714] bg-[#e8e0d0] text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`px-3 py-1.5 border transition-colors ${
                    activeTab === 'text' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                  }`}
                >
                  Lesson Content ({resolvedSections.length} Sections)
                </button>
                <button
                  onClick={() => setActiveTab('diagram')}
                  className={`px-3 py-1.5 border transition-colors ${
                    activeTab === 'diagram' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                  }`}
                >
                  Diagrams ({resolvedDiagrams.length > 0 ? resolvedDiagrams.length : (resolvedChart ? 1 : 0)})
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-3 py-1.5 border transition-colors ${
                    activeTab === 'quiz' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                  }`}
                >
                  Quizzes ({resolvedQuestions.length})
                </button>
                {(activePackage.audio || activePackage.audio_package) && (
                  <button
                    onClick={() => setActiveTab('audio')}
                    className={`px-3 py-1.5 border transition-colors ${
                      activeTab === 'audio' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                    }`}
                  >
                    Audio SSML
                  </button>
                )}
                {activePackage.simplified_variation && (
                  <button
                    onClick={() => setActiveTab('simplified')}
                    className={`px-3 py-1.5 border transition-colors ${
                      activeTab === 'simplified' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                    }`}
                  >
                    Simplified Lexile
                  </button>
                )}
              </div>

              {/* Tab 1: Lesson Content */}
              {activeTab === 'text' && (
                <div className="space-y-5 text-xs text-[#1a1714] leading-relaxed">
                  {activePackage.framework?.pedagogical_hook && (
                    <div className="p-4 bg-[#ebd9be] border border-[#1a1714]">
                      <h4 className="font-bold text-[#1a1714] mb-1 font-serif">Pedagogical Hook:</h4>
                      <p className="text-[#1a1714]/90">{activePackage.framework.pedagogical_hook}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.introduction && (
                    <div className="p-4 bg-[#f5f0e8] border border-[#1a1714] space-y-1">
                      <h4 className="font-bold text-[#1a1714] text-xs uppercase font-mono tracking-wider">Introduction</h4>
                      <p className="text-[#1a1714] text-sm leading-relaxed">{activePackage.primary_text.introduction}</p>
                    </div>
                  )}

                  {/* All Core Sections with Markdown Rendering */}
                  {resolvedSections.map((sec, idx) => {
                    const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                    const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                    const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                    return (
                      <div key={idx} className="p-5 bg-[#f5f0e8] border border-[#1a1714] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-[#1a1714] font-serif">{secTitle}</h3>
                          {sec.estimated_minutes && (
                            <span className="text-[10px] font-mono text-[#8a8075]">{sec.estimated_minutes} min</span>
                          )}
                        </div>

                        <MarkdownRenderer content={secBody} />

                        {sec.key_concepts && sec.key_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {sec.key_concepts.map((kc, i) => (
                              <span key={i} className="tag-ink">
                                #{kc}
                              </span>
                            ))}
                          </div>
                        )}

                        {checkpoint && (
                          <div className="p-3 bg-[#cbd7c7] border border-[#1a1714] text-[#1a1714] font-medium">
                            <strong>Check for Understanding:</strong> {checkpoint}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activePackage.primary_text?.conclusion && (
                    <div className="p-4 bg-[#f5f0e8] border border-[#1a1714] space-y-1">
                      <h4 className="font-bold text-[#1a1714] text-xs uppercase font-mono tracking-wider">Conclusion</h4>
                      <p className="text-[#1a1714] text-sm leading-relaxed">{activePackage.primary_text.conclusion}</p>
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
                    <h3 className="text-sm font-bold text-[#1a1714] font-serif">
                      {activePackage.assessment?.quiz_title || 'Assessment Checkpoints'}
                    </h3>
                    <span className="text-xs text-[#8a8075] font-mono">
                      Passing: {activePackage.assessment?.passing_score || 80}%
                    </span>
                  </div>

                  {resolvedQuestions.length > 0 ? (
                    resolvedQuestions.map((q, idx) => (
                      <QuizCard key={q.question_id || q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#8a8075] paper-card">
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
                      <div key={i} className="p-3 bg-[#f5f0e8] border border-[#1a1714] space-y-1">
                        <div className="flex items-center justify-between text-[#c84b2f] font-semibold text-[11px]">
                          <span>Speaker: {seg.speaker_role || 'Tutor'}</span>
                          <span className="text-[#8a8075]">{seg.voice_tone || 'Standard'}</span>
                        </div>
                        <p className="text-[#1a1714] font-sans text-xs">{seg.ssml_content}</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tab 5: Simplified Variation */}
              {activeTab === 'simplified' && activePackage.simplified_variation && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#ebd4cc] border border-[#1a1714] text-xs">
                    Simplified Lexile: <strong className="text-[#1a1714]">{activePackage.simplified_variation.simplified_lexile_level}</strong>
                  </div>
                  <div className="p-5 bg-[#f5f0e8] border border-[#1a1714] text-xs text-[#1a1714] leading-relaxed whitespace-pre-wrap">
                    {activePackage.simplified_variation.simplified_text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="paper-card p-16 text-center text-xs text-[#8a8075]">
              Select a curriculum module from the library on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
