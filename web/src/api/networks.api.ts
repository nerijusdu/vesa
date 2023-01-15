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