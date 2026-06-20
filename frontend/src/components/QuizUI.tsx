'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/lib/api';

interface QuizUIProps {
  questions: QuizQuestion[];
  title: string;
  subtitle: string;
  onSubmit: (answers: { questionId: string; selectedOption: number }[]) => Promise<void>;
  loading?: boolean;
}

export default function QuizUI({ questions, title, subtitle, onSubmit, loading }: QuizUIProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const q = questions[current];
  const selected = q ? answers[q.id] : undefined;
  const progress = ((current + 1) / questions.length) * 100;

  async function handleNext() {
    if (selected === undefined) return;
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setSubmitting(true);
      const payload = questions.map((question) => ({
        questionId: question.id,
        selectedOption: answers[question.id] ?? 0,
      }));
      await onSubmit(payload);
      setSubmitting(false);
    }
  }

  if (loading || !q) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="text-sm text-indigo-400">{subtitle}</p>
        <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
        <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            {q.skill} · {q.difficulty}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <p className="text-lg leading-relaxed text-slate-100">{q.text}</p>

        <div className="mt-6 space-y-3">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => setAnswers({ ...answers, [q.id]: idx })}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                selected === idx
                  ? 'border-indigo-500 bg-indigo-500/10 text-white'
                  : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs">
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrent(Math.max(0, current - 1))}
            disabled={current === 0}
            className="rounded-lg px-4 py-2 text-sm text-slate-400 disabled:opacity-30 hover:text-white"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={selected === undefined || submitting}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {submitting
              ? 'Submitting...'
              : current === questions.length - 1
                ? 'Submit Quiz'
                : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
