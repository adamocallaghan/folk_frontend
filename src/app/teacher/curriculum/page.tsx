'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  UserCheck,
  Lightbulb,
  CheckSquare,
  Cpu,
  Layers,
  FileText,
  GitBranch,
  Database,
} from 'lucide-react';
import { generateCurriculum, listAllCurricula, getCurriculumPackage, listStudentProfiles, CurriculumSummary } from '@/lib/api';
import { LessonPackage, LessonSectionItem, AudioSegmentItem, LongitudinalProfile, WorkedExampleItem, ConceptualAnalogyItem } from '@/types';
import MermaidViewer from '@/components/MermaidViewer';
import QuizCard from '@/components/QuizCard';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { useTheme } from '@/context/ThemeContext';

export default function CurriculumStudioPage() {
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const [curriculaList, setCurriculaList] = useState<CurriculumSummary[]>([]);
  const [students, setStudents] = useState<LongitudinalProfile[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [activePackage, setActivePackage] = useState<LessonPackage | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(false);

  // New Creation Form State
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [topic, setTopic] = useState('Quantum Computing & Superposition Fundamentals');
  const [ageGroup, setAgeGroup] = useState('Grade 9-10 (14-16yo)');
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableSimplification, setEnableSimplification] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Tab
  const [activeTab, setActiveTab] = useState<'text' | 'diagram' | 'quiz' | 'examples' | 'analogies' | 'audio' | 'simplified'>('text');

  const agentSteps = [
    {
      agent: 'Lead Framework Architect',
      subtext: 'Structuring pedagogical syllabus, macro prerequisites, and lesson outline...',
      icon: Layers,
    },
    {
      agent: 'Master Content Author',
      subtext: 'Synthesizing textbook prose, section narratives, and comprehensive glossary...',
      icon: FileText,
    },
    {
      agent: 'Visual Architect & Assessment Specialist',
      subtext: 'Generating Mermaid.js concept diagrams and diagnostic quizzes in parallel...',
      icon: Cpu,
    },
    {
      agent: 'Adaptive Conditional Enhancers',
      subtext: 'Synthesizing tailored step-by-step worked practice, analogies, and Lexile adaptations...',
      icon: GitBranch,
    },
    {
      agent: 'Packaging & Persistence Agent',
      subtext: 'Bundling multimodal assets and persisting to Google Cloud Firestore...',
      icon: Database,
    },
  ];

  // Stepper Interval during generation
  useEffect(() => {
    let interval: any;
    if (generating) {
      setCurrentStepIndex(0);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < agentSteps.length - 1 ? prev + 1 : prev));
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generating]);

  const refreshList = async () => {
    setLoadingList(true);
    try {
      const [currRes, studRes] = await Promise.all([
        listAllCurricula().catch(() => ({ curricula: [] })),
        listStudentProfiles().catch(() => ({ profiles: [] })),
      ]);
      setCurriculaList(currRes.curricula || []);
      setStudents(studRes.profiles || []);
      if (currRes.curricula && currRes.curricula.length > 0 && !selectedPkgId) {
        loadPackage(currRes.curricula[0].package_id);
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
        target_student_id: targetStudentId || undefined,
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
  
  const resolvedWorkedExamples: WorkedExampleItem[] =
    activePackage?.worked_examples ||
    activePackage?.worked_examples_package?.examples ||
    [];

  const resolvedAnalogies: ConceptualAnalogyItem[] =
    activePackage?.conceptual_analogies ||
    activePackage?.conceptual_analogies_package?.analogies ||
    [];

  const selectedStudentObj = students.find((s) => s.student_id === targetStudentId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
        <div>
          {!isRefined && <span className="tag-ink mb-1">Teacher Workspace</span>}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1714] font-serif tracking-tight">
            Curriculum Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#8a8075] mt-1">
            Synthesize structured lesson content, conceptual diagrams, worked examples, and quizzes tailored to students.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedPkgId(null);
          }}
          className={`flex items-center gap-1.5 transition-all ${
            isRefined
              ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] text-xs font-semibold px-4 py-2'
              : 'btn-ink'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Lesson</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Library List */}
        <div className={`lg:col-span-4 space-y-3 ${isRefined ? 'border-r border-[#1a1714]/15 pr-6' : 'border border-[#1a1714] bg-[#e9e2d5] p-4'}`}>
          <div className="flex items-center justify-between pb-2">
            <h3 className={`text-xs font-bold text-[#1a1714] flex items-center gap-1.5 ${isRefined ? 'font-sans uppercase tracking-wider text-[#8a8075]' : 'uppercase tracking-wider font-mono'}`}>
              <BookOpen className="h-3.5 w-3.5" />
              Saved Modules ({curriculaList.length})
            </h3>
            <button
              onClick={refreshList}
              className="text-[#1a1714] p-1 hover:text-[#c84b2f] transition-colors"
              title="Refresh list"
            >
              <RefreshCw className={`h-3 w-3 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-8 text-center text-xs text-[#8a8075]">Loading modules...</div>
          ) : (
            <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
              {curriculaList.map((item) => {
                const isSelected = selectedPkgId === item.package_id && !isCreatingNew;

                if (isRefined) {
                  return (
                    <button
                      key={item.package_id}
                      onClick={() => loadPackage(item.package_id)}
                      className={`w-full text-left p-3 transition-all flex flex-col gap-1 rounded-none border-b border-[#1a1714]/10 last:border-b-0 ${
                        isSelected
                          ? 'bg-[#1a1714] text-[#f5f0e8]'
                          : 'hover:bg-[#1a1714]/5 text-[#1a1714]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-bold font-serif text-sm line-clamp-1 leading-snug">{item.title}</h4>
                        <span className={`text-[11px] shrink-0 font-sans ${isSelected ? 'text-[#e8e0d0]' : 'text-[#8a8075]'}`}>
                          {item.duration_minutes || 25} min
                        </span>
                      </div>

                      <div className={`flex flex-wrap items-center gap-2 text-xs ${isSelected ? 'text-[#e8e0d0]/80' : 'text-[#8a8075]'}`}>
                        <span>{item.target_age_group}</span>
                        {item.has_diagram && <span>&bull; Diagram</span>}
                        {item.question_count > 0 && <span>&bull; {item.question_count} Qs</span>}
                        {item.has_worked_examples && <span className="text-[#c84b2f] font-semibold">&bull; Worked Practice</span>}
                      </div>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.package_id}
                    onClick={() => loadPackage(item.package_id)}
                    className={`w-full text-left p-3 border text-xs transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]'
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

                    <h4 className="font-bold font-serif line-clamp-1 text-sm">{item.title}</h4>

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

        {/* Right Column: Creation Form OR Inspector */}
        <div className="lg:col-span-8">
          {isCreatingNew ? (
            /* Creation Form */
            <div className={`p-6 space-y-5 ${isRefined ? 'bg-[#ffffff] border border-[#1a1714]/15 shadow-sm' : 'border border-[#1a1714] bg-[#ebd9be]'}`}>
              <div className={`pb-3 ${isRefined ? 'border-b border-[#1a1714]/10' : 'border-b border-[#1a1714]'}`}>
                <h2 className="text-xl font-bold text-[#1a1714] font-serif flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c84b2f]" /> Create Lesson
                </h2>
                <p className="text-xs text-[#8a8075] mt-0.5">
                  Synthesize structured lesson text, conceptual diagrams, worked examples, and quizzes tailored to students.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1a1714] mb-1.5">Lesson Topic or Syllabus Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic outline or notes..."
                    className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none focus:border-[#1a1714]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1a1714] mb-1.5 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" /> Tailor for Specific Student
                    </label>
                    <select
                      value={targetStudentId}
                      onChange={(e) => setTargetStudentId(e.target.value)}
                      className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                    >
                      <option value="">General Audience (No specific profile)</option>
                      {students.map((st) => (
                        <option key={st.student_id} value={st.student_id}>
                          {st.display_name || st.student_id} &bull; {st.reading_level || 'Grade 7-8'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1a1714] mb-1.5">Target Grade Level</label>
                    <select
                      value={ageGroup}
                      onChange={(e) => setAgeGroup(e.target.value)}
                      className="w-full border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                    >
                      <option value="Grade 5-6 (10-12yo)">Grade 5-6 (10-12yo) &bull; Elementary Foundation</option>
                      <option value="Grade 7-8 (12-14yo)">Grade 7-8 (12-14yo) &bull; Middle School Core</option>
                      <option value="Grade 9-10 (14-16yo)">Grade 9-10 (14-16yo) &bull; High School Introductory</option>
                      <option value="Grade 11-12 (16-18yo)">Grade 11-12 (16-18yo) &bull; Advanced Placement / IB</option>
                    </select>
                  </div>
                </div>

                {selectedStudentObj && (
                  <div className="p-3.5 bg-[#f5f0e8] border border-[#1a1714]/20 space-y-1 text-xs text-[#1a1714]">
                    <div className="flex items-center justify-between font-semibold">
                      <span>Tailoring for: {selectedStudentObj.display_name}</span>
                      <span className="text-[#8a8075]">Reading: {selectedStudentObj.reading_level}</span>
                    </div>
                    {selectedStudentObj.reading_difficulty_flags && selectedStudentObj.reading_difficulty_flags.length > 0 && (
                      <div className="text-[11px] text-[#c84b2f]">
                        Triggering Accommodations: {selectedStudentObj.reading_difficulty_flags.join(', ')}
                      </div>
                    )}
                    {selectedStudentObj.modalities_flags && selectedStudentObj.modalities_flags.length > 0 && (
                      <div className="text-[11px] text-[#1a1714]/80">
                        Triggering Modalities: {selectedStudentObj.modalities_flags.join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-[#1a1714] cursor-pointer p-2.5 border border-[#1a1714]/20 bg-[#f5f0e8]">
                    <input
                      type="checkbox"
                      checked={enableAudio}
                      onChange={(e) => setEnableAudio(e.target.checked)}
                      className="border-[#1a1714] text-[#1a1714] h-4 w-4"
                    />
                    <span>Generate Audio SSML Script</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#1a1714] cursor-pointer p-2.5 border border-[#1a1714]/20 bg-[#f5f0e8]">
                    <input
                      type="checkbox"
                      checked={enableSimplification}
                      onChange={(e) => setEnableSimplification(e.target.checked)}
                      className="border-[#1a1714] text-[#1a1714] h-4 w-4"
                    />
                    <span>Generate Simplified Lexile Variation</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={generating}
                    className={isRefined ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] font-semibold text-xs py-2.5 px-4 flex-1' : 'btn-ink flex-1'}
                  >
                    {generating ? 'Synthesizing Multimodal Lesson Assets...' : 'Generate Personalized Curriculum'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (curriculaList.length > 0) loadPackage(curriculaList[0].package_id);
                    }}
                    className={isRefined ? 'border border-[#1a1714]/30 hover:border-[#1a1714] text-xs py-2 px-3' : 'btn-paper'}
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {/* LIVE MULTI-AGENT EXECUTION STEPPER */}
              {generating && (
                <div className="p-5 border border-[#1a1714]/20 bg-[#f5f0e8] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1a1714]/15">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-[#c84b2f]" />
                      <span className="font-serif font-bold text-sm text-[#1a1714]">Multi-Agent Pipeline Executing on Cloud Run</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#8a8075]">Stage {currentStepIndex + 1} of {agentSteps.length}</span>
                  </div>

                  <div className="space-y-3">
                    {agentSteps.map((step, idx) => {
                      const isPast = idx < currentStepIndex;
                      const isCurrent = idx === currentStepIndex;
                      const Icon = step.icon;

                      return (
                        <div
                          key={idx}
                          className={`p-3 border transition-all flex items-start gap-3 ${
                            isCurrent
                              ? 'bg-[#ffffff] border-[#1a1714] shadow-sm'
                              : isPast
                              ? 'bg-[#cbd7c7]/40 border-[#1a1714]/15 opacity-80'
                              : 'bg-transparent border-[#1a1714]/10 opacity-40'
                          }`}
                        >
                          <div className="pt-0.5">
                            {isPast ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                            ) : isCurrent ? (
                              <RefreshCw className="h-4 w-4 animate-spin text-[#c84b2f]" />
                            ) : (
                              <Icon className="h-4 w-4 text-[#8a8075]" />
                            )}
                          </div>

                          <div className="space-y-0.5 flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <strong className={`font-serif ${isCurrent ? 'text-[#1a1714] text-sm font-bold' : 'text-[#1a1714]'}`}>
                                {step.agent}
                              </strong>
                              {isCurrent && (
                                <span className="text-[10px] font-mono font-bold text-[#c84b2f] bg-[#ebd4cc] px-1.5 py-0.5 border border-[#1a1714]/20">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#1a1714]/80 leading-relaxed">{step.subtext}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : loadingPackage ? (
            <div className="p-16 text-center text-xs text-[#8a8075]">Loading module...</div>
          ) : activePackage ? (
            /* Full Package Inspector */
            <div className={`space-y-6 ${isRefined ? 'bg-[#ffffff] p-8 border border-[#1a1714]/15' : 'border border-[#1a1714] bg-[#ffffff] p-6'}`}>
              {/* Header */}
              <div className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-[#8a8075]">
                    <span>{activePackage.framework?.target_age_group || activePackage.target_age_group || 'Grade 7-8'}</span>
                    {!isRefined && <span className="tag-ink">{selectedPkgId}</span>}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1714] font-serif tracking-tight leading-snug">
                    {activePackage.primary_text?.lesson_title || activePackage.framework?.topic || activePackage.topic}
                  </h2>
                </div>

                {!isRefined && (
                  <span className="tag-ink bg-[#cbd7c7] border-[#1a1714] text-[#1a1714]">
                    <CheckCircle2 className="h-3 w-3" /> Synced
                  </span>
                )}
              </div>

              {/* Tabs */}
              {isRefined ? (
                /* Refined Typographic Tabs */
                <div className="flex flex-wrap gap-4 border-b border-[#1a1714]/15 pb-2 text-xs">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`pb-1 font-medium transition-all ${
                      activeTab === 'text'
                        ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                        : 'text-[#8a8075] hover:text-[#1a1714]'
                    }`}
                  >
                    Lesson &bull; {resolvedSections.length} sections
                  </button>
                  <button
                    onClick={() => setActiveTab('diagram')}
                    className={`pb-1 font-medium transition-all ${
                      activeTab === 'diagram'
                        ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                        : 'text-[#8a8075] hover:text-[#1a1714]'
                    }`}
                  >
                    Diagrams &bull; {resolvedDiagrams.length > 0 ? resolvedDiagrams.length : (resolvedChart ? 1 : 0)}
                  </button>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`pb-1 font-medium transition-all ${
                      activeTab === 'quiz'
                        ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                        : 'text-[#8a8075] hover:text-[#1a1714]'
                    }`}
                  >
                    Quizzes &bull; {resolvedQuestions.length}
                  </button>
                  {resolvedWorkedExamples.length > 0 && (
                    <button
                      onClick={() => setActiveTab('examples')}
                      className={`pb-1 font-medium transition-all ${
                        activeTab === 'examples'
                          ? 'text-[#c84b2f] font-bold border-b-2 border-[#c84b2f]'
                          : 'text-[#c84b2f]/80 hover:text-[#c84b2f]'
                      }`}
                    >
                      Worked Examples &bull; {resolvedWorkedExamples.length}
                    </button>
                  )}
                  {resolvedAnalogies.length > 0 && (
                    <button
                      onClick={() => setActiveTab('analogies')}
                      className={`pb-1 font-medium transition-all ${
                        activeTab === 'analogies'
                          ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                          : 'text-[#8a8075] hover:text-[#1a1714]'
                      }`}
                    >
                      Analogies &bull; {resolvedAnalogies.length}
                    </button>
                  )}
                  {(activePackage.audio || activePackage.audio_package) && (
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`pb-1 font-medium transition-all ${
                        activeTab === 'audio'
                          ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                          : 'text-[#8a8075] hover:text-[#1a1714]'
                      }`}
                    >
                      Audio SSML
                    </button>
                  )}
                  {activePackage.simplified_variation && (
                    <button
                      onClick={() => setActiveTab('simplified')}
                      className={`pb-1 font-medium transition-all ${
                        activeTab === 'simplified'
                          ? 'text-[#1a1714] font-bold border-b-2 border-[#1a1714]'
                          : 'text-[#8a8075] hover:text-[#1a1714]'
                      }`}
                    >
                      Simplified Lexile
                    </button>
                  )}
                </div>
              ) : (
                /* Classic Boxed Tabs */
                <div className="flex flex-wrap gap-1 p-1 border border-[#1a1714] bg-[#e8e0d0] text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-3 py-1.5 border transition-colors ${
                      activeTab === 'text' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                    }`}
                  >
                    Lesson ({resolvedSections.length})
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
                  {resolvedWorkedExamples.length > 0 && (
                    <button
                      onClick={() => setActiveTab('examples')}
                      className={`px-3 py-1.5 border transition-colors ${
                        activeTab === 'examples' ? 'bg-[#c84b2f] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#ebd4cc] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                      }`}
                    >
                      Worked Examples ({resolvedWorkedExamples.length})
                    </button>
                  )}
                  {resolvedAnalogies.length > 0 && (
                    <button
                      onClick={() => setActiveTab('analogies')}
                      className={`px-3 py-1.5 border transition-colors ${
                        activeTab === 'analogies' ? 'bg-[#1a1714] text-[#f5f0e8] border-[#1a1714]' : 'bg-[#f5f0e8] text-[#1a1714] border-[#1a1714] hover:bg-[#e9e2d5]'
                      }`}
                    >
                      Analogies ({resolvedAnalogies.length})
                    </button>
                  )}
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
              )}

              {/* Tab 1: Lesson Content */}
              {activeTab === 'text' && (
                <div className="space-y-6 text-[#1a1714] leading-relaxed">
                  {activePackage.framework?.pedagogical_hook && (
                    <div className={isRefined ? 'p-4 bg-[#f5f0e8] border-l-2 border-[#1a1714]' : 'p-4 bg-[#ebd9be] border border-[#1a1714]'}>
                      <h4 className="font-serif font-bold text-sm text-[#1a1714] mb-1">Hook</h4>
                      <p className="text-sm text-[#1a1714]/90">{activePackage.framework.pedagogical_hook}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.introduction && (
                    <div className="space-y-1">
                      <p className="text-sm text-[#1a1714] font-sans leading-relaxed">{activePackage.primary_text.introduction}</p>
                    </div>
                  )}

                  {/* Core Sections */}
                  {resolvedSections.map((sec, idx) => {
                    const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                    const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                    const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                    return (
                      <div
                        key={idx}
                        className={isRefined ? 'py-4 space-y-3 border-t border-[#1a1714]/15 first:border-t-0' : 'p-5 bg-[#f5f0e8] border border-[#1a1714] space-y-3'}
                      >
                        <div className="flex items-center justify-between pb-1">
                          <h3 className="font-bold text-lg text-[#1a1714] font-serif">{secTitle}</h3>
                          {sec.estimated_minutes && (
                            <span className="text-xs text-[#8a8075]">{sec.estimated_minutes} min</span>
                          )}
                        </div>

                        <MarkdownRenderer content={secBody} />

                        {sec.key_concepts && sec.key_concepts.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1 text-xs text-[#8a8075]">
                            {sec.key_concepts.map((kc, i) => (
                              <span key={i} className={isRefined ? 'bg-[#f5f0e8] px-2 py-0.5 border border-[#1a1714]/15 text-[#1a1714]' : 'tag-ink'}>
                                #{kc}
                              </span>
                            ))}
                          </div>
                        )}

                        {checkpoint && (
                          <div className={isRefined ? 'p-3 bg-[#f5f0e8] border-l-2 border-[#1a1714] text-xs text-[#1a1714]' : 'p-3 bg-[#cbd7c7] border border-[#1a1714] text-xs text-[#1a1714]'}>
                            <strong>Check:</strong> {checkpoint}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {activePackage.primary_text?.conclusion && (
                    <div className={isRefined ? 'pt-4 border-t border-[#1a1714]/15 space-y-1' : 'p-4 bg-[#f5f0e8] border border-[#1a1714] space-y-1'}>
                      <h4 className="font-bold text-xs uppercase text-[#8a8075] tracking-wider font-mono">Conclusion</h4>
                      <p className="text-sm text-[#1a1714] font-sans leading-relaxed">{activePackage.primary_text.conclusion}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Worked Examples */}
              {activeTab === 'examples' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#1a1714] font-serif flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-[#c84b2f]" /> Tailored Worked Examples
                    </h3>
                    <span className="text-xs text-[#8a8075]">Generated for Step-by-Step Accommodations</span>
                  </div>

                  <div className="space-y-4">
                    {resolvedWorkedExamples.map((ex, idx) => (
                      <div key={idx} className={isRefined ? 'p-5 bg-[#f5f0e8] border border-[#1a1714]/15 space-y-3' : 'p-5 bg-[#ebd4cc] border border-[#1a1714] space-y-3'}>
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-bold font-serif text-base text-[#1a1714]">{ex.title}</h4>
                          <span className="text-xs font-mono text-[#c84b2f]">Example {idx + 1}</span>
                        </div>
                        <p className="text-xs text-[#1a1714] font-medium leading-relaxed">{ex.problem_or_scenario}</p>

                        <div className="space-y-2 pt-2">
                          {ex.steps.map((st) => (
                            <div key={st.step_number} className="p-3 bg-[#ffffff] border border-[#1a1714]/15 space-y-1 text-xs">
                              <div className="flex items-center justify-between font-bold text-[#1a1714]">
                                <span>Step {st.step_number}: {st.step_title}</span>
                              </div>
                              <p className="text-[#1a1714]/90">{st.explanation}</p>
                              {st.key_insight && (
                                <div className="text-[11px] text-[#c84b2f] pt-1">
                                  <strong>Key Insight:</strong> {st.key_insight}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-[#cbd7c7] border border-[#1a1714]/15 text-xs text-[#1a1714]">
                          <strong>Core Takeaway:</strong> {ex.core_takeaway}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Conceptual Analogies & Thought Experiments */}
              {activeTab === 'analogies' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[#1a1714] font-serif flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-[#c84b2f]" /> Intuitive Analogies & Thought Experiments
                    </h3>
                    <span className="text-xs text-[#8a8075]">Concrete Intuition Anchors</span>
                  </div>

                  <div className="space-y-4">
                    {resolvedAnalogies.map((an, idx) => (
                      <div key={idx} className={isRefined ? 'p-5 bg-[#f5f0e8] border border-[#1a1714]/15 space-y-3' : 'p-5 bg-[#ebd9be] border border-[#1a1714] space-y-3'}>
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-bold font-serif text-base text-[#1a1714]">{an.concept_name}</h4>
                          <span className="text-xs text-[#8a8075]">Analogy {idx + 1}</span>
                        </div>

                        <div className="p-3 bg-[#ffffff] border border-[#1a1714]/15 text-xs space-y-1">
                          <strong className="block text-[#c84b2f]">Everyday Analogy:</strong>
                          <p className="text-[#1a1714] leading-relaxed">{an.real_world_analogy}</p>
                        </div>

                        <div className="p-3 bg-[#cbd7c7] border border-[#1a1714]/15 text-xs space-y-1">
                          <strong className="block text-[#1a1714]">Thought Experiment:</strong>
                          <p className="text-[#1a1714] leading-relaxed">{an.thought_experiment_prompt}</p>
                        </div>

                        <p className="text-[11px] text-[#8a8075]">
                          <strong>Why it works:</strong> {an.why_it_works}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: Visual Diagrams */}
              {activeTab === 'diagram' && (
                <div>
                  <MermaidViewer
                    chart={resolvedChart}
                    diagrams={resolvedDiagrams}
                    caption={activePackage.visuals?.diagram_caption || activePackage.visual_assets?.diagram_caption}
                  />
                </div>
              )}

              {/* Tab: Quizzes */}
              {activeTab === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#1a1714] font-serif">
                      {activePackage.assessment?.quiz_title || 'Assessment Checkpoints'}
                    </h3>
                    <span className="text-xs text-[#8a8075]">
                      Passing score: {activePackage.assessment?.passing_score || 80}%
                    </span>
                  </div>

                  {resolvedQuestions.length > 0 ? (
                    resolvedQuestions.map((q, idx) => (
                      <QuizCard key={q.question_id || q.id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <div className="p-8 text-center text-xs text-[#8a8075]">
                      No quiz questions generated for this module.
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Audio Script */}
              {activeTab === 'audio' && (
                <div className="space-y-3 text-xs">
                  {((activePackage.audio?.segments || activePackage.audio_package?.segments || []) as AudioSegmentItem[]).map(
                    (seg, i) => (
                      <div key={i} className={isRefined ? 'p-3 bg-[#f5f0e8] border-l border-[#1a1714] space-y-1' : 'p-3 bg-[#f5f0e8] border border-[#1a1714] space-y-1'}>
                        <div className="flex items-center justify-between text-[#c84b2f] font-semibold text-xs">
                          <span>{seg.speaker_role || 'Tutor'}</span>
                          <span className="text-[#8a8075]">{seg.voice_tone || 'Standard'}</span>
                        </div>
                        <p className="text-[#1a1714] font-sans text-xs">{seg.ssml_content || seg.text}</p>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Tab: Simplified Variation */}
              {activeTab === 'simplified' && activePackage.simplified_variation && (
                <div className="space-y-4">
                  <div className={isRefined ? 'p-3 bg-[#f5f0e8] border-l-2 border-[#1a1714] text-xs' : 'p-3 bg-[#ebd4cc] border border-[#1a1714] text-xs'}>
                    Reading Level: <strong className="text-[#1a1714]">{activePackage.simplified_variation.simplified_lexile_level || activePackage.simplified_variation.needed_for_reading_level}</strong>
                  </div>
                  <div className="p-4 bg-[#f5f0e8] text-xs text-[#1a1714] leading-relaxed whitespace-pre-wrap">
                    {activePackage.simplified_variation.simplified_text || activePackage.simplified_variation.simplified_introduction}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-[#8a8075]">
              Select a curriculum module from the library on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
