'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurriculumPackage, sendStudentChat, evaluateSession } from '@/lib/api';
import { LessonPackage, ChatMessage, LessonSectionItem } from '@/types';
import MermaidViewer from '@/components/MermaidViewer';
import QuizCard from '@/components/QuizCard';
import { BookOpen, Send, CheckCircle2, Award, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function StudentLessonPage() {
  const params = useParams();
  const packageId = params.id as string;

  const [lessonPackage, setLessonPackage] = useState<LessonPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [quizScore, setQuizScore] = useState<{ [qId: string]: boolean }>({});
  const [sessionEvaluation, setSessionEvaluation] = useState<any>(null);

  const sessionId = `sess_${packageId}_student_demo_101`;
  const studentId = 'student_demo_101';

  useEffect(() => {
    getCurriculumPackage(packageId)
      .then((data) => {
        setLessonPackage(data.curriculum);
        setLoading(false);
        const title = data.curriculum.primary_text?.lesson_title || data.curriculum.framework?.topic || 'this lesson';
        setMessages([
          {
            id: 'init_1',
            role: 'assistant',
            content: `Hello! I'm Aura, your tutor for "${title}". Read through the sections and diagrams at your own pace. If anything feels unclear, ask me anything!`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      })
      .catch((err) => {
        console.warn('Curriculum fetch error:', err);
        setLoading(false);
      });
  }, [packageId]);

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
    try {
      const res = await evaluateSession({
        session_id: sessionId,
        student_id: studentId,
        lesson_id: packageId,
        quiz_answers: quizScore,
        chat_transcript: messages.map((m) => `${m.role}: ${m.content}`).join('\n'),
      });
      setSessionEvaluation(res.session_evaluation);
    } catch (err: any) {
      console.error('Evaluation error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-xs text-slate-500 gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
        <span>Loading lesson module from Firestore...</span>
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link href="/student" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Lesson Catalog</span>
        </Link>
        <span className="font-mono text-xs text-indigo-400 bg-slate-900 px-3 py-1 rounded border border-slate-800">
          {packageId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Lesson Reader */}
        <div className="lg:col-span-7 space-y-6">
          <div className="panel p-6 space-y-6">
            <div className="space-y-2">
              <span className="badge-tag text-indigo-400">
                {lessonPackage?.framework?.target_age_group || lessonPackage?.target_age_group || 'Grade 7-8'}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {lessonPackage?.primary_text?.lesson_title || lessonPackage?.framework?.topic || 'Lesson Module'}
              </h1>
            </div>

            {lessonPackage?.primary_text?.introduction && (
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <p className="text-sm text-slate-200 leading-relaxed">{lessonPackage.primary_text.introduction}</p>
              </div>
            )}

            {/* Diagrams */}
            {(resolvedDiagrams.length > 0 || resolvedChart) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Architectural Blueprint</h3>
                <MermaidViewer
                  chart={resolvedChart}
                  diagrams={resolvedDiagrams}
                  caption={lessonPackage?.visuals?.diagram_caption || lessonPackage?.visual_assets?.diagram_caption}
                />
              </div>
            )}

            {/* Core Sections */}
            <div className="space-y-4">
              {resolvedSections.map((sec, idx) => {
                const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                return (
                  <div key={idx} className="p-5 rounded-lg bg-slate-900/40 border border-slate-800 space-y-2.5">
                    <h3 className="text-sm font-bold text-white">{secTitle}</h3>
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{secBody}</div>
                    {checkpoint && (
                      <div className="p-3 rounded bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200 font-medium">
                        💡 <strong>Concept Checkpoint:</strong> {checkpoint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {lessonPackage?.primary_text?.conclusion && (
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h4 className="font-bold text-slate-300 text-xs mb-1">Conclusion</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{lessonPackage.primary_text.conclusion}</p>
              </div>
            )}

            {/* Quizzes */}
            {resolvedQuestions.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">
                  {lessonPackage?.assessment?.quiz_title || 'Concept Mastery Checkpoints'}
                </h3>
                {resolvedQuestions.map((q, i) => (
                  <QuizCard key={q.question_id || q.id || i} question={q} index={i} onAnswerSubmit={handleQuizAnswer} />
                ))}
              </div>
            )}

            {/* Complete Sitting Button */}
            {!sessionEvaluation ? (
              <button
                onClick={handleFinishLesson}
                className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Sitting & Evaluate Cognitive Signals</span>
              </button>
            ) : (
              <div className="p-5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Workflow 3 Session Diagnostic Complete
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Comprehension Score:</span>
                    <strong className="text-emerald-400 text-base font-mono">{sessionEvaluation.comprehension_score}%</strong>
                  </div>
                  <div className="p-3 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Cognitive Load Index:</span>
                    <strong className="text-cyan-400 text-base font-mono">{sessionEvaluation.cognitive_load_index}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Aura Socratic Tutor Chat */}
        <div className="lg:col-span-5 flex flex-col h-[680px] panel overflow-hidden sticky top-6">
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <div>
                <h3 className="text-xs font-bold text-white">Aura &bull; Socratic Tutor</h3>
                <p className="text-[10px] text-slate-400">Empathetic Pedagogical Dialogue</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center gap-2 text-xs text-indigo-300 p-2 rounded bg-indigo-950/20">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Aura is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-2.5 border-t border-slate-800 bg-slate-900/40 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Aura a question about the lesson..."
              className="flex-1 rounded-md bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className="btn-primary px-3 py-2 text-xs"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
