'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearToken, getToken, getUser } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    setMounted(true);
    setIsAuth(!!getToken());
    setUserName(getUser()?.name || '');
  }, [pathname]);

  const links = isAuth
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/quiz/adaptive', label: 'Practice' },
      ]
    : [];

  function logout() {
    clearToken();
    router.push('/');
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href={isAuth ? '/dashboard' : '/'} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
            LS
          </span>
          <span className="text-lg font-semibold text-white">LearnSmart</span>
        </Link>

        <div className="flex items-center gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href
                  ? 'text-indigo-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {!mounted ? (
            <div className="h-8 w-24" />
          ) : isAuth ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:inline">
                {userName}
              </span>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500 hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-400 hover:text-white">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
