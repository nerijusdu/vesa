import { z } from 'zod';

export type Container = {
  id: string;
  names: string[];
  image: string;
  command: string;
  created: string;
  ports: Ports[];
  labels: Record<string,string>;
  state: string;
  status: string;
};

export type Ports = {
  ip: string;
  privatePort: string;
  publicPort?: string;
  type: string;
};

export type RunContainerRequest = {
  image: string;
  name?: string;
};

export const runContainerSchema = z.object({
  image: z.string(),
  name: z.string().optional(),
});