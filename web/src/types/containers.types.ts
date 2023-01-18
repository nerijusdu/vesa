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

export const runContainerSchema = z.object({
  image: z.string(),
  name: z.string().optional(),
  ports: z.array(z.object({
    value: z.string().optional(),
  })),
  mounts: z.array(z.object({
    type: z.string().default('bind'),
    source: z.string(),
    target: z.string(),
  })),
  envVars: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  isLocal: z.boolean().optional(),
  networkId: z.string().optional(),
  networkName: z.string().optional(),
});

export type RunContainerRequest = z.infer<typeof runContainerSchema>;