import { Container, ContainerDetails, RunContainerApiRequest } from './containers.types';
import { authRequest, buildQuery } from '../../api/api';

export const getContainers = async (data?: { label?: string }): Promise<Container[]> => {
  const response = await authRequest(`/api/containers${buildQuery(data)}`);
  return response.json();
};

export const runContainer = async (req: RunContainerApiRequest): Promise<string> => {
  const response = await authRequest('/api/containers', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const result = await response.json();
  return result.id;
};

export const getContainer = async (id?: string): Promise<ContainerDetails> => {
  const response = await authRequest(`/api/containers/${id}`);
  return response.json();
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

export const restartContainer = async (id: string): Promise<void> => {
  await authRequest(`/api/containers/${id}/restart`, { method: 'POST' });
};

export const getContainerLogs = async (id: string | undefined): Promise<string> => {
  const data = await authRequest(`/api/containers/${id}/logs`);
  const res = await data.text();
  return res;
};
