import { authRequest } from '../../api/api';
import { AuthRequest, ClientRequest, RegistryAuth } from './settings.models';


export const getAuths = async (): Promise<RegistryAuth[]> => {
  const res = await authRequest('/api/docker/auth');
  return res.json();
};

export const saveAuth = async (req: AuthRequest): Promise<void> => {
  await authRequest('/api/docker/auth', {
    method: 'POST',
    body: JSON.stringify(req),
  });
};

export const getClients = async (): Promise<string[]> => {
  const res = await authRequest('/api/settings/clients');
  return res.json();
};

export const saveClient = async (req: ClientRequest): Promise<void> => {
  await authRequest('/api/settings/clients', {
    method: 'POST',
    body: JSON.stringify(req),
  });
};

export const deleteClient = async (client: string): Promise<void> => {
  await authRequest(`/api/settings/clients/${client}`, {
    method: 'DELETE',
  });
};
