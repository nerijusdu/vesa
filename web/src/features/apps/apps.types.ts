import { z } from 'zod';

export type App = {
  id: string;
  name: string;
  route: string;
  domain: {
    host: string;
    pathPrefix?: string;
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
    pathPrefix: z.string().optional(),
    stripPath: z.boolean().optional(),
    entrypoints: z.array(z.string().min(3)).length(1),
  }),
});

export type CreateAppRequest = z.infer<typeof createAppSchema>;
