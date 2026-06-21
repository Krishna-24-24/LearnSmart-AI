'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, setToken, setUser } from '@/lib/api';
import { Mail, Lock, LogIn, Eye, EyeOff, Brain, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      setToken(data.token);
      if (data.user) setUser(data.user);
      router.push(data.user?.diagnosticCompleted ? '/dashboard' : '/quiz/diagnostic');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        {/* Glow blob */}
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative"
        >
          {/* Card */}
          <div className="card card-shine px-8 pt-10 pb-8">
            {/* Top line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_24px_rgba(99,102,241,0.4)] mb-5">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl font-800 text-[var(--text-primary)]" style={{ fontWeight: 800 }}>Welcome back</h1>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">Sign in to continue your AI learning journey</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3"
              >
                <div className="h-5 w-5 flex-shrink-0 rounded-full border border-rose-400/50 bg-rose-500/20 flex items-center justify-center">
                  <span className="text-rose-400 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-rose-300">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-600 text-[var(--text-muted)] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-600 text-[var(--text-muted)] uppercase tracking-wide" style={{ fontWeight: 600 }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign in to LearnSmart
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border-subtle)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-muted)]">New here?</span>
              </div>
            </div>

            <Link
              href="/register"
              className="btn-secondary w-full py-3 text-sm text-center flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Create a free account
            </Link>
          </div>

          {/* Trust bullets */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-[var(--text-muted)]">
            {['Free forever', 'AI-powered adaptive learning', 'No credit card'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
