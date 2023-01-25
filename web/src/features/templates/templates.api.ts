import { Template } from './templates.types';
import { authRequest } from '../../api/api';

export const getTemplates = async (): Promise<Template[]> => {
  const response = await authRequest('/api/templates');
  return response.json();
};

export const getTemplate = async (id?: string): Promise<Template> => {
  const response = await authRequest(`/api/templates/${id}`);
  return response.json();
};

export const deleteTemplate = async (id: string): Promise<void> => {
  await authRequest(`/api/templates/${id}`, { method: 'DELETE' });
};

export const useTemplate = async (id: string): Promise<string> => {
  const response = await authRequest(`/api/templates/${id}/use`, { method: 'POST' });
  const result = await response.json();
  return result.id;
};