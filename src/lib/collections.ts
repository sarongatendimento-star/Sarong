import 'server-only';
import { cache } from 'react';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IS_SUPABASE_CONFIGURED, IS_SUPABASE_ADMIN_CONFIGURED } from '@/lib/supabase/config';
import { LOCAL_COLLECTIONS } from '@/data/collections';
import type { Collection } from '@/types/product';

// -----------------------------------------------------------------------------
// Camada de acesso a coleções — mesmo padrão de src/lib/categories.ts.
//
// getAllCollections(): só as ativas, ordenadas — é o que a vitrine (home)
// usa, via CollectionBanner.
//
// getAllCollectionsForAdmin(): TODAS (incluindo inativas), para a tela
// /admin/dashboard/colecoes poder editar/reativar qualquer uma. Usa o cliente
// admin (service_role) porque a policy pública de `collections` só libera
// linhas com active = true.
//
// updateCollection(): grava nome, imagem, link e status de uma coleção —
// mesmo padrão de updateSiteSettings (exige Supabase configurado com a
// service_role key; sem isso, não há como escrever com segurança).
//
// MODO PREVIEW: sem Supabase configurado, devolve src/data/collections.ts em
// vez de consultar o banco (edição não fica disponível nesse modo).
// -----------------------------------------------------------------------------

interface CollectionRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  link_href: string | null;
  display_order: number;
  active: boolean;
}

const COLLECTION_COLUMNS = 'id, name, slug, description, image_url, link_href, display_order, active';

function mapRowToCollection(row: CollectionRow): Collection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    linkHref: row.link_href ?? undefined,
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
    .select(COLLECTION_COLUMNS)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar coleções: ${error.message}`);
  return (data || []).map(mapRowToCollection);
});

export async function getAllCollectionsForAdmin(): Promise<Collection[]> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return LOCAL_COLLECTIONS;
  }

  const { data, error } = await supabaseAdmin
    .from('collections')
    .select(COLLECTION_COLUMNS)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar coleções: ${error.message}`);
  return (data || []).map(mapRowToCollection);
}

export interface CollectionUpdateInput {
  name?: string;
  imageUrl?: string;
  linkHref?: string;
  active?: boolean;
}

export async function updateCollection(
  id: string,
  patch: CollectionUpdateInput
): Promise<{ ok: true; collection: Collection } | { ok: false; error: string }> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return { ok: false, error: 'Edição de coleções só está disponível com o Supabase configurado.' };
  }

  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl;
  if (patch.linkHref !== undefined) row.link_href = patch.linkHref;
  if (patch.active !== undefined) row.active = patch.active;

  const { data, error } = await supabaseAdmin
    .from('collections')
    .update(row)
    .eq('id', id)
    .select(COLLECTION_COLUMNS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, collection: mapRowToCollection(data) };
}
