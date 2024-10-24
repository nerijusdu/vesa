import { z } from 'zod';

export type App = {
  id: string;
  name: string;
  route: string;
  domain: {
    host: string;
    pathPrefixes?: string[];
    stripPath?: boolean;
    entrypoints: string[];
  }
}

export const createAppSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  route: z.string(),
  domain: z.object({
    host: z.string(),
    pathPrefixes: z.array(z.object({
      value: z.string(),
    })).default([]),
    stripPath: z.boolean().optional(),
    entrypoints: z.array(z.string().min(3)).length(1),
  }),
});

export type CreateAppRequest = z.infer<typeof createAppSchema>;
