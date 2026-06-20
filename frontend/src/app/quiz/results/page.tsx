'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdaptiveResult } from '@/lib/api';

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AdaptiveResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('learnsmart_quiz_result');
    if (!raw) {
      router.push('/dashboard');
      return;
    }
    setResult(JSON.parse(raw));
  }, [router]);

  if (!result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const primaryRec = result.recommendations[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/20 text-2xl">
          ✓
        </div>
        <h1 className="text-3xl font-bold text-white">Quiz Complete</h1>
        <p className="mt-2 text-slate-400">
          You scored {result.summary.correct}/{result.summary.total} ({result.summary.scorePercent}%)
        </p>
      </div>

      <section className="card-glow mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">Mastery Updates (BKT)</h2>
        <div className="mt-4 space-y-2">
          {result.results.map((r) => (
            <div
              key={r.questionId}
              className="flex items-center justify-between rounded-lg border border-slate-800 px-4 py-2"
            >
              <span className="text-sm text-slate-300">{r.skill}</span>
              <div className="flex items-center gap-3">
                <span className={r.correct ? 'text-emerald-400' : 'text-rose-400'}>
                  {r.correct ? 'Correct' : 'Incorrect'}
                </span>
                <span className="text-sm font-medium text-indigo-400">
                  {Math.round(r.updatedMastery * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {primaryRec && (
        <section className="card-glow mt-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
          <h2 className="text-lg font-semibold text-white">Explainable Recommendation</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm text-slate-400">Recommended Skill</p>
              <p className="text-xl font-bold text-indigo-300">{primaryRec.skill}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Reason</p>
              <p className="text-slate-300">Mastery = {primaryRec.masteryPercent}%</p>
              <p className="mt-1 text-sm text-slate-400">{primaryRec.explanation}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Common Error</p>
              <p className="text-sm text-slate-300">{primaryRec.commonError}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">Recommended Action</p>
              <p className="font-medium text-emerald-400">{primaryRec.suggestedAction}</p>
            </div>
          </div>
        </section>
      )}

      {result.recommendations.length > 1 && (
        <section className="card-glow mt-6 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <h2 className="text-lg font-semibold text-white">Additional Recommendations</h2>
          <div className="mt-4 space-y-4">
            {result.recommendations.slice(1).map((rec) => (
              <div key={rec.skill} className="rounded-lg border border-slate-700 p-4">
                <p className="font-medium text-white">
                  {rec.skill} · {rec.masteryPercent}%
                </p>
                <p className="mt-1 text-sm text-slate-400">{rec.explanation}</p>
                <p className="mt-2 text-sm text-emerald-400">{rec.suggestedAction}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/dashboard"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-500"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/quiz/adaptive"
          className="rounded-xl border border-slate-700 px-6 py-3 font-medium text-slate-300 hover:border-slate-500"
        >
          Practice Again
        </Link>
      </div>
    </div>
  );
}
