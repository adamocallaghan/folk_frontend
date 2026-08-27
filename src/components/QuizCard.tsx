'use client';

import React, { useState } from 'react';
import { QuizQuestionItem } from '@/types';
import { CheckCircle2, AlertCircle, HelpCircle, ChevronDown } from 'lucide-react';

interface QuizCardProps {
  question: QuizQuestionItem;
  index: number;
  onAnswerSubmit?: (questionId: string, answer: string, isCorrect: boolean) => void;
}

export default function QuizCard({ question, index, onAnswerSubmit }: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);

  const promptText =
    question.prompt || question.question_text || question.question || question.text || `Question ${index + 1}`;
  const hintText = question.hint || question.socratic_hint;
  const qId = question.question_id || question.id || `q_${index + 1}`;

  const handleSubmit = (answerProvided?: string) => {
    const ans = answerProvided || selectedOption || customInput;
    if (!ans) return;

    setSubmitted(true);
    const correctAns = question.correct_answer || '';
    const correct =
      correctAns.trim().toLowerCase() === ans.trim().toLowerCase() ||
      correctAns.toLowerCase().includes(ans.toLowerCase()) ||
      ans.toLowerCase().includes(correctAns.toLowerCase());

    setIsCorrect(correct);
    if (!correct && hintText) {
      setShowHint(true);
    }
    if (onAnswerSubmit) {
      onAnswerSubmit(qId, ans, correct);
    }
  };

  return (
    <div className="panel p-5 space-y-4">
      {/* Question Header & ID */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600/20 text-indigo-400 font-mono text-[10px] font-bold">
            Q{index + 1}
          </span>
          <span className="text-[11px] font-mono text-slate-500">{qId}</span>
        </div>

        {submitted && (
          <span
            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
              isCorrect
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-3 w-3" /> Correct
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" /> Needs Review
              </>
            )}
          </span>
        )}
      </div>

      {/* The Actual Question Prompt */}
      <p className="text-sm font-medium text-slate-100 leading-relaxed">{promptText}</p>

      {/* Options List */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-2">
          {question.options.map((opt, i) => {
            const isSelected = selectedOption === opt;
            let btnClass = 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80';
            if (isSelected) {
              btnClass = isCorrect
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-200';
            }
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => {
                  setSelectedOption(opt);
                  handleSubmit(opt);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-all flex items-start gap-2.5 ${btnClass}`}
              >
                <span className="font-mono font-semibold text-slate-500">{String.fromCharCode(65 + i)}.</span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            disabled={submitted}
            placeholder="Type your explanation..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={submitted || !customInput.trim()}
            className="btn-primary px-3.5 py-2 text-xs"
          >
            Submit
          </button>
        </div>
      )}

      {/* Socratic Hint */}
      {hintText && (
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <HelpCircle className="h-3 w-3" />
            <span>{showHint ? 'Hide Socratic Guidance' : 'Need a hint?'}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showHint ? 'rotate-180' : ''}`} />
          </button>

          {showHint && (
            <div className="mt-2 p-3 rounded bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
              <strong className="block text-indigo-300 mb-0.5">Socratic Prompt:</strong>
              {hintText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
