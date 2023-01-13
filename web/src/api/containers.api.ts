import { Container, RunContainerRequest } from '../types/containers.types';

const apiUrl = window.location.host.endsWith(':5173') ? 'http://localhost:8989' : '';

export const getContainers = async (): Promise<Container[]> => {
  const response = await fetch(`${apiUrl}/api/containers`);
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