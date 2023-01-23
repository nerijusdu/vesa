import { authRequest } from '../../api/api';
import { Project } from './projects.types';

export const getProjects = async (): Promise<Project[]> => {
  const response = await authRequest('/api/projects');
  return response.json();
};

export const getProject = async (id?: string): Promise<Project> => {
  const response = await authRequest(`/api/projects/${id}`);
  return response.json();
};

export const saveProject = async (project: Project): Promise<void> => {
  await authRequest(`/api/projects/${project.id}`, {
    method: 'POST',
    body: JSON.stringify(project),
  });
};

export const deleteProject = async (id: string): Promise<void> => {
  await authRequest(`/api/projects/${id}`, { method: 'DELETE' });
};