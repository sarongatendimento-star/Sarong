import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { supabaseUrl, supabaseAnonKey, IS_SUPABASE_CONFIGURED } from './config';

// -----------------------------------------------------------------------------
// Cliente Supabase vinculado aos cookies do Next.js — usado nas Route Handlers
// de autenticação (src/app/api/auth/route.ts) e em qualquer verificação de
// sessão (src/lib/auth.ts). Usa a anon key (o próprio Supabase Auth valida a
// sessão do usuário; não precisa de service role para isso).
//
// Complementa (não substitui) os clientes já existentes:
//   - src/lib/supabase/public.ts → leitura pública da vitrine (sem sessão)
//   - src/lib/supabase/admin.ts  → escrita administrativa (service role)
//   - este arquivo               → sessão do usuário logado (Supabase Auth)
//
// MODO PREVIEW: a checagem das variáveis de ambiente foi movida para DENTRO
// da função (em vez de rodar ao importar o arquivo) para que o build e as
// demais rotas continuem funcionando sem Supabase configurado. Quem chama
// esta função (src/lib/auth.ts) já verifica IS_SUPABASE_CONFIGURED antes —
// este erro aqui é só uma rede de segurança.
// -----------------------------------------------------------------------------

export async function createSupabaseServerClient() {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error(
      'Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias (veja .env.example).'
    );
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
      ) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Chamado a partir de um Server Component (não de uma Route
          // Handler/Server Action) — não é possível escrever cookies aqui.
          // Sem problema: o middleware já cuida de renovar a sessão.
        }
      },
    },
  });
}
