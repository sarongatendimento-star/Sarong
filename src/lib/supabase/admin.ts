import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseServiceRoleKey, IS_SUPABASE_ADMIN_CONFIGURED } from './config';

// -----------------------------------------------------------------------------
// Cliente Supabase ADMINISTRATIVO — usa a service_role key, que ignora RLS.
//
// Só deve ser usado dentro de rotas em src/app/api/**, que já checam
// hasSession() (src/lib/auth.ts) antes de qualquer leitura/escrita. A
// service_role key NUNCA deve ser exposta ao cliente nem prefixada com
// NEXT_PUBLIC_.
//
// Quando a ETAPA 2 trocar a autenticação para Supabase Auth, este cliente
// continua sendo o usado nas rotas de API — o que muda é apenas COMO
// validamos quem está logado antes de chamá-lo.
//
// MODO PREVIEW: se as variáveis de ambiente não estiverem configuradas,
// `supabaseAdmin` é `null` em vez de lançar erro na importação. Como o login
// (hasSession) fica sempre `false` nesse modo, nenhuma rota autenticada
// chega a usar este client de fato — mas ele não pode explodir a build.
// -----------------------------------------------------------------------------

export const supabaseAdmin: SupabaseClient | null = IS_SUPABASE_ADMIN_CONFIGURED
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, { auth: { persistSession: false } })
  : null;
