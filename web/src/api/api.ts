import { authHeaders } from './auth.api';

export const apiUrl = window.location.host.endsWith(':5173') ? 'http://localhost:8989' : '';

export type RequestOptions = RequestInit;

export class ApiError extends Error {
  constructor(message: string, description?: string) {
    super(message);

    this.description = description;
  }

  description?: string;
}

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

    if (response.status === 400) {
      const error = await response.json();

      if (error.type === 'validation') {
        let desc = '';
        for (const key in error.errors) {
          desc += `${key}: ${error.errors[key]}\n`;
        }
        throw new ApiError(error.message, desc);
      }
    }

    const body = await response.text();
    throw new Error('Request failed: ' + body || 'Request failed');
  }

  return response;
};
