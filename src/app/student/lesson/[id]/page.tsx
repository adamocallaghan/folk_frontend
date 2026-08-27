'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurriculumPackage, sendStudentChat, evaluateSession } from '@/lib/api';
import { LessonPackage, ChatMessage, LessonSectionItem } from '@/types';
import MermaidViewer from '@/components/MermaidViewer';
import QuizCard from '@/components/QuizCard';
import { Send, CheckCircle2, Award, ArrowLeft, RefreshCw } from 'lucide-react';

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
            content: `Hi! I'm Aura, your assistant for "${title}". As you read through the sections, feel free to ask me any questions if something is confusing.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      })
      .catch((err) => {
        console.warn('Lesson fetch error:', err);
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1714]">
        <Link href="/student" className="flex items-center gap-1.5 text-xs text-[#1a1714] hover:underline font-bold">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Lessons</span>
        </Link>
        <span className="tag-ink">
          {packageId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Lesson Reader */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-[#1a1714] bg-[#ffffff] p-6 space-y-6">
            <div className="space-y-1.5">
              <span className="tag-ink bg-[#ebd9be] border-[#1a1714] text-[#1a1714]">
                {lessonPackage?.framework?.target_age_group || lessonPackage?.target_age_group || 'Grade 7-8'}
              </span>
              <h1 className="text-3xl font-bold text-[#1a1714] font-serif tracking-tight mt-1">
                {lessonPackage?.primary_text?.lesson_title || lessonPackage?.framework?.topic || 'Lesson Overview'}
              </h1>
            </div>

            {lessonPackage?.primary_text?.introduction && (
              <div className="p-4 bg-[#f5f0e8] border border-[#1a1714]">
                <p className="text-sm text-[#1a1714] leading-relaxed">{lessonPackage.primary_text.introduction}</p>
              </div>
            )}

            {/* Diagrams */}
            {(resolvedDiagrams.length > 0 || resolvedChart) && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#1a1714] uppercase tracking-wider font-mono">Concept Diagram</h3>
                <MermaidViewer
                  chart={resolvedChart}
                  diagrams={resolvedDiagrams}
                  caption={lessonPackage?.visuals?.diagram_caption || lessonPackage?.visual_assets?.diagram_caption}
                />
              </div>
            )}

            {/* Sections */}
            <div className="space-y-4">
              {resolvedSections.map((sec, idx) => {
                const secTitle = sec.title || sec.section_title || sec.heading || `Section ${idx + 1}`;
                const secBody = sec.body_markdown || sec.body_text || sec.content || '';
                const checkpoint = sec.checkpoint_question || sec.check_for_understanding_prompt;

                return (
                  <div key={idx} className="p-5 bg-[#f5f0e8] border border-[#1a1714] space-y-2.5">
                    <h3 className="text-base font-bold text-[#1a1714] font-serif">{secTitle}</h3>
                    <div className="text-xs text-[#1a1714] leading-relaxed whitespace-pre-wrap">{secBody}</div>
                    {checkpoint && (
                      <div className="p-3 bg-[#cbd7c7] border border-[#1a1714] text-xs text-[#1a1714]">
                        <strong className="block mb-0.5 font-mono">Check for Understanding:</strong> {checkpoint}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {lessonPackage?.primary_text?.conclusion && (
              <div className="p-4 bg-[#f5f0e8] border border-[#1a1714]">
                <h4 className="font-bold text-[#1a1714] text-xs mb-1 uppercase font-mono">Conclusion</h4>
                <p className="text-xs text-[#1a1714] leading-relaxed">{lessonPackage.primary_text.conclusion}</p>
              </div>
            )}

            {/* Quizzes */}
            {resolvedQuestions.length > 0 && (
              <div className="pt-6 border-t border-[#1a1714] space-y-4">
                <h3 className="text-lg font-bold text-[#1a1714] font-serif">
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
                className="btn-ink w-full py-3.5 flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Lesson & Save Progress</span>
              </button>
            ) : (
              <div className="p-5 bg-[#cbd7c7] border border-[#1a1714] space-y-3">
                <h4 className="text-sm font-bold text-[#1a1714] font-serif flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Lesson Completed
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#ffffff] border border-[#1a1714]">
                    <span className="text-[#8a8075] block text-[11px] font-mono">QUIZ SCORE:</span>
                    <strong className="text-[#1a1714] text-xl font-mono">{sessionEvaluation.comprehension_score}%</strong>
                  </div>
                  <div className="p-3 bg-[#ffffff] border border-[#1a1714]">
                    <span className="text-[#8a8075] block text-[11px] font-mono">PACING & LOAD:</span>
                    <strong className="text-[#1a1714] text-xl font-mono">{sessionEvaluation.cognitive_load_index}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Aura Tutor Chat */}
        <div className="lg:col-span-5 flex flex-col h-[680px] border border-[#1a1714] bg-[#ffffff] overflow-hidden sticky top-6">
          <div className="p-3.5 border-b border-[#1a1714] bg-[#e8e0d0] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1a1714] font-serif">Aura (Tutor)</h3>
              <p className="text-[10px] text-[#8a8075]">Ask questions anytime as you read</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f5f0e8]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 text-xs leading-relaxed border border-[#1a1714] ${
                    m.role === 'user'
                      ? 'bg-[#1a1714] text-[#f5f0e8]'
                      : 'bg-[#ffffff] text-[#1a1714] whitespace-pre-wrap shadow-[2px_2px_0px_0px_#1a1714]'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-[#8a8075] mt-0.5 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center gap-2 text-xs text-[#1a1714] p-2 bg-[#ebd9be] border border-[#1a1714]">
                <RefreshCw className="h-3 w-3 animate-spin text-[#c84b2f]" />
                <span>Aura is thinking...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-2.5 border-t border-[#1a1714] bg-[#e8e0d0] flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask a question about this lesson..."
              className="flex-1 border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className="btn-ink"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
