"use client";

import React, { useState } from "react";
import { QuizQuestion } from "@/types";
import { CheckCircle2, HelpCircle, AlertCircle, Lightbulb, ChevronDown } from "lucide-react";

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
  onAnswerSubmit?: (questionId: string, answer: string, isCorrect: boolean) => void;
}

export default function QuizCard({ question, index, onAnswerSubmit }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customAnswer, setCustomAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (answerToTest?: string) => {
    const finalAnswer = answerToTest || selectedOption || customAnswer;
    if (!finalAnswer) return;

    setSubmitted(true);
    // Flexible match against correct answer
    const correct =
      finalAnswer.trim().toLowerCase() === question.correct_answer.trim().toLowerCase() ||
      question.correct_answer.toLowerCase().includes(finalAnswer.toLowerCase());

    setIsCorrect(correct);
    if (!correct) {
      setShowHint(true); // Automatically reveal Socratic hint if wrong
    }
    if (onAnswerSubmit) {
      onAnswerSubmit(question.question_id, finalAnswer, correct);
    }
  };

  return (
    <div className="glass-panel p-5 my-4 border border-white/10 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/20 text-xs font-bold text-indigo-300 border border-indigo-500/30">
            Q{index + 1}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {question.question_id}
          </span>
        </div>

        {submitted && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isCorrect
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Correct!
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5" /> Let's rethink
              </>
            )}
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-slate-100 mb-4 leading-relaxed">
        {question.question_text}
      </p>

      {/* Multiple Choice Options (if available) */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => {
                  setSelectedOption(opt);
                  handleSubmit(opt);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-xs transition-all border ${
                  isSelected
                    ? isCorrect
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-200"
                    : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06] hover:border-white/10"
                }`}
              >
                <span className="font-semibold text-slate-400 mr-2">
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      ) : (
        /* Free form answer input */
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            disabled={submitted}
            placeholder="Type your explanation or response..."
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="flex-1 rounded-lg bg-black/40 border border-white/10 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={submitted || !customAnswer.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Check
          </button>
        </div>
      )}

      {/* Socratic Hint Drawer */}
      {question.socratic_hint && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
          >
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span>{showHint ? "Hide Socratic Guide" : "Need a hint?"}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showHint ? "rotate-180" : ""}`} />
          </button>

          {showHint && (
            <div className="mt-2 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed animate-in fade-in">
              <span className="font-semibold text-indigo-300 block mb-1">
                💭 Socratic Thought Prompt:
              </span>
              {question.socratic_hint}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
