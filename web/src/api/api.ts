import { authHeaders } from './auth.api';

export const apiUrl = window.location.host.endsWith(':5173') ? 'http://localhost:8989' : '';

export type RequestOptions = RequestInit;

export const authRequest = async (url: string, init?: RequestOptions) => {
  const headers = await authHeaders();
  const response = await fetch(`${apiUrl}${url}`, {
    ...(init || {}),
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
    }

    const body = await response.text();
    throw new Error('Request failed: ' + body || 'Request failed');
  }

  return response;
};