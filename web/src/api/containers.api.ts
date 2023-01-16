import { Container, RunContainerRequest } from '../types/containers.types';
import { authRequest } from './api';

export const getContainers = async (): Promise<Container[]> => {
  const response = await authRequest('/api/containers');
  return response.json();
};

type RunContainerApiRequest = Omit<RunContainerRequest, 'ports'> & { ports: string[] };

export const runContainer = async (req: RunContainerApiRequest): Promise<string> => {
  const response = await authRequest('/api/containers', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const result = await response.json();
  return result.id;
};

export const deleteContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}`, { method: 'DELETE' });
};

export const stopContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}/stop`, { method: 'POST' });
};

export const startContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}/start`, { method: 'POST' });
};