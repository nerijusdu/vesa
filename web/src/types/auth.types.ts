import { z } from 'zod';

export const loginSchema = z.object({
  user: z.string(),
  passwd: z.string(),
});

export type LoginRequest = z.infer<typeof loginSchema>;

export type LoginData = {
  expires_at?: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
}
