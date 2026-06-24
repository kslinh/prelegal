export interface FetchOptions extends RequestInit {
  email?: string;
}

export async function apiFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token');
  }

  const finalUrl = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token && !url.includes('auth')) {
    headers['Authorization'] = `Bearer ${token}`;
    if (url.includes('documents')) {
      console.log(`[apiFetch] Sending token for ${url}: ${token.substring(0, 30)}...`);
    }
  } else {
    if (url.includes('documents')) {
      console.log(`[apiFetch] No token for ${url}. localStorage: ${!!localStorage.getItem('access_token')}, sessionStorage: ${!!sessionStorage.getItem('access_token')}`);
    }
  }

  return fetch(finalUrl.toString(), {
    ...options,
    headers,
  });
}
