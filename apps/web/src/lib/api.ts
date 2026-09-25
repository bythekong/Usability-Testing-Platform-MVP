const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', 'Bearer ' + token);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(API_BASE_URL + endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = Array.isArray(data.errors)
      ? data.errors.map((item: { msg?: string }) => item.msg).filter(Boolean).join(', ')
      : '';
    throw new Error(data.error || validationMessage || 'API request failed (' + response.status + ')');
  }

  return data;
}
