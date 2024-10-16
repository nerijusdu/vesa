import { authRequest } from '../../api/api';
import { App, CreateAppRequest } from './apps.types';

export const getApps = async ():Promise<App[]> => {
  const response = await authRequest('/api/apps');
  return response.json();
};

export const getApp = async (id: string): Promise<App> => {
  const response = await authRequest(`/api/apps/${id}`);
  return response.json();
};

export const createApp = async (app: CreateAppRequest): Promise<string> => {
  const response = await authRequest('/api/apps', {
    method: 'POST',
    body: JSON.stringify(app),
  });
  const result = await response.json();
  return result.id;
};

export const deleteApp = async (id: string) => {
  await authRequest(`/api/apps/${id}`, { method: 'DELETE' });
};
