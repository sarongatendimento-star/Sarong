import 'server-only';

// -----------------------------------------------------------------------------
// Ponto único de checagem das variáveis de ambiente do Supabase.
//
// Nenhuma das constantes abaixo lança erro — só lê o `process.env` e expõe
// flags booleanas. Isso é o que permite o modo PREVIEW: o projeto inteiro
// (build e runtime) funciona mesmo com essas variáveis ausentes, porque
// nenhum arquivo tenta criar um client do Supabase sem checar antes.
//
// Quando a V2 reconectar o Supabase, basta configurar as variáveis na
// Vercel — nenhum código precisa mudar, os clients passam a se criar
// normalmente porque IS_SUPABASE_CONFIGURED / IS_SUPABASE_ADMIN_CONFIGURED
// passam a ser `true`.
// -----------------------------------------------------------------------------

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Suficiente para leitura pública (vitrine) e para o client de sessão/cookies.
export const IS_SUPABASE_CONFIGURED = Boolean(supabaseUrl && supabaseAnonKey);

// Necessário para o client administrativo (service role) — CRUD do painel e upload.
export const IS_SUPABASE_ADMIN_CONFIGURED = Boolean(supabaseUrl && supabaseServiceRoleKey);
