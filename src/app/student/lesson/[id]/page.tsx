"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurriculumPackage, sendStudentChat, evaluateSession } from "@/lib/api";
import { LessonPackage, ChatMessage } from "@/types";
import MermaidViewer from "@/components/MermaidViewer";
import QuizCard from "@/components/QuizCard";
import { BookOpen, MessageSquare, Send, CheckCircle2, AlertCircle, RefreshCw, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.id as string;

  const [lessonPackage, setLessonPackage] = useState<LessonPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [quizScore, setQuizScore] = useState<{ [qId: string]: boolean }>({});
  const [sessionEvaluation, setSessionEvaluation] = useState<any>(null);

  const sessionId = `sess_${packageId}_student_demo_101`;
  const studentId = "student_demo_101";

  useEffect(() => {
    getCurriculumPackage(packageId)
      .then((data) => {
        setLessonPackage(data.curriculum);
        setLoading(false);
        // Initial greeting
        setMessages([
          {
            id: "init_1",
            role: "assistant",
            content: `Hello! I'm Aura, your tutor for "${data.curriculum.primary_text?.lesson_title || "this lesson"}". Take your time reading through the sections and diagram. If anything is confusing, just ask me anytime!`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      })
      .catch((err) => {
        console.warn("Curriculum fetch error:", err);
        setLoading(false);
      });
  }, [packageId]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "user",
      content: inputMsg,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");
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
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
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
        chat_transcript: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
      });
      setSessionEvaluation(res.session_evaluation);
    } catch (err: any) {
      console.error("Evaluation error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center text-xs text-slate-400 gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
        Loading lesson chamber from Firestore...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <Link href="/student" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Lessons
        </Link>
        <span className="font-mono text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          {packageId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Lesson Reading & Diagrams */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-8 border border-white/10 space-y-6">
            <h1 className="text-2xl font-extrabold text-white">
              {lessonPackage?.primary_text?.lesson_title || "Lesson Module"}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              {lessonPackage?.primary_text?.introduction}
            </p>

            {/* Mermaid Diagram */}
            {lessonPackage?.visuals?.mermaid_diagram_syntax && (
              <MermaidViewer
                chart={lessonPackage.visuals.mermaid_diagram_syntax}
                caption={lessonPackage.visuals.diagram_caption}
              />
            )}

            {/* Content Sections */}
            <div className="space-y-4 pt-2">
              {lessonPackage?.primary_text?.main_content_sections?.map((sec, idx) => (
                <div key={idx} className="rounded-xl bg-white/[0.02] p-5 border border-white/5 space-y-2">
                  <h3 className="text-base font-bold text-white">{sec.heading}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{sec.body_text}</p>
                </div>
              ))}
            </div>

            {/* Quiz Section */}
            {lessonPackage?.assessment?.questions && (
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h3 className="text-base font-bold text-white">
                  {lessonPackage.assessment.quiz_title || "Conceptual Checkpoint"}
                </h3>
                {lessonPackage.assessment.questions.map((q, i) => (
                  <QuizCard key={q.question_id || i} question={q} index={i} onAnswerSubmit={handleQuizAnswer} />
                ))}
              </div>
            )}

            {/* Complete Session Button */}
            {!sessionEvaluation ? (
              <button
                onClick={handleFinishLesson}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Complete Lesson Sitting & Synthesize Analytics</span>
              </button>
            ) : (
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Workflow 3 Session Diagnostic Complete
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Comprehension Score:</span>
                    <strong className="text-emerald-400 text-lg font-mono">{sessionEvaluation.comprehension_score}%</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Cognitive Load:</span>
                    <strong className="text-cyan-400 text-lg font-mono">{sessionEvaluation.cognitive_load_index}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Socratic Chat Companion */}
        <div className="lg:col-span-5 flex flex-col h-[700px] glass-panel border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <div>
              <h3 className="text-xs font-bold text-white">Aura &bull; Socratic Tutor</h3>
              <p className="text-[10px] text-slate-400">Ask any question or explain your reasoning</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-cyan-600 text-white rounded-br-none"
                      : "glass-panel bg-white/[0.04] border border-white/10 text-slate-200 rounded-bl-none whitespace-pre-wrap"
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}

            {sendingChat && (
              <div className="flex items-center gap-2 text-xs text-cyan-300 p-2 rounded-lg bg-cyan-950/20 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Aura is formulating a Socratic hint...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-white/5 bg-black/30 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Aura a question about this step..."
              className="flex-1 rounded-xl bg-black/50 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputMsg.trim()}
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
