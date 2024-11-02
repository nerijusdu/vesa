import { z } from 'zod';

export type Job = {
  id: string;
  name: string;
  url: string;
  schedule: string;
  secret: string;
  enabled: boolean;
}

export const createJobSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  url: z.string(),
  schedule: z.string(),
  secret: z.string(),
  enabled: z.boolean(),
});

export type CreateJobRequest = z.infer<typeof createJobSchema>;
