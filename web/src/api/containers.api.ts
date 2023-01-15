import { Container, RunContainerRequest } from '../types/containers.types';
import { authHeaders } from './auth.api';

const apiUrl = window.location.host.endsWith(':5173') ? 'http://localhost:8989' : '';

export const getContainers = async (): Promise<Container[]> => {
  const response = await fetch(`${apiUrl}/api/containers`, { headers: await authHeaders() });
  if (!response.ok) {
    if (response.status === 401) {
      window.location.href = '/login';
    }
    throw new Error('Failed to get containers');
  }
  return response.json();
};

type RunContainerApiRequest = Omit<RunContainerRequest, 'ports'> & { ports: string[] };

export const runContainer = async (req: RunContainerApiRequest): Promise<string> => {
  const response = await fetch(`${apiUrl}/api/containers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error('Failed to run container: ' + body || 'Unknown error');
  }

  const result = await response.json();
  return result.id;
};

export const deleteContainer = async (id: string): Promise<void> => {
  await fetch(`${apiUrl}/api/containers/${id}`, { method: 'DELETE' });
};

export const stopContainer = async (id: string): Promise<void> => {
  await fetch(`${apiUrl}/api/containers/${id}/stop`, { method: 'POST' });
};

export const startContainer = async (id: string): Promise<void> => {
  await fetch(`${apiUrl}/api/containers/${id}/start`, { method: 'POST' });
};