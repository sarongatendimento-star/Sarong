import 'server-only';
import { cache } from 'react';
import { supabasePublic } from '@/lib/supabase/public';
import { IS_SUPABASE_CONFIGURED } from '@/lib/supabase/config';
import { LOCAL_CATEGORIES } from '@/data/categories';
import type { Category } from '@/types/product';

// -----------------------------------------------------------------------------
// Camada de acesso a categorias — mesmo padrão de src/lib/products.ts.
//
// V1.1: antes, os slugs de categoria (vestidos, cangas, moda-praia,
// lancamentos) estavam repetidos como arrays fixos em 4 arquivos diferentes
// (Header, ProductFilters, admin dashboard, e o CollectionBanner da Home).
// Agora Header, ProductFilters e o dashboard leem daqui — fonte única.
//
// O CollectionBanner da Home foi INTENCIONALMENTE mantido fora dessa troca:
// ele mistura categorias com uma coleção ("Coleção Verão") no mesmo grid de
// 5 blocos, então buscar só as 4 categorias do banco reduziria o grid para 4
// colunas — uma mudança visual real, que a Regra 5 não permite fazer sem
// autorização. Ver relatório de entrega da V1.1 para o detalhe dessa decisão.
//
// `cache()` do React garante que, dentro do MESMO request, múltiplas chamadas
// a getAllCategories() (ex.: uma página que renderiza Header E ProductFilters)
// disparem uma única consulta ao Supabase, não uma por componente.
//
// MODO PREVIEW: sem Supabase configurado, devolve src/data/categories.ts em
// vez de consultar o banco — nenhum componente precisa saber a diferença.
// -----------------------------------------------------------------------------

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  active: boolean;
}

function mapRowToCategory(row: CategoryRow): Category {
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

export const getAllCategories = cache(async (): Promise<Category[]> => {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return LOCAL_CATEGORIES;
  }

  const { data, error } = await supabasePublic
    .from('categories')
    .select('id, name, slug, description, image_url, display_order, active')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar categorias: ${error.message}`);
  return (data || []).map(mapRowToCategory);
});
