'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { AdaptiveResult } from '@/lib/api';
import {
  ArrowRight, RotateCcw, Brain, TrendingUp,
  CheckCircle2, XCircle, Lightbulb, Sparkles, BarChart2,
  ChevronRight, Star, Target, Zap
} from 'lucide-react';

/* ─── Animated number ─────────────────────────────────────────────────────── */
function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(e * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ─── Score Ring ─────────────────────────────────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const size = 160;
  const sw = 12;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#f43f5e';
  const glow = score >= 70 ? 'rgba(16,185,129,0.6)' : score >= 40 ? 'rgba(245,158,11,0.6)' : 'rgba(244,63,94,0.6)';

  return (
    <div className="relative inline-flex">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r+4} fill="none" stroke={`${color}12`} strokeWidth={sw+8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          filter={`drop-shadow(0 0 8px ${glow})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-900 tabular-nums" style={{ color, fontWeight: 900 }}>
          <AnimatedNumber target={score} duration={1800} />
        </span>
        <span className="text-sm text-[var(--text-muted)] font-500" style={{ fontWeight: 500 }}>percent</span>
      </div>
    </div>
  );
}

/* ─── Mastery delta chip ─────────────────────────────────────────────────── */
function MasteryDelta({ updated }: { updated: number }) {
  const pct = Math.round(updated * 100);
  return (
    <span className="text-xs font-700 tabular-nums px-2 py-0.5 rounded-full"
      style={{
        fontWeight: 700,
        background: 'rgba(99,102,241,0.15)',
        color: '#818cf8',
        border: '1px solid rgba(99,102,241,0.25)',
      }}
    >
      {pct}%
    </span>
  );
}

/* ─── Confetti burst (simple CSS) ────────────────────────────────────────── */
function Confetti({ score }: { score: number }) {
  if (score < 70) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: '-10px',
            background: ['#6366f1','#10b981','#f59e0b','#22d3ee','#f43f5e','#a78bfa'][i % 6],
          }}
          initial={{ y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            y: `${200 + Math.random() * 300}px`,
            opacity: [1, 1, 0],
            rotate: Math.random() * 360,
            scale: [1, 1.2, 0.6],
          }}
          transition={{ duration: 1.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

/* ─── Main Results Page ──────────────────────────────────────────────────── */
export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AdaptiveResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('learnsmart_quiz_result');
    if (!raw) { router.push('/dashboard'); return; }
    const parsed: AdaptiveResult = JSON.parse(raw);
    setResult(parsed);
    if (parsed.summary.scorePercent >= 70) {
      setTimeout(() => setShowConfetti(true), 400);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  const { summary, results, recommendations, analytics } = result;
  const { scorePercent, correct, total } = summary;

  const scoreColor = scorePercent >= 70 ? '#10b981' : scorePercent >= 40 ? '#f59e0b' : '#f43f5e';
  const scoreBg    = scorePercent >= 70 ? 'rgba(16,185,129,0.08)'  : scorePercent >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(244,63,94,0.08)';
  const scoreBorder= scorePercent >= 70 ? 'rgba(16,185,129,0.20)'  : scorePercent >= 40 ? 'rgba(245,158,11,0.20)' : 'rgba(244,63,94,0.20)';

  const motivational = scorePercent >= 80
    ? { emoji: '🏆', title: 'Outstanding!', msg: "You're crushing it. Your mastery is growing fast." }
    : scorePercent >= 60
    ? { emoji: '⚡', title: 'Great Work!', msg: 'Strong performance. Review the weaker areas to level up.' }
    : scorePercent >= 40
    ? { emoji: '📈', title: 'Keep Going!', msg: "You're making progress. Every attempt builds mastery." }
    : { emoji: '🎯', title: 'Keep Practicing!', msg: 'The AI has identified your weak spots. Focus time there.' };

  const primaryRec = recommendations[0];

  // Group results by correct/incorrect
  const correctResults   = results.filter((r) => r.correct);
  const incorrectResults = results.filter((r) => !r.correct);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">

      {/* ── Score Hero ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative rounded-3xl overflow-hidden mb-8 text-center py-12 px-8"
        style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)` }} />
        <AnimatePresence>{showConfetti && <Confetti score={scorePercent} />}</AnimatePresence>

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex justify-center mb-6"
        >
          <ScoreRing score={scorePercent} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-4xl mb-2">{motivational.emoji}</div>
          <h1 className="text-2xl font-800 text-[var(--text-primary)] mb-1" style={{ fontWeight: 800 }}>
            {motivational.title}
          </h1>
          <p className="text-[var(--text-secondary)] mb-5">{motivational.msg}</p>

          {/* Score stats */}
          <div className="inline-flex items-center divide-x divide-white/[0.08] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            {[
              { label: 'Correct',   value: correct,         color: '#10b981' },
              { label: 'Incorrect', value: total - correct,  color: '#f43f5e' },
              { label: 'Total',     value: total,            color: scoreColor },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-6 py-3.5 text-center">
                <p className="text-xl font-800 tabular-nums" style={{ color, fontWeight: 800 }}>{value}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ── AI Coach Insight ── */}
      {primaryRec && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-2xl p-6 mb-6 relative overflow-hidden card-shine"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(167,139,250,0.06))',
            border: '1px solid rgba(99,102,241,0.25)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/25">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-700 uppercase tracking-widest text-[var(--brand-secondary)]" style={{ fontWeight: 700 }}>AI Coach Insight</p>
                <span className="badge badge-info">
                  <Sparkles className="h-2.5 w-2.5" />
                  Explainable AI
                </span>
              </div>
              <h2 className="text-lg font-700 text-indigo-200 mb-2" style={{ fontWeight: 700 }}>
                Focus on: {primaryRec.skill}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{primaryRec.explanation}</p>

              <div className="grid sm:grid-cols-2 gap-3">
                {primaryRec.commonError && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3">
                    <p className="text-[10px] font-700 uppercase tracking-wider text-amber-400 mb-1" style={{ fontWeight: 700 }}>Common Error</p>
                    <p className="text-xs text-[var(--text-secondary)]">{primaryRec.commonError}</p>
                  </div>
                )}
                {primaryRec.suggestedAction && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3">
                    <p className="text-[10px] font-700 uppercase tracking-wider text-emerald-400 mb-1" style={{ fontWeight: 700 }}>Suggested Action</p>
                    <p className="text-xs font-500 text-emerald-300" style={{ fontWeight: 500 }}>{primaryRec.suggestedAction}</p>
                  </div>
                )}
              </div>

              {primaryRec.masteryPercent !== undefined && (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-[var(--text-muted)]">Current mastery:</span>
                  <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${primaryRec.masteryPercent}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                    />
                  </div>
                  <span className="text-xs font-700 text-indigo-400 tabular-nums" style={{ fontWeight: 700 }}>{primaryRec.masteryPercent}%</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Skill Breakdown ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <BarChart2 className="h-4 w-4 text-[var(--text-muted)]" />
          <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Question-by-Question Breakdown</h2>
          <span className="ml-auto badge badge-info">{results.length} questions</span>
        </div>

        {/* Summary tabs */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-800 text-emerald-400" style={{ fontWeight: 800 }}>{correctResults.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Correct</p>
            </div>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/8 p-3 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-800 text-rose-400" style={{ fontWeight: 800 }}>{incorrectResults.length}</p>
              <p className="text-xs text-[var(--text-muted)]">Incorrect</p>
            </div>
          </div>
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {results.map((r, i) => (
            <motion.div
              key={r.questionId}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.04, duration: 0.3 }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-all ${
                r.correct
                  ? 'border-emerald-500/15 bg-emerald-500/5'
                  : 'border-rose-500/15 bg-rose-500/5'
              }`}
            >
              {r.correct
                ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                : <XCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
              }
              <span className="flex-1 text-sm text-[var(--text-secondary)] truncate">{r.skill}</span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-600 ${r.correct ? 'text-emerald-400' : 'text-rose-400'}`} style={{ fontWeight: 600 }}>
                  {r.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
                <MasteryDelta updated={r.updatedMastery} />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Additional Recommendations ── */}
      {recommendations.length > 1 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>More Improvement Suggestions</h2>
          </div>
          <div className="space-y-3">
            {recommendations.slice(1).map((rec, i) => (
              <motion.div
                key={rec.skill}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-indigo-400" />
                    <p className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>{rec.skill}</p>
                  </div>
                  <span className="text-xs font-700 text-indigo-400 tabular-nums" style={{ fontWeight: 700 }}>
                    {rec.masteryPercent}% mastery
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-2">{rec.explanation}</p>
                {rec.suggestedAction && (
                  <p className="text-xs font-500 text-emerald-400 flex items-center gap-1" style={{ fontWeight: 500 }}>
                    <ChevronRight className="h-3 w-3" />
                    {rec.suggestedAction}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ── Analytics Summary ── */}
      {analytics && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/8 p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <p className="text-xs text-[var(--text-muted)]">Avg Mastery</p>
            </div>
            <p className="text-2xl font-800 text-indigo-300 tabular-nums" style={{ fontWeight: 800 }}>
              <AnimatedNumber target={analytics.averageMasteryPercent} />%
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-[var(--text-muted)]">Strongest Skill</p>
            </div>
            <p className="text-sm font-700 text-emerald-300 truncate" style={{ fontWeight: 700 }}>
              {analytics.strongestSkill?.skill || '—'}
            </p>
          </div>
        </motion.section>
      )}

      {/* ── CTA Buttons ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-sm">
          <BarChart2 className="h-4 w-4" />
          View Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/quiz/adaptive" className="btn-secondary px-7 py-3.5 text-sm">
          <RotateCcw className="h-4 w-4" />
          Practice Again
        </Link>
      </motion.div>

      {/* XP gained */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 180 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-5 py-2.5">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-600 text-amber-300" style={{ fontWeight: 600 }}>
            +<AnimatedNumber target={correct * 15} /> XP earned this session
          </span>
          <Star className="h-4 w-4 text-amber-400" />
        </div>
      </motion.div>
    </div>
  );
}
