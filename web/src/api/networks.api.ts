import { CreateNetworkRequest, Network } from '../types';
import { authRequest } from './api';

export const getNetworks = async (): Promise<Network[]> => {
  const response = await authRequest('/api/networks');
  return response.json();
};

export const getNetwork = async (id?: string): Promise<Network> => {
  const response = await authRequest(`/api/networks/${id}`);
  return response.json();
};

export const createNetwork = async (req: CreateNetworkRequest): Promise<string> => {
  const response = await authRequest('/api/networks', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  const result = await response.json();
  return result.id;
};

export const deleteNetwork = async (id: string): Promise<void> => {
  await authRequest(`/api/networks/${id}`, { method: 'DELETE' });
};

export const connectNetwork = async ({ networkId, containerId }: {
  networkId: string;
  containerId: string;
}): Promise<void> => {
  await authRequest(`/api/networks/${networkId}/connect`, {
    method: 'POST',
    body: JSON.stringify({ containerId }),
  });
};

export const disconnectNetwork = async ({ networkId, containerId }: {
  networkId: string;
  containerId: string;
}): Promise<void> => {
  await authRequest(`/api/networks/${networkId}/disconnect`, {
    method: 'POST',
    body: JSON.stringify({ containerId }),
  });
};
