import { z } from 'zod';

export type Project = {
  id: string;
  name: string;
  containers: string[];
  networkId: string;
  networkName: string;
}

export const saveProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  containers: z.array(z.object({
    id: z.string(),
  })),
  networkId: z.string().optional(),
  networkName: z.string().optional(),
});

export type SaveProjectRequest = z.infer<typeof saveProjectSchema>;
