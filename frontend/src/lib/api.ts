export interface FetchOptions extends RequestInit {
  email?: string;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const email = options.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null);

  const finalUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  // For backward compatibility, still support email query param
  if (email && !url.includes('auth') && !token) {
    finalUrl.searchParams.set('email', email);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !url.includes('auth')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(finalUrl.toString(), {
    ...options,
    headers,
  });
}
