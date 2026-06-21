'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  CartesianGrid, Area, AreaChart,
} from 'recharts';
import SkillCard from '@/components/SkillCard';
import { api, getToken, getUser, DashboardData } from '@/lib/api';
import {
  Zap, TrendingUp, Target, Award, ArrowRight, Brain,
  Flame, Star, ChevronRight, BookOpen, BarChart2,
  AlertCircle, CheckCircle2, Lightbulb, Clock
} from 'lucide-react';

/* ─── Animated number counter ─────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(e * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);
  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}

/* ─── SVG Progress Ring ────────────────────────────────────────────────────── */
function ProgressRing({ percent, size = 120, strokeWidth = 10, color = '#6366f1' }: {
  percent: number; size?: number; strokeWidth?: number; color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="drop-shadow-lg">
      {/* Outer glow ring */}
      <circle cx={size/2} cy={size/2} r={r+2} fill="none" stroke={`${color}15`} strokeWidth={strokeWidth+4} />
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      {/* Progress */}
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
        filter={`drop-shadow(0 0 6px ${color}80)`}
      />
    </svg>
  );
}

/* ─── Mastery Heatmap (7×12 grid) ─────────────────────────────────────────── */
function MasteryHeatmap() {
  const today = new Date();
  // Simulate 84 days of activity
  const cells = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (83 - i));
    const rand = Math.random();
    const active = rand > 0.35;
    const intensity = active ? Math.floor(rand * 4) + 1 : 0; // 0-4
    return { date: d, intensity };
  });

  const colors = ['#1e293b', '#312e81', '#4f46e5', '#6366f1', '#818cf8'];
  const days = ['M','T','W','T','F','S','S'];

  return (
    <div>
      <div className="flex gap-1 mb-1.5">
        {days.map((d, i) => (
          <div key={i} className="w-6 text-center text-[9px] text-[var(--text-muted)] font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005, duration: 0.2 }}
            className="w-6 h-6 rounded-sm tooltip cursor-default"
            style={{ background: colors[cell.intensity] }}
            data-tip={`${cell.date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}: ${cell.intensity ? `${cell.intensity * 25}% activity` : 'No activity'}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2.5 justify-end">
        <span className="text-[10px] text-[var(--text-muted)]">Less</span>
        {colors.map((c, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />)}
        <span className="text-[10px] text-[var(--text-muted)]">More</span>
      </div>
    </div>
  );
}

/* ─── Custom Tooltip ───────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload?: { fullName?: string } }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-3 shadow-xl">
      <p className="text-xs text-[var(--text-muted)] mb-1">{payload[0]?.payload?.fullName || label}</p>
      <p className="text-sm font-700 text-[var(--text-primary)]" style={{ fontWeight: 700 }}>
        {payload[0]?.value}% mastery
      </p>
    </div>
  );
}

/* ─── Loading Skeleton ─────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 space-y-6 animate-pulse">
      <div className="skeleton h-28 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-36 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ───────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<{ date: string; accuracy: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = typeof window !== 'undefined' ? getUser() : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Simulated XP & streak (would come from backend in real app)
  const xp = 1240;
  const streak = 7;

  useEffect(() => {
    if (!getToken()) { router.push('/login'); return; }
    Promise.all([api.getDashboard(), api.getHistory()])
      .then(([dash, hist]) => { setData(dash); setHistory(hist.improvementOverTime); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <DashboardSkeleton />;

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <p className="text-rose-400 font-medium">{error || 'Failed to load dashboard'}</p>
        <p className="text-sm text-[var(--text-muted)]">Make sure the backend and ML service are running.</p>
        <button onClick={() => window.location.reload()} className="btn-secondary text-sm">
          Retry
        </button>
      </div>
    );
  }

  const chartData = data.skills.map((s) => ({
    name: s.skill.length > 10 ? s.skill.slice(0, 9) + '…' : s.skill,
    fullName: s.skill,
    mastery: s.masteryPercent,
  }));

  const radarData = data.skills.map((s) => ({
    subject: s.skill.split(' ')[0],
    mastery: s.masteryPercent,
    fullMark: 100,
  }));

  const strongSkills = data.skills.filter((s) => s.level === 'strong');

  const barColors = (value: number) =>
    value >= 70 ? '#10b981' : value >= 40 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">

      {/* ── Welcome Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-8 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(167,139,250,0.10) 50%, rgba(34,211,238,0.08) 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
        <div className="px-7 py-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--brand-secondary)] font-500 mb-1" style={{ fontWeight: 500 }}>{greeting} 👋</p>
            <h1 className="text-2xl font-800 text-[var(--text-primary)]" style={{ fontWeight: 800 }}>
              {user?.name || 'Learner'}&apos;s Dashboard
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Overall mastery: <span className="font-600 text-[var(--text-secondary)]" style={{ fontWeight: 600 }}>{data.analytics.averageMasteryPercent}%</span>
              {' '}· Keep pushing forward!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5">
              <Flame className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">Streak</p>
                <p className="text-lg font-800 text-amber-300 leading-none" style={{ fontWeight: 800 }}>{streak}d</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-4 py-2.5">
              <Star className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-xs text-[var(--text-muted)]">XP Points</p>
                <p className="text-lg font-800 text-indigo-300 leading-none" style={{ fontWeight: 800 }}>
                  <AnimatedNumber value={xp} />
                </p>
              </div>
            </div>
            <Link href="/quiz/adaptive" className="btn-primary">
              <Zap className="h-4 w-4" />
              Practice Now
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: TrendingUp, label: 'Avg Mastery', value: data.analytics.averageMasteryPercent, suffix: '%',
            color: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.20)',
          },
          {
            icon: Target, label: 'Weakest Skill', value: data.analytics.weakestSkill.masteryScore,
            suffix: ' BKT', extra: data.analytics.weakestSkill.skill,
            color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.20)',
          },
          {
            icon: Award, label: 'Strongest Skill', value: data.analytics.strongestSkill.masteryScore,
            suffix: ' BKT', extra: data.analytics.strongestSkill.skill,
            color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.20)',
          },
          {
            icon: BookOpen, label: 'Skills Tracked', value: data.skills.length, suffix: '',
            color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.20)',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="rounded-xl p-4 card-shine"
            style={{ background: stat.bg, border: `1px solid ${stat.border}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-500 text-[var(--text-muted)]" style={{ fontWeight: 500 }}>{stat.label}</p>
              <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
            </div>
            <p className="text-2xl font-800 tabular-nums" style={{ color: stat.color, fontWeight: 800 }}>
              <AnimatedNumber value={typeof stat.value === 'number' ? stat.value : 0} suffix={stat.suffix} />
            </p>
            {stat.extra && <p className="text-xs text-[var(--text-muted)] mt-1 truncate">{stat.extra}</p>}
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Skill Cards Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Mastery Overview</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Real-time BKT per-skill mastery scores</p>
              </div>
              <span className="badge badge-info">
                <Brain className="h-2.5 w-2.5" />
                BKT Live
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.skills.map((s, i) => (
                <SkillCard
                  key={s.skill}
                  skill={s.skill}
                  masteryPercent={s.masteryPercent}
                  level={s.level}
                  index={i}
                />
              ))}
            </div>
          </motion.section>

          {/* Bar Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Mastery by Skill</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Comparative skill performance</p>
              </div>
              <BarChart2 className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }}
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="mastery" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={barColors(entry.mastery)} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* Radar Chart */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Skill Radar</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Holistic mastery across all topics</p>
              </div>
              <Target className="h-4 w-4 text-[var(--text-muted)]" />
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Inter' }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Mastery"
                    dataKey="mastery"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#818cf8' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          {/* Improvement Over Time */}
          {history.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Weekly Progress</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Accuracy improvement over time</p>
                </div>
                <Clock className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: '#94a3b8' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{ fill: '#818cf8', r: 4 }}
                      activeDot={{ r: 6, fill: '#818cf8' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.section>
          )}

          {/* Mastery Heatmap */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Activity Heatmap</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Last 12 weeks of learning activity</p>
              </div>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <MasteryHeatmap />
          </motion.section>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-5">

          {/* Mastery Progress Ring */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="card p-6 text-center"
          >
            <p className="text-xs font-500 text-[var(--text-muted)] uppercase tracking-widest mb-4" style={{ fontWeight: 500 }}>
              Overall Mastery
            </p>
            <div className="relative inline-flex">
              <ProgressRing percent={data.analytics.averageMasteryPercent} size={130} strokeWidth={11} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-800 text-[var(--text-primary)] tabular-nums" style={{ fontWeight: 800 }}>
                  {data.analytics.averageMasteryPercent}
                </span>
                <span className="text-xs text-[var(--text-muted)]">percent</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="rounded-lg bg-emerald-500/8 border border-emerald-500/15 p-2.5">
                <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Strong</p>
                <p className="text-sm font-700 text-emerald-400" style={{ fontWeight: 700 }}>
                  {strongSkills.length} skills
                </p>
              </div>
              <div className="rounded-lg bg-rose-500/8 border border-rose-500/15 p-2.5">
                <p className="text-[10px] text-[var(--text-muted)] mb-0.5">Weak</p>
                <p className="text-sm font-700 text-rose-400" style={{ fontWeight: 700 }}>
                  {data.weakestSkills.length} skills
                </p>
              </div>
            </div>
          </motion.section>

          {/* Next Topic */}
          {data.nextTopic && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="rounded-2xl p-5 relative overflow-hidden card-shine"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(167,139,250,0.08))',
                border: '1px solid rgba(99,102,241,0.25)',
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/25">
                  <Lightbulb className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="badge badge-info text-[9px]">
                  AI Pick
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-500 mb-1" style={{ fontWeight: 500 }}>Recommended Next</p>
              <h3 className="text-xl font-700 text-indigo-200 mb-2" style={{ fontWeight: 700 }}>{data.nextTopic.skill}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">{data.nextTopic.reason}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-indigo-400">{data.nextTopic.masteryPercent}% current mastery</span>
                <Link
                  href="/quiz/adaptive"
                  className="flex items-center gap-1.5 text-xs font-600 text-indigo-300 hover:text-indigo-100 transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Practice <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Weakest Skills */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/12 border border-rose-500/20">
                <TrendingUp className="h-3.5 w-3.5 text-rose-400" />
              </div>
              <div>
                <h2 className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Areas to Improve</h2>
                <p className="text-[10px] text-[var(--text-muted)]">Lowest mastery skills</p>
              </div>
            </div>
            <ol className="space-y-2.5">
              {data.weakestSkills.map((s, i) => (
                <motion.li
                  key={s.skill}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/12 text-[10px] font-800 text-rose-400 border border-rose-500/15" style={{ fontWeight: 800 }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-500 text-[var(--text-primary)] truncate" style={{ fontWeight: 500 }}>{s.skill}</p>
                      <span className="text-xs text-rose-400 font-600 ml-2 tabular-nums" style={{ fontWeight: 600 }}>{s.masteryPercent}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.masteryPercent}%` }}
                        transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                      />
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          </motion.section>

          {/* Strong Skills */}
          {strongSkills.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/12 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Mastered Skills</h2>
                  <p className="text-[10px] text-[var(--text-muted)]">Keep it up!</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {strongSkills.map((s) => (
                  <span key={s.skill} className="badge badge-strong">{s.skill}</span>
                ))}
              </div>
            </motion.section>
          )}

          {/* Learning Path */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/12 border border-indigo-500/20">
                <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Learning Path</h2>
                <p className="text-[10px] text-[var(--text-muted)]">AI-generated sequence</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {data.learningPath.map((skill, i) => (
                <div key={skill} className="flex items-center gap-2.5">
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-700 ${
                    i === 0 ? 'bg-indigo-500 text-white' : 'bg-white/[0.06] text-[var(--text-muted)]'
                  }`} style={{ fontWeight: 700 }}>
                    {i + 1}
                  </div>
                  <span className={`text-sm ${i === 0 ? 'font-600 text-indigo-300' : 'text-[var(--text-secondary)]'}`} style={{ fontWeight: i === 0 ? 600 : 400 }}>
                    {skill}
                  </span>
                  {i === 0 && <span className="ml-auto text-[9px] font-700 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20" style={{ fontWeight: 700 }}>NOW</span>}
                </div>
              ))}
            </div>
          </motion.section>

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="card p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/12 border border-cyan-500/20">
                  <Brain className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>AI Recommendations</h2>
                  <p className="text-[10px] text-[var(--text-muted)]">Personalized suggestions</p>
                </div>
              </div>
              <div className="space-y-3">
                {data.recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.skill} className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3.5">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>{rec.skill}</p>
                      {rec.masteryScore !== undefined && (
                        <span className="text-xs text-[var(--text-muted)] tabular-nums">{Math.round(rec.masteryScore * 100)}%</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{rec.explanation}</p>
                    {rec.suggestedAction && (
                      <p className="mt-2 text-xs font-500 text-emerald-400 flex items-center gap-1" style={{ fontWeight: 500 }}>
                        <ChevronRight className="h-3 w-3" />
                        {rec.suggestedAction}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  );
}
