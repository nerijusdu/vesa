import { Network } from '../types';

const apiUrl = window.location.host.endsWith(':5173') ? 'http://localhost:8989' : '';

export const getNetworks = async (): Promise<Network[]> => {
  const response = await fetch(`${apiUrl}/api/networks`);
  return response.json();
};

export const getNetwork = async (id?: string): Promise<Network> => {
  const response = await fetch(`${apiUrl}/api/networks/${id}`);
  return response.json();
};

export const createNetwork = async (req: Network): Promise<string> => {
  const response = await fetch(`${apiUrl}/api/networks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error('Failed to create network: ' + body || 'Unknown error');
  }

  const result = await response.json();
  return result.id;
};

export const deleteNetwork = async (id: string): Promise<void> => {
  const res = await fetch(`${apiUrl}/api/networks/${id}`, { method: 'DELETE' });
  
  if (!res.ok) {
    const body = await res.text();
    throw new Error('Failed to delete network: ' + body || 'Unknown error');
  }
};

export const connectNetwork = async ({ networkId, containerId }: {
  networkId: string;
  containerId: string;
}): Promise<void> => {
  const res = await fetch(`${apiUrl}/api/networks/${networkId}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ containerId }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error('Failed to connect network: ' + body || 'Unknown error');
  }

  return;
};

export const disconnectNetwork = async ({ networkId, containerId }: {
  networkId: string;
  containerId: string;
}): Promise<void> => {
  const res = await fetch(`${apiUrl}/api/networks/${networkId}/disconnect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ containerId }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error('Failed to disconnect network: ' + body || 'Unknown error');
  }

  return;
};

// TODO: maybe a use a lib for http error handling?