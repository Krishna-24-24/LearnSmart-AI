'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Brain, Zap, BarChart3, Shield, ArrowRight, Star,
  TrendingUp, Users, CheckCircle2, ChevronRight, Sparkles,
  BookOpen, Target, Award, GitBranch
} from 'lucide-react';

/* ─── Animated counter hook ──────────────────────────────────────────────── */
function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return { count, ref };
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const stats = [
  { label: 'Questions Solved', value: 124000, suffix: '+', icon: CheckCircle2, color: '#10b981' },
  { label: 'Active Learners',  value: 8400,   suffix: '+', icon: Users,         color: '#6366f1' },
  { label: 'Avg Mastery Gain', value: 42,     suffix: '%', icon: TrendingUp,    color: '#f59e0b' },
  { label: 'DSA Skills Covered',value: 9,     suffix: '',  icon: BookOpen,      color: '#22d3ee' },
];

const features = [
  {
    icon: Brain,
    title: 'Bayesian Knowledge Tracing',
    description: 'Real-time mastery estimation using BKT — the same model used by top EdTech platforms. Every answer updates your skill model.',
    tag: 'Core AI',
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-violet-500/10',
  },
  {
    icon: Target,
    title: 'Item Response Theory',
    description: 'Questions selected by IRT difficulty calibration — not too hard, not too easy. Always in your zone of proximal development.',
    tag: 'Adaptive',
    color: '#22d3ee',
    gradient: 'from-cyan-500/20 to-sky-500/10',
  },
  {
    icon: Zap,
    title: 'Explainable AI',
    description: 'Every recommendation comes with mastery score, plain-English reasoning, and a concrete suggested action. No black boxes.',
    tag: 'Transparent',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track your skill mastery over time with radar charts, heatmaps, and improvement trendlines. See exactly where to focus.',
    tag: 'Insights',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
];

const learningPath = [
  { skill: 'Arrays',             mastery: 82, status: 'mastered' },
  { skill: 'Strings',            mastery: 74, status: 'mastered' },
  { skill: 'Linked Lists',       mastery: 61, status: 'in-progress' },
  { skill: 'Stacks & Queues',    mastery: 45, status: 'in-progress' },
  { skill: 'Trees',              mastery: 28, status: 'upcoming' },
  { skill: 'Graphs',             mastery: 0,  status: 'locked' },
  { skill: 'Dynamic Programming',mastery: 0,  status: 'locked' },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'SWE @ Google',
    text: 'LearnSmart\'s adaptive algorithm pinpointed my exact weak spots in DP. Within a week my mastery jumped from 22% to 61%. The BKT updates are incredibly motivating.',
    rating: 5,
    avatar: 'PS',
    color: '#6366f1',
  },
  {
    name: 'Arjun Mehta',
    role: 'CS Student, IIT Delhi',
    text: 'Finally an app that explains *why* it\'s recommending something. Other platforms just throw questions at you — LearnSmart tells me the reasoning behind every suggestion.',
    rating: 5,
    avatar: 'AM',
    color: '#10b981',
  },
  {
    name: 'Riya Patel',
    role: 'Software Engineer',
    text: 'The IRT-based difficulty selection is game-changing. I\'m not wasting time on easy questions or getting demoralized by impossible ones. It\'s always exactly right.',
    rating: 5,
    avatar: 'RP',
    color: '#f59e0b',
  },
];

const skills = ['Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Binary Search', 'Dynamic Programming'];

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const { count, ref } = useCounter(stat.value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="card card-shine p-6 flex flex-col items-center text-center group hover:scale-[1.02] transition-transform duration-300"
    >
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ background: `${stat.color}20`, border: `1px solid ${stat.color}30` }}
      >
        <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
      </div>
      <div className="text-3xl font-800 tabular-nums" style={{ fontWeight: 800, color: stat.color }}>
        <span ref={ref}>{count.toLocaleString()}</span>
        <span>{stat.suffix}</span>
      </div>
      <p className="mt-1 text-sm text-[var(--text-muted)] font-medium">{stat.label}</p>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl p-6 border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-all duration-300 hover:border-[var(--border-default)] hover:shadow-xl"
    >
      {/* Gradient fill on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}
          >
            <Icon className="h-5 w-5" style={{ color: feature.color }} />
          </div>
          <span
            className="text-[10px] font-700 tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background: `${feature.color}18`,
              color: feature.color,
              border: `1px solid ${feature.color}30`,
              fontWeight: 700,
            }}
          >
            {feature.tag}
          </span>
        </div>
        <h3 className="text-base font-600 text-[var(--text-primary)] leading-snug mb-2" style={{ fontWeight: 600 }}>
          {feature.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

function LearningPathPreview() {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="card p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Your Learning Path</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Personalized based on your mastery profile</p>
        </div>
        <span className="badge badge-info">
          <GitBranch className="h-3 w-3" />
          AI-Generated
        </span>
      </div>
      <div className="space-y-2.5">
        {learningPath.map((item, i) => (
          <motion.div
            key={item.skill}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all duration-200 cursor-default ${
              item.status === 'mastered'
                ? 'border-emerald-500/20 bg-emerald-500/5'
                : item.status === 'in-progress'
                ? 'border-indigo-500/25 bg-indigo-500/6'
                : item.status === 'upcoming'
                ? 'border-[var(--border-subtle)] bg-[var(--bg-overlay)]'
                : 'border-[var(--border-subtle)] bg-[var(--bg-overlay)] opacity-50'
            } ${hovered === i ? 'scale-[1.01]' : ''}`}
          >
            {/* Status indicator */}
            <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
              item.status === 'mastered' ? 'bg-emerald-500/20'
              : item.status === 'in-progress' ? 'bg-indigo-500/20'
              : 'bg-white/5'
            }`}>
              {item.status === 'mastered' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : item.status === 'in-progress' ? (
                <div className="h-3 w-3 rounded-full bg-indigo-400 animate-pulse" />
              ) : item.status === 'upcoming' ? (
                <div className="h-3 w-3 rounded-full border-2 border-slate-500" />
              ) : (
                <Shield className="h-4 w-4 text-slate-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-500 ${
                  item.status === 'locked' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                }`} style={{ fontWeight: 500 }}>
                  {item.skill}
                </span>
                {item.status === 'in-progress' && (
                  <span className="text-[10px] font-600 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20" style={{ fontWeight: 600 }}>
                    ACTIVE
                  </span>
                )}
              </div>
              {item.mastery > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.mastery}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${item.status === 'mastered' ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] tabular-nums">{item.mastery}%</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function TestimonialCard({ t, index }: { t: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -3 }}
      className="card card-shine p-6 flex flex-col gap-4 transition-all duration-300"
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-700 text-white"
          style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)`, fontWeight: 700 }}
        >
          {t.avatar}
        </div>
        <div>
          <p className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>{t.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative mx-auto max-w-7xl px-5 pt-24 pb-20 text-center">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-600 text-indigo-300 mb-8"
          style={{ fontWeight: 600 }}
        >
          <Sparkles className="h-3 w-3 animate-pulse-glow" />
          Powered by Bayesian Knowledge Tracing &amp; IRT
          <ChevronRight className="h-3 w-3" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-800 tracking-tight leading-[1.08]"
          style={{ fontWeight: 800 }}
        >
          <span className="text-[var(--text-primary)]">Master Skills,</span>
          <br />
          <span className="animate-gradient-text">Not Just Scores.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-secondary)] leading-relaxed"
        >
          LearnSmart uses AI-driven adaptive quizzes to diagnose exactly where you struggle,
          then builds a personalized path to true mastery — not just test scores.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/register" className="btn-primary text-base px-7 py-3.5">
            <Brain className="h-4 w-4" />
            Start Free Assessment
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/login" className="btn-secondary text-base px-7 py-3.5">
            Sign in to continue
          </Link>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)]"
        >
          {['No credit card required', 'Free diagnostic assessment', '9 DSA topics covered'].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              {t}
            </span>
          ))}
        </motion.div>

        {/* Hero visual - abstract skill radar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 mx-auto max-w-3xl"
        >
          <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-[var(--border-subtle)]">
              <div className="h-3 w-3 rounded-full bg-rose-500/70" />
              <div className="h-3 w-3 rounded-full bg-amber-500/70" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
              <span className="ml-3 text-xs text-[var(--text-muted)] font-medium">LearnSmart — Dashboard Preview</span>
            </div>
            {/* Mock skill bars */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { s: 'Arrays',     p: 84, c: '#10b981' },
                { s: 'Strings',    p: 72, c: '#10b981' },
                { s: 'Linked Lists', p: 58, c: '#f59e0b' },
                { s: 'Trees',      p: 41, c: '#f59e0b' },
                { s: 'Graphs',     p: 24, c: '#f43f5e' },
                { s: 'DP',         p: 12, c: '#f43f5e' },
              ].map((item, i) => (
                <motion.div
                  key={item.s}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-500 text-[var(--text-secondary)]" style={{ fontWeight: 500 }}>{item.s}</span>
                    <span className="text-xs font-700 tabular-nums" style={{ color: item.c, fontWeight: 700 }}>{item.p}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.p}%` }}
                      transition={{ duration: 1, delay: 0.7 + i * 0.1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: item.c }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Floating XP badge */}
            <motion.div
              className="absolute -right-4 -top-4 flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 shadow-lg"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-700 text-amber-300" style={{ fontWeight: 700 }}>+120 XP</span>
            </motion.div>
            <motion.div
              className="absolute -left-4 -bottom-4 flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 shadow-lg"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <Zap className="h-3.5 w-3.5 text-indigo-400" />
              <span className="text-xs font-700 text-indigo-300" style={{ fontWeight: 700 }}>7-day streak 🔥</span>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-700 tracking-widest uppercase text-[var(--brand-secondary)] mb-3 inline-block" style={{ fontWeight: 700 }}>
            The Technology
          </span>
          <h2 className="text-3xl sm:text-4xl font-800 text-[var(--text-primary)] tracking-tight" style={{ fontWeight: 800 }}>
            Built on real learning science
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto">
            Not another quiz app — a proper cognitive model that adapts to how you actually learn.
          </p>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </section>

      {/* ── Learning Path Preview ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-700 tracking-widest uppercase text-[var(--brand-secondary)] mb-3 inline-block" style={{ fontWeight: 700 }}>
              Personalized Paths
            </span>
            <h2 className="text-3xl sm:text-4xl font-800 text-[var(--text-primary)] tracking-tight leading-tight" style={{ fontWeight: 800 }}>
              Your learning path,<br />generated by AI.
            </h2>
            <p className="mt-5 text-[var(--text-secondary)] leading-relaxed">
              After your 15-question diagnostic, the system maps your mastery across 9 DSA topics
              and generates an optimal learning sequence — always tackling your weakest skill at
              the difficulty level that maximizes retention.
            </p>
            <div className="mt-8 flex flex-col gap-3">
              {[
                { icon: Brain,    text: 'Diagnostic initializes your full mastery profile' },
                { icon: Target,   text: 'IRT selects the right difficulty every time' },
                { icon: TrendingUp, text: 'BKT updates mastery after every question' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/20">
                    <Icon className="h-3 w-3 text-indigo-400" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/register" className="btn-primary">
                Build my learning path
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          <LearningPathPreview />
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-700 tracking-widest uppercase text-[var(--brand-secondary)] mb-3 inline-block" style={{ fontWeight: 700 }}>
            What Learners Say
          </span>
          <h2 className="text-3xl sm:text-4xl font-800 text-[var(--text-primary)] tracking-tight" style={{ fontWeight: 800 }}>
            Real results from real learners
          </h2>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => <TestimonialCard key={t.name} t={t} index={i} />)}
        </div>
      </section>

      {/* ── Skills Covered ── */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="card p-8 text-center"
        >
          <h2 className="text-xl font-700 text-[var(--text-primary)] mb-2" style={{ fontWeight: 700 }}>9 DSA Skills. One Platform.</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Complete coverage of the core Data Structures & Algorithms curriculum.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill, i) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-1.5 text-sm text-[var(--text-secondary)] font-500 cursor-default transition-all hover:border-indigo-500/40 hover:text-[var(--text-primary)] hover:bg-indigo-500/8"
                style={{ fontWeight: 500 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-violet-600/15 to-cyan-600/10" />
          <div className="absolute inset-0 border border-indigo-500/20 rounded-3xl" />
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent" />
          <div className="relative z-10 px-8 py-20 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="inline-flex mb-6"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                <Brain className="h-7 w-7 text-white" />
              </div>
            </motion.div>
            <h2 className="text-4xl sm:text-5xl font-800 text-white tracking-tight" style={{ fontWeight: 800 }}>
              Ready to master DSA?
            </h2>
            <p className="mt-4 text-lg text-indigo-200/80 max-w-md mx-auto">
              Take the free 15-question diagnostic and get your personalized learning path in minutes.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/register" className="btn-primary text-base px-8 py-4 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                <Zap className="h-4 w-4" />
                Start Free — No signup fee
              </Link>
              <Link href="/login" className="btn-secondary text-base px-8 py-4">
                Already a member? Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] px-5 py-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            <span className="font-600" style={{ fontWeight: 600 }}>LearnSmart</span>
            <span>— AI-Powered Learning Platform</span>
          </div>
          <span>Powered by Bayesian Knowledge Tracing &amp; Item Response Theory</span>
        </div>
      </footer>
    </div>
  );
}
