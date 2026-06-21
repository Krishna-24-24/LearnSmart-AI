'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizQuestion } from '@/lib/api';
import { Clock, ChevronLeft, ChevronRight, Send, Brain, Zap, AlertTriangle } from 'lucide-react';

interface QuizUIProps {
  questions: QuizQuestion[];
  title: string;
  subtitle: string;
  onSubmit: (answers: { questionId: string; selectedOption: number }[]) => Promise<void>;
  loading?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E'];

const difficultyConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Brain }> = {
  easy:   { label: 'Easy',   color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)', icon: Zap },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', icon: Brain },
  hard:   { label: 'Hard',   color: '#f43f5e', bg: 'rgba(244,63,94,0.10)',  border: 'rgba(244,63,94,0.25)',  icon: AlertTriangle },
};

function getDiffConfig(difficulty: string) {
  const key = difficulty?.toLowerCase();
  return difficultyConfig[key] || difficultyConfig.medium;
}

/* ─── Timer display ─────────────────────────────────────────────────────────── */
function TimerDisplay({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const isWarning = seconds < 60 && seconds > 0;
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 transition-all ${
      isWarning
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
        : 'border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]'
    }`}>
      <Clock className={`h-3.5 w-3.5 ${isWarning ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-700 tabular-nums" style={{ fontWeight: 700 }}>
        {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ─── Loading skeleton ─────────────────────────────────────────────────────── */
function QuizSkeleton({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="text-center mb-12">
        <p className="text-sm text-[var(--brand-secondary)] font-500 mb-2" style={{ fontWeight: 500 }}>{subtitle}</p>
        <h1 className="text-2xl font-800 text-[var(--text-primary)]" style={{ fontWeight: 800 }}>{title}</h1>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-3 rounded-full" />
        <div className="card p-8 space-y-4">
          <div className="skeleton h-6 w-3/4 rounded" />
          <div className="skeleton h-4 w-1/2 rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main QuizUI ───────────────────────────────────────────────────────────── */
export default function QuizUI({ questions, title, subtitle, onSubmit, loading }: QuizUIProps) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1); // 1=forward, -1=back
  const [elapsed, setElapsed] = useState(0);

  /* Timer */
  useEffect(() => {
    if (loading || submitting) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [loading, submitting]);

  const q = questions[current];
  const selected = q ? answers[q.id] : undefined;
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const diffCfg = q ? getDiffConfig(q.difficulty) : getDiffConfig('medium');

  /* Keyboard shortcut handler */
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!q || submitting) return;
    const key = e.key.toLowerCase();
    if (['a','b','c','d','e'].includes(key)) {
      const idx = ['a','b','c','d','e'].indexOf(key);
      if (idx < q.options.length) setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    } else if (['1','2','3','4','5'].includes(key)) {
      const idx = parseInt(key) - 1;
      if (idx < q.options.length) setAnswers((prev) => ({ ...prev, [q.id]: idx }));
    } else if (key === 'enter' || key === 'arrowright') {
      if (selected !== undefined) {
        if (current < questions.length - 1) { setDirection(1); setCurrent(current + 1); }
        else handleSubmit();
      }
    } else if (key === 'arrowleft') {
      if (current > 0) { setDirection(-1); setCurrent(current - 1); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, submitting, selected, current, questions.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  async function navigate(dir: number) {
    const next = current + dir;
    if (next < 0 || next >= questions.length) return;
    setDirection(dir);
    setCurrent(next);
  }

  async function handleSubmit() {
    setSubmitting(true);
    const payload = questions.map((question) => ({
      questionId: question.id,
      selectedOption: answers[question.id] ?? 0,
    }));
    try {
      await onSubmit(payload);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || (!q && questions.length === 0)) {
    return <QuizSkeleton title={title} subtitle={subtitle} />;
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      {/* ── Header ── */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-600 uppercase tracking-widest text-[var(--brand-secondary)] mb-1.5" style={{ fontWeight: 600 }}>
              {subtitle}
            </p>
            <h1 className="text-xl font-800 text-[var(--text-primary)]" style={{ fontWeight: 800 }}>{title}</h1>
          </div>
          <TimerDisplay seconds={elapsed} />
        </div>

        {/* Progress track */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2.5">
            <span>Question {current + 1} of {questions.length}</span>
            <span className="font-500" style={{ fontWeight: 500 }}>{answeredCount} answered</span>
          </div>
          {/* Progress bar */}
          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #6366f1, #818cf8)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          {/* Dot indicators for small quiz */}
          {questions.length <= 15 && (
            <div className="mt-3 flex gap-1.5 flex-wrap">
              {questions.map((qn, i) => (
                <button
                  key={qn.id}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    i === current
                      ? 'w-5 bg-indigo-400'
                      : answers[qn.id] !== undefined
                      ? 'w-2 bg-indigo-500/50'
                      : 'w-2 bg-white/[0.10]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Question Card ── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="card card-shine p-7">
            {/* Tags row */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="flex items-center gap-1.5 text-[10px] font-700 px-2.5 py-1 rounded-full"
                style={{
                  color: diffCfg.color,
                  background: diffCfg.bg,
                  border: `1px solid ${diffCfg.border}`,
                  fontWeight: 700,
                }}
              >
                <diffCfg.icon className="h-3 w-3" />
                {diffCfg.label}
              </span>
              <span className="badge badge-info">{q.skill}</span>
              {q.targetMastery !== undefined && (
                <span className="ml-auto text-[10px] text-[var(--text-muted)] font-500" style={{ fontWeight: 500 }}>
                  Target: {Math.round(q.targetMastery * 100)}% mastery
                </span>
              )}
            </div>

            {/* Question text */}
            <p className="text-base font-500 leading-relaxed text-[var(--text-primary)] mb-7" style={{ fontWeight: 500 }}>
              {q.text}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((option, idx) => {
                const isSelected = selected === idx;
                return (
                  <motion.button
                    key={idx}
                    onClick={() => setAnswers({ ...answers, [q.id]: idx })}
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.998 }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.25 }}
                    className={`w-full text-left rounded-xl border px-5 py-4 transition-all duration-200 flex items-center gap-4 group ${
                      isSelected
                        ? 'border-indigo-500/60 bg-indigo-500/12 shadow-[0_0_0_1px_rgba(99,102,241,0.3),0_4px_12px_rgba(99,102,241,0.15)]'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:bg-white/[0.04]'
                    }`}
                  >
                    {/* Letter badge */}
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-700 transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                        : 'bg-white/[0.06] text-[var(--text-muted)] group-hover:bg-white/[0.10] group-hover:text-[var(--text-secondary)]'
                    }`} style={{ fontWeight: 700 }}>
                      {OPTION_LABELS[idx]}
                    </span>
                    <span className={`text-sm leading-snug transition-colors duration-200 ${
                      isSelected ? 'text-[var(--text-primary)] font-500' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                    }`} style={{ fontWeight: isSelected ? 500 : 400 }}>
                      {option}
                    </span>
                    {/* Right indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="ml-auto flex-shrink-0"
                      >
                        <div className="h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="mt-3 text-center text-[10px] text-[var(--text-muted)]">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/[0.10] font-mono text-[9px]">A</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/[0.10] font-mono text-[9px]">D</kbd> to select &nbsp;·&nbsp;
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/[0.10] font-mono text-[9px]">Enter</kbd> to advance
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          disabled={current === 0}
          className="flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-overlay)] px-4 py-2.5 text-sm font-500 text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontWeight: 500 }}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        {/* Center: question progress */}
        <span className="text-xs text-[var(--text-muted)] tabular-nums">
          {current + 1} / {questions.length}
        </span>

        {current < questions.length - 1 ? (
          <button
            onClick={() => navigate(1)}
            disabled={selected === undefined}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-600 text-white shadow-[0_4px_12px_rgba(99,102,241,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(99,102,241,0.45)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            style={{ fontWeight: 600 }}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={selected === undefined || submitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-600 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontWeight: 600 }}
          >
            {submitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Quiz
              </>
            )}
          </button>
        )}
      </div>

      {/* ── Summary Strip ── */}
      {questions.length > 3 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-8 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="text-xs text-[var(--text-muted)]">
              <span className="font-600 text-[var(--text-secondary)]" style={{ fontWeight: 600 }}>{answeredCount}</span> of {questions.length} answered
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 rounded-full bg-indigo-500"
              style={{ width: `${(answeredCount / questions.length) * 80}px`, maxWidth: 80 }}
            />
          </div>
          {answeredCount === questions.length && current < questions.length - 1 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                const firstUnanswered = questions.findIndex((qn) => answers[qn.id] === undefined);
                if (firstUnanswered >= 0) { setDirection(firstUnanswered > current ? 1 : -1); setCurrent(firstUnanswered); }
                else handleSubmit();
              }}
              className="text-xs font-600 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              style={{ fontWeight: 600 }}
            >
              All answered — Submit <ChevronRight className="h-3 w-3" />
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}
