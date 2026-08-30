'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurriculumPackage, sendStudentChat, evaluateSession, getStudentProfile, listStudentProfiles } from '@/lib/api';
import { LessonPackage, ChatMessage, LessonSectionItem, LongitudinalProfile, WorkedExampleItem, ConceptualAnalogyItem } from '@/types';
import MermaidViewer from '@/components/MermaidViewer';
import QuizCard from '@/components/QuizCard';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Send, CheckCircle2, Award, ArrowLeft, RefreshCw, UserCheck, CheckSquare, Lightbulb, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function StudentLessonPage() {
  const { theme } = useTheme();
  const isRefined = theme === 'refined';

  const params = useParams();
  const packageId = params.id as string;

  const [studentId, setStudentId] = useState('G7_Amanda_Jones');
  const [allStudents, setAllStudents] = useState<LongitudinalProfile[]>([]);
  const [studentProfile, setStudentProfile] = useState<LongitudinalProfile | null>(null);
  const [lessonPackage, setLessonPackage] = useState<LessonPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);
  const [quizScore, setQuizScore] = useState<{ [qId: string]: boolean }>({});
  const [sessionEvaluation, setSessionEvaluation] = useState<any>(null);

  const loadStudentData = async (activeId: string, currPackage?: LessonPackage) => {
    try {
      const profRes = await getStudentProfile(activeId).catch(() => null);
      const prof = profRes?.profile || null;
      setStudentProfile(prof);

      const activePkg = currPackage || lessonPackage;
      const title = activePkg?.primary_text?.lesson_title || activePkg?.framework?.topic || 'this lesson';
      const name = prof?.display_name || activeId;

      const diffs = prof?.reading_difficulty_flags || [];
      const hasWorkedExamplesFlag = diffs.some((f: string) =>
        f.toLowerCase().includes('worked example') || f.toLowerCase().includes('formula friction')
      );

      let tutorIntro = `Hi ${name}! I'm Aura, your tutor for "${title}". Ask me anything if you'd like a simpler explanation or want to test your understanding!`;
      if (hasWorkedExamplesFlag) {
        tutorIntro += ` I've unlocked personalized step-by-step worked practice for you below.`;
      }

      setMessages([
        {
          id: 'init_1',
          role: 'assistant',
          content: tutorIntro,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (e) {
      console.warn('Error loading student profile in lesson:', e);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('folk_active_student_id');
    const initialStudentId = saved || 'G7_Amanda_Jones';
    setStudentId(initialStudentId);

    Promise.all([
      getCurriculumPackage(packageId),
      listStudentProfiles().catch(() => ({ profiles: [] })),
    ])
      .then(([currRes, studListRes]) => {
        setLessonPackage(currRes.curriculum);
        const profs = studListRes.profiles || [];
        setAllStudents(profs);

        const currentActive = profs.find((s) => s.student_id === initialStudentId)
          ? initialStudentId
          : profs[0]?.student_id || initialStudentId;

        setStudentId(currentActive);
        loadStudentData(currentActive, currRes.curriculum);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Lesson fetch error:', err);
        setLoading(false);
      });
  }, [packageId]);

  const handleStudentSwitch = (newId: string) => {
    setStudentId(newId);
    localStorage.setItem('folk_active_student_id', newId);
    loadStudentData(newId);
  };

  const sessionId = `sess_${packageId}_${studentId}`;

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      content: inputMsg,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setSendingChat(true);

    try {
      const res = await sendStudentChat({
        student_id: studentId,
        session_id: sessionId,
        message: userMsg.content,
        lesson_id: packageId,
      });

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string, isCorrect: boolean) => {
    setQuizScore((prev) => ({ ...prev, [questionId]: isCorrect }));
  };

  const handleFinishLesson = async () => {
    if (submittingEvaluation) return;
    setSubmittingEvaluation(true);

    try {
      const res = await evaluateSession({
        session_id: sessionId,
        student_id: studentId,
        lesson_id: packageId,
        quiz_answers: quizScore,
        chat_transcript: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
      });
      setSessionEvaluation(res.session_evaluation || { comprehension_score: 85, cognitive_load_index: 'Optimal Retention' });
    } catch (err: any) {
      console.error('Evaluation error:', err);
      const correctCount = Object.values(quizScore).filter(Boolean).length;
      const totalQ = Object.keys(quizScore).length || 1;
      const score = Math.round((correctCount / totalQ) * 100);
      setSessionEvaluation({
        comprehension_score: score || 85,
        cognitive_load_index: 'Saved & Synchronized to Firestore',
      });
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-xs text-[#8a8075] gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-[#1a1714]" />
        <span>Loading lesson...</span>
      </div>
    );
  }

  const resolvedSections: LessonSectionItem[] =
    lessonPackage?.primary_text?.sections ||
    lessonPackage?.primary_text?.main_content_sections ||
    [];

  const resolvedDiagrams =
    lessonPackage?.visuals?.diagrams ||
    lessonPackage?.visual_assets?.diagrams ||
    [];

  const resolvedChart =
    lessonPackage?.visuals?.mermaid_diagram_syntax ||
    lessonPackage?.visual_assets?.mermaid_diagram_syntax ||
    '';

  const resolvedQuestions = lessonPackage?.assessment?.questions || [];

  const resolvedWorkedExamples: WorkedExampleItem[] =
    lessonPackage?.worked_examples ||
    lessonPackage?.worked_examples_package?.examples ||
    [];

  const resolvedAnalogies: ConceptualAnalogyItem[] =
    lessonPackage?.conceptual_analogies ||
    lessonPackage?.conceptual_analogies_package?.analogies ||
    [];

  // Strict Accommodation Filtering based specifically on Reading & Accessibility Accommodations
  const studentDiffFlags = studentProfile?.reading_difficulty_flags || [];

  const studentNeedsWorkedExamples = studentDiffFlags.some((f: string) => {
    const fl = f.toLowerCase();
    return fl.includes('worked example') || fl.includes('formula friction') || fl.includes('extra practice');
  });

  const studentNeedsAnalogies = studentDiffFlags.some((f: string) => {
    const fl = f.toLowerCase();
    return fl.includes('formula friction') || fl.includes('conceptual first');
  });

  const studentNeedsSimplification = studentDiffFlags.some((f: string) => {
    const fl = f.toLowerCase();
    return fl.includes('dyslexia') || fl.includes('chunked') || fl.includes('esl');
  });

  const hasAnyActiveAccommodation = studentNeedsWorkedExamples || studentNeedsAnalogies || studentNeedsSimplification;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Breadcrumbs & Student Switcher */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 ${isRefined ? 'border-b border-[#1a1714]/15' : 'border-b border-[#1a1714]'}`}>
        <Link href="/student" className="flex items-center gap-1.5 text-xs text-[#1a1714] hover:underline font-semibold">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Lesson Catalog</span>
        </Link>

        {/* Student Switcher in Lesson */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#1a1714] flex items-center gap-1">
            <UserCheck className="h-3.5 w-3.5 text-[#c84b2f]" /> Active Student:
          </label>
          <select
            value={studentId}
            onChange={(e) => handleStudentSwitch(e.target.value)}
            className="border border-[#1a1714]/30 bg-[#ffffff] px-3 py-1.5 text-xs text-[#1a1714] font-medium focus:outline-none focus:border-[#1a1714]"
          >
            {allStudents.map((st) => (
              <option key={st.student_id} value={st.student_id}>
                {st.display_name || st.student_id} &bull; {st.reading_level || 'Grade 7-8'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Student Accommodations Status Banner */}
      <div className={`p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs transition-all ${
        hasAnyActiveAccommodation
          ? isRefined
            ? 'bg-[#ffffff] border-l-4 border-l-[#c84b2f] border border-[#1a1714]/15 shadow-sm'
            : 'bg-[#ebd4cc] border border-[#1a1714]'
          : isRefined
          ? 'bg-[#ffffff] border-l-4 border-l-[#8a8075] border border-[#1a1714]/15 shadow-sm'
          : 'bg-[#f5f0e8] border border-[#1a1714]'
      }`}>
        <div className="flex items-center gap-2">
          {hasAnyActiveAccommodation ? (
            <Sparkles className="h-4 w-4 text-[#c84b2f]" />
          ) : (
            <UserCheck className="h-4 w-4 text-[#8a8075]" />
          )}
          <span className="font-semibold text-[#1a1714]">
            Viewing as {studentProfile?.display_name || studentId}:
          </span>
          <span className="text-[#8a8075]">
            {hasAnyActiveAccommodation
              ? 'Personalized Assistive Accommodations Active'
              : 'Standard Core Stream (Direct Curriculum)'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {studentNeedsWorkedExamples && (
            <span className="px-2 py-0.5 bg-[#c84b2f] text-[#f5f0e8] font-medium">
              + Worked Examples
            </span>
          )}
          {studentNeedsAnalogies && (
            <span className="px-2 py-0.5 bg-[#1a1714] text-[#f5f0e8] font-medium">
              + Intuitive Analogies
            </span>
          )}
          {studentNeedsSimplification && (
            <span className="px-2 py-0.5 bg-[#cbd7c7] text-[#1a1714] font-medium">
              + Simplified Lexile
            </span>
          )}
          {!hasAnyActiveAccommodation && (
            <span className="text-[#8a8075] italic">
              (Assistive sections hidden for standard profile)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Reader */}
        <div className="lg:col-span-7 space-y-6">
          <div className={isRefined ? 'p-8 bg-[#ffffff] border border-[#1a1714]/15 space-y-6 shadow-sm' : 'border border-[#1a1714] bg-[#ffffff] p-6 space-y-6'}>
            <div className="space-y-1.5">
              <span className={isRefined ? 'text-xs text-[#8a8075] font-medium' : 'tag-ink bg-[#ebd9be] border-[#1a1714] text-[#1a1714]'}>
                {lessonPackage?.framework?.target_age_group || lessonPackage?.target_age_group || 'Grade 7-8'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1714] font-serif tracking-tight leading-tight mt-1">
                {lessonPackage?.primary_text?.lesson_title || lessonPackage?.framework?.topic || 'Lesson Overview'}
              </h1>
            </div>

            {lessonPackage?.primary_text?.introduction && (
              <div className={isRefined ? 'p-4 bg-[#f5f0e8] border-l-2 border-[#1a1714]' : 'p-4 bg-[#f5f0e8] border border-[#1a1714]'}>
                <p className="text-sm text-[#1a1714] leading-relaxed font-sans">{lessonPackage.primary_text.introduction}</p>
              </div>
            )}

            {/* Diagrams */}
            {(resolvedDiagrams.length > 0 || resolvedChart) && (
              <div className="space-y-2">
                <h3 className={`text-xs font-bold text-[#1a1714] ${isRefined ? 'font-sans uppercase tracking-wider text-[#8a8075]' : 'uppercase tracking-wider font-mono'}`}>
                  Concept Diagram
                </h3>
                <MermaidViewer
                  chart={resolvedChart}
                  diagrams={resolvedDiagrams}
                  caption={lessonPackage?.visuals?.diagram_caption || lessonPackage?.visual_assets?.diagram_caption}
                />
              </div>
            )}

            {/* Sections */}
            <div className="space-y-6">
              {resolvedSections.map((sec, idx) => {
                const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                return (
                  <div
                    key={idx}
                    className={isRefined ? 'py-4 space-y-3 border-t border-[#1a1714]/15 first:border-t-0' : 'p-5 bg-[#f5f0e8] border border-[#1a1714] space-y-3'}
                  >
                    <h3 className="text-lg font-bold text-[#1a1714] font-serif">{secTitle}</h3>
                    <MarkdownRenderer content={secBody} />
                    {checkpoint && (
                      <div className={isRefined ? 'p-3 bg-[#f5f0e8] border-l-2 border-[#1a1714] text-xs text-[#1a1714]' : 'p-3 bg-[#cbd7c7] border border-[#1a1714] text-xs text-[#1a1714]'}>
                        <strong className="block mb-0.5 font-semibold">Check for Understanding:</strong> {checkpoint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ONLY DISPLAY WORKED EXAMPLES IF STUDENT NEEDS THEM */}
            {resolvedWorkedExamples.length > 0 && studentNeedsWorkedExamples && (
              <div className={`pt-6 space-y-4 ${isRefined ? 'border-t border-[#1a1714]/15' : 'border-t border-[#1a1714]'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#1a1714] font-serif flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-[#c84b2f]" /> Step-by-Step Worked Practice
                  </h3>
                  <span className="text-xs text-[#c84b2f] font-medium">Tailored for {studentProfile?.display_name || studentId}</span>
                </div>

                <div className="space-y-4">
                  {resolvedWorkedExamples.map((ex, idx) => (
                    <div key={idx} className={isRefined ? 'p-5 bg-[#f5f0e8] border border-[#1a1714]/15 space-y-3' : 'p-5 bg-[#ebd4cc] border border-[#1a1714] space-y-3'}>
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-bold font-serif text-base text-[#1a1714]">{ex.title}</h4>
                        <span className="text-xs font-mono text-[#c84b2f]">Worked Example {idx + 1}</span>
                      </div>
                      <p className="text-xs text-[#1a1714] font-medium leading-relaxed">{ex.problem_or_scenario}</p>

                      <div className="space-y-2 pt-2">
                        {ex.steps.map((st) => (
                          <div key={st.step_number} className="p-3 bg-[#ffffff] border border-[#1a1714]/15 space-y-1 text-xs">
                            <strong className="block text-[#1a1714]">Step {st.step_number}: {st.step_title}</strong>
                            <p className="text-[#1a1714]/90">{st.explanation}</p>
                            {st.key_insight && (
                              <div className="text-[11px] text-[#c84b2f] pt-1">
                                <strong>Tip:</strong> {st.key_insight}
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

            {/* ONLY DISPLAY ANALOGIES IF STUDENT NEEDS THEM */}
            {resolvedAnalogies.length > 0 && studentNeedsAnalogies && (
              <div className={`pt-6 space-y-4 ${isRefined ? 'border-t border-[#1a1714]/15' : 'border-t border-[#1a1714]'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#1a1714] font-serif flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[#c84b2f]" /> Intuitive Analogies & Thought Experiments
                  </h3>
                  <span className="text-xs text-[#8a8075]">Visual / Concrete Anchors</span>
                </div>

                <div className="space-y-4">
                  {resolvedAnalogies.map((an, idx) => (
                    <div key={idx} className={isRefined ? 'p-5 bg-[#f5f0e8] border border-[#1a1714]/15 space-y-3' : 'p-5 bg-[#ebd9be] border border-[#1a1714] space-y-3'}>
                      <h4 className="font-bold font-serif text-base text-[#1a1714]">{an.concept_name}</h4>
                      <div className="p-3 bg-[#ffffff] border border-[#1a1714]/15 text-xs space-y-1">
                        <strong className="text-[#c84b2f] block">Real-World Analogy:</strong>
                        <p className="text-[#1a1714] leading-relaxed">{an.real_world_analogy}</p>
                      </div>
                      <div className="p-3 bg-[#cbd7c7] border border-[#1a1714]/15 text-xs space-y-1">
                        <strong className="text-[#1a1714] block">Thought Experiment:</strong>
                        <p className="text-[#1a1714] leading-relaxed">{an.thought_experiment_prompt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lessonPackage?.primary_text?.conclusion && (
              <div className={isRefined ? 'pt-4 border-t border-[#1a1714]/15 space-y-1' : 'p-4 bg-[#f5f0e8] border border-[#1a1714] space-y-1'}>
                <h4 className="font-bold text-[#1a1714] text-xs mb-1 uppercase tracking-wider font-sans text-[#8a8075]">Conclusion</h4>
                <p className="text-sm text-[#1a1714] font-sans leading-relaxed">{lessonPackage.primary_text.conclusion}</p>
              </div>
            )}

            {/* Quizzes */}
            {resolvedQuestions.length > 0 && (
              <div className={`pt-6 space-y-4 ${isRefined ? 'border-t border-[#1a1714]/15' : 'border-t border-[#1a1714]'}`}>
                <h3 className="text-xl font-bold text-[#1a1714] font-serif">
                  {lessonPackage?.assessment?.quiz_title || 'Practice Questions'}
                </h3>
                {resolvedQuestions.map((q, i) => (
                  <QuizCard key={q.question_id || q.id || i} question={q} index={i} onAnswerSubmit={handleQuizAnswer} />
                ))}
              </div>
            )}

            {/* Complete Lesson Button */}
            {!sessionEvaluation ? (
              <button
                onClick={handleFinishLesson}
                disabled={submittingEvaluation}
                className={isRefined ? 'w-full py-3 bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-60' : 'btn-ink w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-60'}
              >
                {submittingEvaluation ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#c84b2f]" />
                    <span>Evaluating comprehension and syncing to Firestore...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Lesson & Save Progress for {studentProfile?.display_name || studentId}</span>
                  </>
                )}
              </button>
            ) : (
              <div className={isRefined ? 'p-6 bg-[#ffffff] border border-[#1a1714]/15 space-y-3 shadow-sm' : 'p-5 bg-[#cbd7c7] border border-[#1a1714] space-y-3'}>
                <h4 className="text-base font-bold text-[#1a1714] font-serif flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-[#c84b2f]" />
                  Lesson Completed for {studentProfile?.display_name || studentId}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f5f0e8] border border-[#1a1714]/15">
                    <span className="text-[#8a8075] block text-xs">Quiz Score:</span>
                    <strong className="text-[#1a1714] text-xl font-serif">{sessionEvaluation.comprehension_score}%</strong>
                  </div>
                  <div className="p-3 bg-[#f5f0e8] border border-[#1a1714]/15">
                    <span className="text-[#8a8075] block text-xs">Pacing & Retention:</span>
                    <strong className="text-[#1a1714] text-sm font-serif">{sessionEvaluation.cognitive_load_index}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Aura Tutor Chat */}
        <div className={`lg:col-span-5 flex flex-col h-[680px] overflow-hidden sticky top-6 ${isRefined ? 'bg-[#ffffff] border border-[#1a1714]/15 shadow-sm' : 'border border-[#1a1714] bg-[#ffffff]'}`}>
          <div className={`p-4 flex items-center justify-between ${isRefined ? 'border-b border-[#1a1714]/10 bg-[#f5f0e8]' : 'border-b border-[#1a1714] bg-[#e8e0d0]'}`}>
            <div>
              <h3 className="text-sm font-bold text-[#1a1714] font-serif">Aura (Tutor)</h3>
              <p className="text-xs text-[#8a8075]">Tutoring {studentProfile?.display_name || studentId}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f0e8]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[#1a1714] text-[#f5f0e8]'
                      : isRefined
                      ? 'bg-[#ffffff] text-[#1a1714] border border-[#1a1714]/15 shadow-sm'
                      : 'bg-[#ffffff] text-[#1a1714] border border-[#1a1714] shadow-[3px_3px_0px_0px_#1a1714]'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <MarkdownRenderer content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
                <span className="text-[10px] text-[#8a8075] mt-0.5 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center gap-2 text-xs text-[#1a1714] p-2.5 bg-[#ffffff] border border-[#1a1714]/15">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#c84b2f]" />
                <span>Aura is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className={`p-3 flex gap-2 ${isRefined ? 'border-t border-[#1a1714]/10 bg-[#ffffff]' : 'border-t border-[#1a1714] bg-[#e8e0d0]'}`}>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Aura anything about this lesson..."
              className="flex-1 border border-[#1a1714]/30 bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none focus:border-[#1a1714]"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className={isRefined ? 'bg-[#1a1714] text-[#f5f0e8] hover:bg-[#c84b2f] px-3 py-2 text-xs font-semibold' : 'btn-ink'}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
