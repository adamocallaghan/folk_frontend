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
    <div className="border border-[#1a1714] bg-[#ffffff] p-5 space-y-4">
      {/* Question Header & ID */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center bg-[#1a1714] text-[#f5f0e8] font-mono text-[10px] font-bold">
            {index + 1}
          </span>
          <span className="text-[11px] font-mono text-[#8a8075]">{qId}</span>
        </div>

        {submitted && (
          <span
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 border ${
              isCorrect
                ? 'bg-[#cbd7c7] text-[#1a1714] border-[#1a1714]'
                : 'bg-[#ebd4cc] text-[#1a1714] border-[#1a1714]'
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
      <p className="text-sm font-semibold text-[#1a1714] leading-relaxed font-serif">{promptText}</p>

      {/* Options List */}
      {question.options && question.options.length > 0 ? (
        <div className="space-y-2">
          {question.options.map((opt: string, i: number) => {
            const isSelected = selectedOption === opt;
            let btnClass = 'bg-[#f5f0e8] border-[#1a1714] text-[#1a1714] hover:bg-[#e8e0d0]';
            if (isSelected) {
              btnClass = isCorrect
                ? 'bg-[#cbd7c7] border-[#1a1714] font-bold text-[#1a1714]'
                : 'bg-[#ebd4cc] border-[#1a1714] font-bold text-[#1a1714]';
            }
            return (
              <button
                key={i}
                disabled={submitted}
                onClick={() => {
                  setSelectedOption(opt);
                  handleSubmit(opt);
                }}
                className={`w-full text-left px-3.5 py-2.5 border text-xs transition-all flex items-start gap-2.5 ${btnClass}`}
              >
                <span className="font-mono font-bold text-[#1a1714]">{String.fromCharCode(65 + i)}.</span>
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
            className="flex-1 border border-[#1a1714] bg-[#f5f0e8] px-3 py-2 text-xs text-[#1a1714] placeholder-[#8a8075] focus:outline-none"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={submitted || !customInput.trim()}
            className="btn-ink px-4 py-2 text-xs"
          >
            Submit
          </button>
        </div>
      )}

      {/* Socratic Hint */}
      {hintText && (
        <div className="pt-2 border-t border-[#1a1714]">
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 text-xs text-[#c84b2f] font-semibold"
          >
            <HelpCircle className="h-3 w-3" />
            <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showHint ? 'rotate-180' : ''}`} />
          </button>

          {showHint && (
            <div className="mt-2 p-3 bg-[#ebd9be] border border-[#1a1714] text-xs text-[#1a1714] leading-relaxed">
              <strong className="block mb-0.5">Hint:</strong>
              {hintText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
