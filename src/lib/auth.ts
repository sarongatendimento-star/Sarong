import 'server-only';
import { cookies } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { IS_SUPABASE_CONFIGURED } from '@/lib/supabase/config';
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  checkLocalCredentials,
  createSessionToken,
  verifySessionToken,
} from '@/lib/local-auth';

// -----------------------------------------------------------------------------
// Autenticação do painel administrativo.
//
// V2 (Supabase configurado): e-mail + senha reais via Supabase Auth, sessão
// gerenciada por cookies HttpOnly assinados pelo próprio Supabase.
//
// MODO PREVIEW (sem Supabase): login local, com credenciais fixas
// (configuráveis por ADMIN_EMAIL / ADMIN_PASSWORD — ver src/lib/local-auth.ts)
// e sessão num cookie HttpOnly assinado por este servidor. Não é Supabase
// Auth, mas mantém as mesmas garantias básicas (sessão não falsificável sem
// a chave de assinatura) e a mesma assinatura de funções — nenhuma rota de
// API precisou mudar para ganhar isso.
//
// `hasSession()` manteve o nome e a assinatura (Promise<boolean>) porque é
// chamada por src/app/api/products/route.ts, src/app/api/products/[id]/route.ts,
// src/app/api/upload/route.ts e src/app/api/settings/route.ts.
// -----------------------------------------------------------------------------

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  if (!IS_SUPABASE_CONFIGURED) {
    if (!checkLocalCredentials(email, password)) {
      return { error: 'E-mail ou senha inválidos.' };
    }

    const token = await createSessionToken(email);
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return { error: null };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  if (!IS_SUPABASE_CONFIGURED) {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_SESSION_COOKIE);
    return;
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

export async function hasSession(): Promise<boolean> {
  if (!IS_SUPABASE_CONFIGURED) {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    return verifySessionToken(token);
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return Boolean(user);
}
