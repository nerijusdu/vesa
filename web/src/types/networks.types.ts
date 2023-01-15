import { z } from 'zod';

export type Network = {
  name: string;
  id: string;
  created: string;
  scope: string;
  driver: string;
  internal: boolean;
  attachable: boolean;
  containers: Record<string, NetworkContainer>;
};

export type NetworkContainer = {
  name: string;
  endpointId: string;
  macAddress: string;
  ipv4Address: string;
  ipv6Address: string;
};

export const createNetworkScheme = z.object({
  name: z.string(),
  driver: z.string().optional(),
  internal: z.boolean().optional(),
  attachable: z.boolean().optional(),
});

export type CreateNetworkRequest = z.infer<typeof createNetworkScheme>;