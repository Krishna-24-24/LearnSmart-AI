'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import SkillCard from '@/components/SkillCard';
import { api, getToken, DashboardData } from '@/lib/api';

const barColors = ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#4f46e5'];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<{ date: string; accuracy: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
      return;
    }

    Promise.all([api.getDashboard(), api.getHistory()])
      .then(([dashboard, hist]) => {
        setData(dashboard);
        setHistory(hist.improvementOverTime);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p className="text-rose-400">{error || 'Failed to load dashboard'}</p>
      </div>
    );
  }

  const chartData = data.skills.map((s) => ({
    name: s.skill.length > 12 ? s.skill.slice(0, 10) + '…' : s.skill,
    fullName: s.skill,
    mastery: s.masteryPercent,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="mt-1 text-slate-400">
            Average mastery: {data.analytics.averageMasteryPercent}%
          </p>
        </div>
        <Link
          href="/quiz/adaptive"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Practice Weak Areas
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Mastery Overview</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.skills.map((s) => (
                <SkillCard
                  key={s.skill}
                  skill={s.skill}
                  masteryPercent={s.masteryPercent}
                  level={s.level}
                />
              ))}
            </div>
          </section>

          <section className="card-glow mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Mastery by Skill</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullName || ''
                    }
                  />
                  <Bar dataKey="mastery" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {history.length > 0 && (
            <section className="card-glow mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Improvement Over Time</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                    />
                    <Line type="monotone" dataKey="accuracy" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold text-white">Weakest Skills</h2>
            <ol className="mt-4 space-y-3">
              {data.weakestSkills.map((s, i) => (
                <li key={s.skill} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-sm font-bold text-rose-400">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-white">{s.skill}</p>
                    <p className="text-sm text-rose-400">{s.masteryPercent}% mastery</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {data.nextTopic && (
            <section className="card-glow rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
              <h2 className="text-lg font-semibold text-white">Recommended Next Topic</h2>
              <p className="mt-2 text-xl font-bold text-indigo-300">
                {data.nextTopic.skill}
              </p>
              <p className="mt-2 text-sm text-slate-400">{data.nextTopic.reason}</p>
            </section>
          )}

          <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold text-white">Learning Path</h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {data.learningPath.map((skill, i) => (
                <span key={skill} className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-300">
                    {skill}
                  </span>
                  {i < data.learningPath.length - 1 && (
                    <span className="text-slate-600">→</span>
                  )}
                </span>
              ))}
            </div>
          </section>

          {data.recommendations.length > 0 && (
            <section className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-white">Recommendations</h2>
              <div className="mt-4 space-y-4">
                {data.recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.skill} className="rounded-lg border border-slate-700 p-3">
                    <p className="font-medium text-white">{rec.skill}</p>
                    <p className="mt-1 text-xs text-slate-400">{rec.explanation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
