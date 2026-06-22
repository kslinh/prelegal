'use client';

import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { session, logout } = useAuth();

  if (!session) {
    return null;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Prelegal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session.email}</span>
            <button
              onClick={logout}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
