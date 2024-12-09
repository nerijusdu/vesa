import { z } from 'zod';

export type App = {
  id: string;
  name: string;
  route: string;
  domain: {
    host: string;
    pathPrefixes?: string[];
    stripPrefix?: boolean;
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
    stripPrefix: z.boolean().optional(),
    entrypoints: z.array(z.string().min(3)).length(1),
    headers: z.array(z.object({
      name: z.string(),
      value: z.string(),
    })).optional().nullish(),
  }),
});

export type CreateAppRequest = z.infer<typeof createAppSchema>;
