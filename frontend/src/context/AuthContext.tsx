'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: number;
  email: string;
  full_name: string;
  access_token: string;
}

interface AuthContextType {
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserSession>;
  signup: (email: string, password: string, fullName: string) => Promise<UserSession>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token');
    const storedSession = localStorage.getItem('session') ?? sessionStorage.getItem('session');

    if (token && storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession({ ...parsed, access_token: token });
        console.log('[AuthContext] Loaded session from storage:', parsed.email);
      } catch (error) {
        console.error('[AuthContext] Failed to parse stored session:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('session');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('session');
      }
    } else {
      console.log('[AuthContext] No session found in storage. localStorage:', !!localStorage.getItem('access_token'), 'sessionStorage:', !!sessionStorage.getItem('access_token'));
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, fullName: string): Promise<UserSession> => {
    setError(null);
    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Signup failed');
      }

      const { access_token, user } = await response.json();

      const newSession = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        access_token,
      };

      console.log('[AuthContext] Signup - storing session:', user.email);
      sessionStorage.setItem('access_token', access_token);
      sessionStorage.setItem('session', JSON.stringify(newSession));
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('session', JSON.stringify(newSession));
      console.log('[AuthContext] Signup - stored in both storages. Verifying:', {
        tokenInSessionStorage: !!sessionStorage.getItem('access_token'),
        tokenInLocalStorage: !!localStorage.getItem('access_token'),
        sessionStored: !!sessionStorage.getItem('session'),
      });
      setSession(newSession);

      router.push('/');
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string, rememberMe = false): Promise<UserSession> => {
    setError(null);
    try {
      const response = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Sign in failed');
      }

      const { access_token, user } = await response.json();

      const newSession = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        access_token,
      };

      const storage = rememberMe ? localStorage : sessionStorage;
      const storageName = rememberMe ? 'localStorage' : 'sessionStorage';
      console.log(`[AuthContext] Login - storing session in ${storageName}:`, user.email);
      storage.setItem('access_token', access_token);
      storage.setItem('session', JSON.stringify(newSession));
      console.log(`[AuthContext] Login - stored in ${storageName}:`, {
        tokenInSessionStorage: !!sessionStorage.getItem('access_token'),
        tokenInLocalStorage: !!localStorage.getItem('access_token'),
        sessionStored: !!storage.getItem('session'),
      });
      setSession(newSession);

      router.push('/');
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('session');
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('session');
    setSession(null);
    router.push('/auth/login');
  };

  const isAuthenticated = session !== null;

  return (
    <AuthContext.Provider value={{ session, isLoading, isAuthenticated, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
