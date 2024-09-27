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

export type PortBinding = {
  hostIp: string;
  hostPort: string;
}

export type Mount = {
  type: string;
  source: string;
  target: string;
  name?: string;
}

export type ContainerDetails = {
  id: string;
  created: string;
  path: string;
  args: string[];
  state: string;
  image: string;
  name: string;
  driver: string;
  platform: string;
  hostConfig?: {
    networkMode: string;
    portBindings: Record<string, PortBinding[]>;
    restartPolicy: {
      name: string;
      maximumRetryCount: number;
    };
    autoRemove: boolean;
  };
  mounts: Mount[];
  config?: {
    env: string[];
    image: string;
  };
  networkSettings?: {
    networks: Record<string, { networkId: string }>;
  };
};

export const runContainerSchema = z.object({
  image: z.string(),
  name: z.string().optional(),
  command: z.string().optional(),
  ports: z.array(z.object({
    value: z.string().optional(),
  })),
  mounts: z.array(z.object({
    type: z.string().default('bind'),
    source: z.string(),
    target: z.string(),
    name: z.string().optional(),
  })),
  envVars: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })),
  restartPolicy: z.object({
    name: z.string(),
    maximumRetryCount: z.number().optional(),
  }),
  isLocal: z.boolean().optional(),
  networkId: z.string().optional(),
  networkName: z.string().optional(),
  saveAsTemplate: z.boolean().optional(),
});

export type RunContainerRequest = z.infer<typeof runContainerSchema>;

export type RunContainerApiRequest = Omit<RunContainerRequest, 'ports' | 'envVars'> & {
  ports: string[];
  envVars: string[];
};
