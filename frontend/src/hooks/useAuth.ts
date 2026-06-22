'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  email: string;
  loginTime: string;
}

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const loginTime = localStorage.getItem('loginTime');

    if (email && loginTime) {
      setSession({ email, loginTime });
    } else {
      setSession(null);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loginTime', new Date().toISOString());
    setSession({ email, loginTime: new Date().toISOString() });
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('loginTime');
    setSession(null);
    router.push('/auth/login');
  };

  const isAuthenticated = session !== null;

  return {
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };
}
