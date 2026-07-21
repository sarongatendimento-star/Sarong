import { z } from 'zod';

// Login agora é por e-mail/senha (Supabase Auth) em vez de "usuário" — ver
// src/lib/auth.ts e src/app/admin/page.tsx.
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
