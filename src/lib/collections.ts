import 'server-only';
import { cache } from 'react';
import { supabasePublic } from '@/lib/supabase/public';
import { IS_SUPABASE_CONFIGURED } from '@/lib/supabase/config';
import { LOCAL_COLLECTIONS } from '@/data/collections';
import type { Collection } from '@/types/product';

// -----------------------------------------------------------------------------
// Camada de acesso a coleções — mesmo padrão de src/lib/categories.ts.
//
// V1.2: usada pelo formulário único de produto (campo "Coleção"). A ativação
// de coleção (banner/destaques mudando automaticamente) é a V1.3 — aqui só
// precisamos listar as coleções existentes para o <select> do admin.
//
// MODO PREVIEW: sem Supabase configurado, devolve src/data/collections.ts em
// vez de consultar o banco.
// -----------------------------------------------------------------------------

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  active: boolean;
}

function mapRowToCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    displayOrder: row.display_order,
    active: row.active,
  };
}

export const getAllCollections = cache(async (): Promise<Collection[]> => {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return LOCAL_COLLECTIONS;
  }

  const { data, error } = await supabasePublic
    .from('collections')
    .select('id, name, slug, description, image_url, display_order, active')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar coleções: ${error.message}`);
  return (data || []).map(mapRowToCollection);
});
