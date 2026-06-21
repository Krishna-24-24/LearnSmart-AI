'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api, setToken, setUser } from '@/lib/api';
import { Mail, Lock, User, Eye, EyeOff, Brain, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const perks = [
  { icon: Brain, text: 'Bayesian Knowledge Tracing builds your mastery model' },
  { icon: Zap,   text: 'IRT-powered adaptive questions — always at the right difficulty' },
  { icon: CheckCircle2, text: 'Explainable AI tells you exactly what to study next' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      const data = await api.register({ name, email, password });
      setToken(data.token);
      if (data.user) setUser(data.user);
      router.push('/quiz/diagnostic');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const strength = password.length >= 10 ? 'strong' : password.length >= 6 ? 'medium' : password.length > 0 ? 'weak' : '';
  const strengthColor = strength === 'strong' ? '#10b981' : strength === 'medium' ? '#f59e0b' : '#f43f5e';
  const strengthWidth = strength === 'strong' ? '100%' : strength === 'medium' ? '60%' : strength === 'weak' ? '30%' : '0%';

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-start justify-center px-5 py-12">
      <div className="w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Left: Perk copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="hidden lg:block pt-4"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-600 text-indigo-300 mb-8" style={{ fontWeight: 600 }}>
              <Zap className="h-3 w-3" />
              Start your AI learning journey
            </div>
            <h2 className="text-4xl font-800 text-[var(--text-primary)] leading-tight mb-6" style={{ fontWeight: 800 }}>
              Master DSA<br />
              <span className="animate-gradient-text">with AI guidance.</span>
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
              In 15 minutes, our AI will diagnose your skill gaps, build your mastery profile, and create a personalized learning path — completely free.
            </p>
            <div className="space-y-5">
              {perks.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                  className="flex items-start gap-4"
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/20">
                    <Icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-1">{text}</p>
                </motion.div>
              ))}
            </div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4"
            >
              <div className="flex -space-x-2">
                {['#6366f1','#10b981','#f59e0b'].map((c, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-[10px] font-700 text-white" style={{ background: c, fontWeight: 700, zIndex: 3 - i }}>
                    {['PS','AM','RP'][i]}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-600 text-[var(--text-primary)]" style={{ fontWeight: 600 }}>Join 8,400+ learners</p>
                <p className="text-xs text-[var(--text-muted)]">Avg. mastery gain of 42% in first week</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="card card-shine px-8 pt-10 pb-8 relative">
              <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent" />

              <div className="mb-8">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_6px_20px_rgba(99,102,241,0.4)] mb-5">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-800 text-[var(--text-primary)]" style={{ fontWeight: 800 }}>Create your account</h1>
                <p className="mt-1.5 text-sm text-[var(--text-muted)]">Free diagnostic assessment included</p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3"
                >
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border border-rose-400/50 bg-rose-500/20 flex items-center justify-center text-rose-400 text-xs font-bold">!</span>
                  <p className="text-sm text-rose-300">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-600 text-[var(--text-muted)] uppercase tracking-wide" style={{ fontWeight: 600 }}>Full name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Priya Sharma"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-600 text-[var(--text-muted)] uppercase tracking-wide" style={{ fontWeight: 600 }}>Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      id="register-email"
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
                  <label className="mb-1.5 block text-xs font-600 text-[var(--text-muted)] uppercase tracking-wide" style={{ fontWeight: 600 }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
                    <input
                      id="register-password"
                      type={showPw ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Min 6 characters"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Password strength */}
                  {password && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                      <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          animate={{ width: strengthWidth }}
                          transition={{ duration: 0.3 }}
                          className="h-full rounded-full"
                          style={{ background: strengthColor }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] capitalize" style={{ color: strengthColor }}>
                        {strength} password
                      </p>
                    </motion.div>
                  )}
                </div>

                <button
                  id="register-submit"
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm mt-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                      />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Start My Diagnostic
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--bg-surface)] px-3 text-xs text-[var(--text-muted)]">Already have an account?</span>
                </div>
              </div>

              <Link href="/login" className="btn-secondary w-full py-3 text-sm text-center flex items-center justify-center gap-2">
                Sign in instead
              </Link>
            </div>

            <p className="mt-4 text-center text-[10px] text-[var(--text-muted)]">
              By registering you agree to our terms. Your data stays private.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
