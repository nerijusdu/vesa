import { authRequest } from '../../api/api';
import { AuthRequest, RegistryAuth } from './settings.models';


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
