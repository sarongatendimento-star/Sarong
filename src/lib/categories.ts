import 'server-only';
import { cache } from 'react';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IS_SUPABASE_CONFIGURED, IS_SUPABASE_ADMIN_CONFIGURED } from '@/lib/supabase/config';
import { LOCAL_CATEGORIES } from '@/data/categories';
import type { Category } from '@/types/product';

// -----------------------------------------------------------------------------
// Camada de acesso a categorias — mesmo padrão de src/lib/products.ts e,
// agora, do src/lib/collections.ts (ETAPA 8).
//
// getAllCategories(): só as ativas, ordenadas — o que Header, ProductFilters
// e o <select> do formulário de produto usam.
//
// getAllCategoriesForAdmin(): TODAS (incluindo inativas), para a tela
// /admin/dashboard/categorias poder editar/reativar qualquer uma. Usa o
// cliente admin (service_role) porque a policy pública só libera linhas com
// active = true.
//
// updateCategory(): grava nome, ordem ou status de uma categoria já
// existente. O `slug` NUNCA é editável por aqui de propósito — ele é usado
// em vários lugares (menu, filtros de produto, os links das coleções
// configurados na ETAPA 8) e mudar o valor quebraria esses links sem avisar
// ninguém.
//
// createCategory(): cria uma categoria nova, gerando o slug automaticamente
// a partir do nome.
//
// MODO PREVIEW: sem Supabase configurado, devolve src/data/categories.ts em
// vez de consultar o banco (edição não fica disponível nesse modo).
// -----------------------------------------------------------------------------

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  coming_soon: boolean;
  display_order: number;
  active: boolean;
}

const CATEGORY_COLUMNS = 'id, name, slug, description, image_url, coming_soon, display_order, active';

function mapRowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    comingSoon: row.coming_soon,
    displayOrder: row.display_order,
    active: row.active,
  };
}

// Ex.: "Moda Praia & Verão" -> "moda-praia-verao"
function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const getAllCategories = cache(async (): Promise<Category[]> => {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return LOCAL_CATEGORIES;
  }

  const { data, error } = await supabasePublic
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`);
  return (data || []).map(mapRowToCategory);
});

export async function getAllCategoriesForAdmin(): Promise<Category[]> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return LOCAL_CATEGORIES;
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .select(CATEGORY_COLUMNS)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`);
  return (data || []).map(mapRowToCategory);
}

export interface CategoryUpdateInput {
  name?: string;
  comingSoon?: boolean;
  displayOrder?: number;
  active?: boolean;
}

type CategoryResult = { ok: true; category: Category } | { ok: false; error: string };

export async function updateCategory(id: string, patch: CategoryUpdateInput): Promise<CategoryResult> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return { ok: false, error: 'Edição de categorias só está disponível com o Supabase configurado.' };
  }

  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.comingSoon !== undefined) row.coming_soon = patch.comingSoon;
  if (patch.displayOrder !== undefined) row.display_order = patch.displayOrder;
  if (patch.active !== undefined) row.active = patch.active;

  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(row)
    .eq('id', id)
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, category: mapRowToCategory(data) };
}

export interface CategoryCreateInput {
  name: string;
  displayOrder?: number;
}

export async function createCategory(input: CategoryCreateInput): Promise<CategoryResult> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return { ok: false, error: 'Criação de categorias só está disponível com o Supabase configurado.' };
  }

  const baseSlug = slugify(input.name);
  if (!baseSlug) return { ok: false, error: 'Não foi possível gerar um identificador a partir desse nome.' };

  // Evita colisão de slug (ex.: duas categorias chamadas "Vestidos").
  let slug = baseSlug;
  for (let attempt = 2; ; attempt++) {
    const { data: existing } = await supabaseAdmin.from('categories').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt}`;
  }

  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name: input.name,
      slug,
      display_order: input.displayOrder ?? 0,
      active: true,
    })
    .select(CATEGORY_COLUMNS)
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, category: mapRowToCategory(data) };
}
