import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseAnonKey, IS_SUPABASE_CONFIGURED } from './config';

// -----------------------------------------------------------------------------
// Cliente Supabase para LEITURA pública (paginas da vitrine: home, /produtos,
// /produtos/[slug]). Usa a anon key, respeitando as policies de RLS definidas
// em supabase/schema.sql (só enxerga registros com active = true).
//
// Nunca importe este arquivo em Client Components — ele so deve rodar no
// servidor (Server Components / route handlers), por isso o "server-only".
//
// MODO PREVIEW: se as variáveis de ambiente não estiverem configuradas,
// `supabasePublic` é `null` em vez de lançar erro na importação — é isso que
// permite o projeto compilar e rodar sem Supabase. Quem consome este client
// (src/lib/products.ts, src/lib/categories.ts, src/lib/collections.ts) checa
// IS_SUPABASE_CONFIGURED antes de usar e cai para os dados locais em
// src/data/** quando ele for `null`.
// -----------------------------------------------------------------------------

export const supabasePublic: SupabaseClient | null = IS_SUPABASE_CONFIGURED
  ? createClient(supabaseUrl!, supabaseAnonKey!, { auth: { persistSession: false } })
  : null;
