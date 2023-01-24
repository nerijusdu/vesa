import { authRequest } from '../../api/api';
import { Project, SaveProjectRequest } from './projects.types';

export const getProjects = async (): Promise<Project[]> => {
  const response = await authRequest('/api/projects');
  return response.json();
};

export const getProject = async (id?: string): Promise<Project> => {
  const response = await authRequest(`/api/projects/${id}`);
  return response.json();
};

export type SaveProjectApiRequest = Omit<SaveProjectRequest, 'containers'> & {
  containers: string[];
};

export const saveProject = async (project: SaveProjectApiRequest): Promise<void> => {
  const response = await authRequest('/api/projects', {
    method: 'POST',
    body: JSON.stringify(project),
  });

  const result = await response.json();
  return result.id;
};

export const deleteProject = async (id: string): Promise<void> => {
  await authRequest(`/api/projects/${id}`, { method: 'DELETE' });
};

export const startProject = async (id: string): Promise<void> => {
  await authRequest(`/api/projects/${id}/start`, { method: 'POST' });
};

export const stopProject = async (id: string): Promise<void> => {
  await authRequest(`/api/projects/${id}/stop`, { method: 'POST' });
};

export const pullProjectImages = async (id: string): Promise<void> => {
  await authRequest(`/api/projects/${id}/pull`, { method: 'POST' });
};