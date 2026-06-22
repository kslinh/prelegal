export interface FetchOptions extends RequestInit {
  email?: string;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const email = options.email || (typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null);

  const finalUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  if (email && !url.includes('auth')) {
    finalUrl.searchParams.set('email', email);
  }

  return fetch(finalUrl.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
}
