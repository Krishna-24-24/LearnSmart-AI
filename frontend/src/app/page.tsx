import Link from 'next/link';

const features = [
  {
    title: 'Diagnostic Assessment',
    desc: '15-question MCQ diagnostic initializes per-skill mastery using Bayesian Knowledge Tracing.',
  },
  {
    title: 'Adaptive Quizzes',
    desc: 'IRT-powered question selection targets your weakest skills at the right difficulty.',
  },
  {
    title: 'Explainable AI',
    desc: 'Every recommendation includes mastery score, reasoning, and a suggested action.',
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Track mastery progress, learning paths, and improvement over time with Recharts.',
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <section className="py-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm text-indigo-300">
          MVP v1.0 · Data Structures & Algorithms
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
          Learn smarter with{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            adaptive AI
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Personalized learning powered by Bayesian Knowledge Tracing and Item Response Theory.
          Master DSA skills with diagnostic assessments, adaptive quizzes, and explainable recommendations.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-indigo-600 px-8 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500"
          >
            Start Free Assessment
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-8 py-3 font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Sign In
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="card-glow rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
          >
            <h3 className="font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
          </div>
        ))}
      </section>

      <section className="mt-20 rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Skills Covered</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            'Arrays', 'Strings', 'Linked Lists', 'Stacks', 'Queues',
            'Trees', 'Graphs', 'Binary Search', 'Dynamic Programming',
          ].map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-sm text-slate-300"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
