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

export const createTemplate = async (containerId: string): Promise<string> => {
  const response = await authRequest('/api/templates', {
    method: 'POST',
    body: JSON.stringify({ containerId }),
  });
  const result = await response.json();
  return result.id;
};

export const saveTemplate = async (template: Partial<Template>): Promise<string> => {
  const response = await authRequest('/api/templates', {
    method: 'POST',
    body: JSON.stringify(template),
  });
  const result = await response.json();
  return result.id;
};

export const updateTemplateContainers = async ({ id, tag }: { id: string; tag: string }): Promise<void> => {
  await authRequest(`/api/templates/${id}/update-web?tag=${tag}`, {
    method: 'POST',
  });
};
