'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, getToken, getUser } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, LayoutDashboard, Zap, LogOut, Sun, Moon, Menu, X, Trophy } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsAuth(!!getToken());
    setUserName(getUser()?.name || '');
    const saved = localStorage.getItem('ls-theme');
    setIsDark(saved !== 'light');
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove('light');
      document.body.classList.remove('light');
      localStorage.setItem('ls-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      document.body.classList.add('light');
      localStorage.setItem('ls-theme', 'light');
    }
  }

  function logout() {
    clearToken();
    router.push('/');
  }

  const navLinks = isAuth
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/quiz/adaptive', label: 'Practice', icon: Zap },
      ]
    : [];

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-white/[0.06] bg-[var(--bg-base)]/90 backdrop-blur-xl shadow-lg shadow-black/20'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          {/* Logo */}
          <Link
            href={isAuth ? '/dashboard' : '/'}
            className="flex items-center gap-3 group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
              <Brain className="relative z-10 h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-[15px] font-700 text-[var(--text-primary)] leading-none tracking-tight" style={{ fontWeight: 700 }}>
                LearnSmart
              </span>
              <span className="text-[10px] text-[var(--text-muted)] leading-none tracking-widest uppercase">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-[var(--brand-secondary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-white/[0.08]"
              aria-label="Toggle theme"
            >
              {mounted ? (
                isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
            </button>

            {!mounted ? (
              <div className="h-9 w-24 rounded-lg skeleton" />
            ) : isAuth ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-overlay)]">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white">
                    {initials}
                  </div>
                  <span className="text-sm text-[var(--text-secondary)] font-medium max-w-[100px] truncate">
                    {userName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary py-2 px-4 text-sm">
                  <Trophy className="h-3.5 w-3.5" />
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-base)]/95 backdrop-blur-xl"
            >
              <div className="px-5 py-4 space-y-2">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.05] transition-all"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {isAuth ? (
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 pt-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-secondary text-sm text-center py-3">
                      Sign in
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm text-center py-3">
                      Get started free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
