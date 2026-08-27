"use client";

import React, { useEffect, useState } from "react";
import {
  Sparkles,
  BookOpen,
  Layers,
  Volume2,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  HelpCircle,
  FileText,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { generateCurriculum, listAllCurricula, getCurriculumPackage, CurriculumSummary } from "@/lib/api";
import { LessonPackage, AudioSegment, LessonContentSection } from "@/types";
import MermaidViewer from "@/components/MermaidViewer";
import QuizCard from "@/components/QuizCard";

export default function CurriculumStudioPage() {
  const [curriculaList, setCurriculaList] = useState<CurriculumSummary[]>([]);
  const [selectedPkgId, setSelectedPkgId] = useState<string | null>(null);
  const [activePackage, setActivePackage] = useState<LessonPackage | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPackage, setLoadingPackage] = useState(false);

  // Creator state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [topic, setTopic] = useState("Quantum Computing & Superposition Fundamentals");
  const [ageGroup, setAgeGroup] = useState("Grade 9-10 (14-16yo)");
  const [enableAudio, setEnableAudio] = useState(true);
  const [enableSimplification, setEnableSimplification] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Inspector tab
  const [activeTab, setActiveTab] = useState<"text" | "diagram" | "quiz" | "audio" | "simplified">("text");

  // Load all curricula from Firestore on mount
  const refreshCurriculaList = async () => {
    setLoadingList(true);
    try {
      const res = await listAllCurricula();
      setCurriculaList(res.curricula || []);
      if (res.curricula && res.curricula.length > 0 && !selectedPkgId) {
        loadPackage(res.curricula[0].package_id);
      }
    } catch (err) {
      console.warn("Failed to load curricula list:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    refreshCurriculaList();
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
      console.error("Failed to load package:", err);
      setError(err.message || "Failed to load package");
    } finally {
      setLoadingPackage(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError(null);
    setGenerationStep(1);

    const stepTimer = setInterval(() => {
      setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await generateCurriculum({
        teacher_input: topic,
        target_age_group: ageGroup,
        enable_audio: enableAudio,
        enable_simplification: enableSimplification,
      });
      clearInterval(stepTimer);
      setGenerationStep(5);
      // Select the newly generated package immediately
      setActivePackage(res.curriculum);
      setSelectedPkgId(res.package_id);
      setIsCreatingNew(false);
      // Refresh library list
      refreshCurriculaList();
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error(err);
      setError(err.message || "Failed to generate curriculum package");
    } finally {
      setGenerating(false);
    }
  };

  const stepsList = [
    "Framework Architect: Sequencing macro outline & timings",
    "Text Synthesizer: Authoring Lexile-aligned explanations & checks",
    "Visual Blueprint: Synthesizing structural Mermaid diagrams",
    "Assessment Engine: Formulating Socratic quiz items & hints",
    "Complete: Persisted to Firestore database",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-400">
              Workflow 1 &bull; Autonomous Authoring Pipeline
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Curriculum Studio & Library
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Browse stored Firestore curriculum packages or synthesize new multi-modal lessons on demand.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreatingNew(true);
            setSelectedPkgId(null);
          }}
          className={`folk-button-primary px-4 py-2 text-xs flex items-center gap-1.5 ${
            isCreatingNew ? "ring-2 ring-indigo-400" : ""
          }`}
        >
          <Plus className="h-4 w-4" />
          <span>New Curriculum Package</span>
        </button>
      </div>

      {/* Main Grid: Left Library Sidebar (Col 4) | Right Content Inspector (Col 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Stored Curricula Library */}
        <div className="lg:col-span-4 folk-card p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              Firestore Lesson Packages ({curriculaList.length})
            </h3>
            <button
              onClick={refreshCurriculaList}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              title="Refresh list"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingList ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>

          {loadingList ? (
            <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              Loading Firestore curricula...
            </div>
          ) : curriculaList.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No curriculum packages found in Firestore.
            </div>
          ) : (
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {curriculaList.map((item) => {
                const isSelected = selectedPkgId === item.package_id && !isCreatingNew;
                return (
                  <button
                    key={item.package_id}
                    onClick={() => loadPackage(item.package_id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm"
                        : "bg-white/[0.02] border-white/5 text-slate-300 hover:bg-white/[0.05] hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-[10px] text-indigo-400 font-semibold truncate max-w-[200px]">
                        {item.package_id}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {item.duration_minutes || 25}m
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{item.target_age_group}</span>
                      {item.has_diagram && (
                        <span className="text-cyan-400 font-mono">&bull; Diagram</span>
                      )}
                      {item.question_count > 0 && (
                        <span className="text-emerald-400 font-mono">
                          &bull; {item.question_count} Qs
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Area: Form (if creating new) OR Rich Package Inspector */}
        <div className="lg:col-span-8">
          {isCreatingNew ? (
            /* Creation Form */
            <div className="folk-card p-6 border border-white/10 space-y-6">
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" /> Synthesize New Curriculum Package
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  The multi-agent workflow will generate a complete lesson framework, Lexile text, Mermaid diagram, and quizzes.
                </p>
              </div>

              <form onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Lesson Topic / Syllabus Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter lesson topic, raw notes, or syllabus outline..."
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Age Group & Grade Level
                  </label>
                  <select
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Grade 5-6 (10-12yo)">Grade 5-6 (10-12yo) &bull; Elementary Foundation</option>
                    <option value="Grade 7-8 (12-14yo)">Grade 7-8 (12-14yo) &bull; Middle School Core</option>
                    <option value="Grade 9-10 (14-16yo)">Grade 9-10 (14-16yo) &bull; High School Introductory</option>
                    <option value="Grade 11-12 (16-18yo)">Grade 11-12 (16-18yo) &bull; Advanced Placement / IB</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <input
                      type="checkbox"
                      checked={enableAudio}
                      onChange={(e) => setEnableAudio(e.target.checked)}
                      className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-black/40"
                    />
                    <span>Generate TTS Audio SSML</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <input
                      type="checkbox"
                      checked={enableSimplification}
                      onChange={(e) => setEnableSimplification(e.target.checked)}
                      className="rounded border-white/10 text-indigo-600 focus:ring-indigo-500 h-4 w-4 bg-black/40"
                    />
                    <span>Generate Simplified Variation</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={generating}
                    className="folk-button-primary flex-1 py-3 px-4 text-xs flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Synthesizing Multi-Agent Package...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Run Curriculum Generation Workflow</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      if (curriculaList.length > 0) loadPackage(curriculaList[0].package_id);
                    }}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              {generating && (
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2.5">
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    Multi-Agent Synthesis Pipeline Running on Cloud Run
                  </h4>
                  <div className="space-y-1.5">
                    {stepsList.map((st, i) => (
                      <div
                        key={i}
                        className={`text-xs p-2 rounded-lg flex items-center gap-2 ${
                          generationStep > i + 1
                            ? "text-emerald-400 bg-emerald-500/10"
                            : generationStep === i + 1
                            ? "text-indigo-300 bg-indigo-500/20 font-semibold"
                            : "text-slate-500"
                        }`}
                      >
                        {generationStep > i + 1 ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-current flex items-center justify-center text-[9px]">
                            {i + 1}
                          </span>
                        )}
                        <span>{st}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <strong>Generation Error:</strong> {error}
                </div>
              )}
            </div>
          ) : loadingPackage ? (
            /* Loading Package */
            <div className="folk-card p-16 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
              <span>Loading curriculum package from Firestore...</span>
            </div>
          ) : activePackage ? (
            /* Package Inspector */
            <div className="folk-card p-6 border border-white/10 space-y-6">
              {/* Package Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-500/30 font-semibold">
                      {selectedPkgId}
                    </span>
                    <span className="text-xs text-slate-400">
                      Target: <strong className="text-slate-200">{activePackage.framework?.target_age_group || activePackage.target_age_group || "Grade 7-8"}</strong>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {activePackage.primary_text?.lesson_title || activePackage.framework?.topic || activePackage.topic || "Lesson Module"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Synced in Firestore
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-black/40 border border-white/5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === "text" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  📖 Lesson Text
                </button>
                <button
                  onClick={() => setActiveTab("diagram")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === "diagram" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  📐 Mermaid Diagram
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === "quiz" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  ❓ Quizzes ({activePackage.assessment?.questions?.length || 0})
                </button>
                {(activePackage.audio || activePackage.audio_package) && (
                  <button
                    onClick={() => setActiveTab("audio")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      activeTab === "audio" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🎙️ Audio SSML
                  </button>
                )}
                {activePackage.simplified_variation && (
                  <button
                    onClick={() => setActiveTab("simplified")}
                    className={`px-3.5 py-1.5 rounded-lg transition-all ${
                      activeTab === "simplified" ? "bg-indigo-600 text-white font-semibold shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🌱 Simplified Lexile
                  </button>
                )}
              </div>

              {/* Tab 1: Lesson Text */}
              {activeTab === "text" && (
                <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
                  {activePackage.framework?.pedagogical_hook && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <h4 className="font-bold text-indigo-300 mb-1">🎯 Pedagogical Hook:</h4>
                      <p className="text-slate-200">{activePackage.framework.pedagogical_hook}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.introduction && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                      <h4 className="font-bold text-slate-200">Introduction</h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{activePackage.primary_text.introduction}</p>
                    </div>
                  )}

                  {activePackage.primary_text?.main_content_sections?.map((sec: LessonContentSection, idx: number) => (
                    <div key={idx} className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <h4 className="font-bold text-sm text-white">{sec.heading || sec.title || `Section ${idx + 1}`}</h4>
                      <p className="text-slate-300 leading-relaxed">{sec.body_text || sec.content || ""}</p>
                      {sec.check_for_understanding_prompt && (
                        <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 font-medium">
                          💡 <strong>Checkpoint Question:</strong> {sec.check_for_understanding_prompt}
                        </div>
                      )}
                    </div>
                  ))}

                  {activePackage.primary_text?.key_takeaways && (
                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                      <h4 className="font-bold text-emerald-300 mb-2">Key Learning Takeaways:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {activePackage.primary_text.key_takeaways.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Mermaid Diagram */}
              {activeTab === "diagram" && (
                <div>
                  <MermaidViewer
                    chart={
                      activePackage.visuals?.mermaid_diagram_syntax ||
                      activePackage.visual_assets?.mermaid_diagram_syntax ||
                      ""
                    }
                    caption={
                      activePackage.visuals?.diagram_caption ||
                      activePackage.visual_assets?.diagram_caption
                    }
                  />
                </div>
              )}

              {/* Tab 3: Quizzes */}
              {activeTab === "quiz" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white">
                    {activePackage.assessment?.quiz_title || "Assessment Checkpoints"}
                  </h3>
                  {activePackage.assessment?.questions && activePackage.assessment.questions.length > 0 ? (
                    activePackage.assessment.questions.map((q, idx) => (
                      <QuizCard key={q.question_id || idx} question={q} index={idx} />
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">No quiz questions generated for this package.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Audio Script */}
              {activeTab === "audio" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-3 font-mono text-xs">
                    {((activePackage.audio?.segments || activePackage.audio_package?.segments || []) as AudioSegment[]).map((seg: AudioSegment, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-indigo-400 font-semibold">
                          <span>Speaker: {seg.speaker_role}</span>
                          <span className="text-slate-500 text-[11px]">{seg.voice_tone}</span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">{seg.ssml_content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 5: Simplified Variation */}
              {activeTab === "simplified" && activePackage.simplified_variation && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs">
                    Simplified Lexile Level: <strong>{activePackage.simplified_variation.simplified_lexile_level}</strong>
                  </div>
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {activePackage.simplified_variation.simplified_text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No Selection */
            <div className="folk-card p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center min-h-[360px]">
              <BookOpen className="h-8 w-8 text-indigo-400/40 mb-2" />
              <p className="text-slate-300 font-semibold">Select a curriculum package from the library</p>
              <p className="text-slate-500 mt-1">Or click "New Curriculum Package" to synthesize a lesson.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
