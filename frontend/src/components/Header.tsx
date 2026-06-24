'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

export function Header() {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[#032147]/10 dark:border-gray-700 bg-[#032147] dark:bg-gray-900 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-white">Pre</span>
            <span className="text-[#ecad0a]">legal</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white font-medium transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/documents"
              className="text-sm text-white/70 hover:text-white font-medium transition-colors"
            >
              My Documents
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-white/70">{session.full_name}</span>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            <button
              onClick={logout}
              className="text-sm text-[#ecad0a] hover:text-[#ecad0a]/80 font-medium transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
