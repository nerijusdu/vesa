import { z } from 'zod';

export type RegistryAuth = {
  identityToken?: string;
  serverAddress: string;
}

export const authSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  serverAddress: z.string(),
});

export const clientSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export type AuthRequest = z.infer<typeof authSchema>;
export type ClientRequest = z.infer<typeof clientSchema>;
