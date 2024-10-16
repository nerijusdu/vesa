import { z } from 'zod';

export type App = {
  id: string;
  name: string;
  domain: {
    host: string;
    entrypoints: string[];
  }
}

export const createAppSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  domain: z.object({
    host: z.string(),
    entrypoints: z.array(z.string().min(3)).length(1),
  }),
});

export type CreateAppRequest = z.infer<typeof createAppSchema>;
