'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: number;
  email: string;
  full_name: string;
  access_token: string;
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedSession = localStorage.getItem('session');

    if (token && storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession({ ...parsed, access_token: token });
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('session');
      }
    }
    setIsLoading(false);
  }, []);

  const signup = async (email: string, password: string, fullName: string) => {
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

      const user = await response.json();

      const signinResponse = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!signinResponse.ok) {
        throw new Error('Sign in after signup failed');
      }

      const { access_token } = await signinResponse.json();

      const newSession = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        access_token,
      };

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('session', JSON.stringify(newSession));
      setSession(newSession);

      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await fetch('/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Sign in failed');
      }

      const { access_token } = await response.json();

      const meResponse = await fetch('/users/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!meResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const user = await meResponse.json();

      const newSession = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        access_token,
      };

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('session', JSON.stringify(newSession));
      setSession(newSession);

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
    setSession(null);
    router.push('/auth/login');
  };

  const isAuthenticated = session !== null;

  return {
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
  };
}
