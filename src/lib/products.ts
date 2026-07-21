import 'server-only';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IS_SUPABASE_CONFIGURED, IS_SUPABASE_ADMIN_CONFIGURED } from '@/lib/supabase/config';
import { getLocalProducts, saveLocalProducts } from '@/lib/local-products-store';
import { LOCAL_CATEGORIES } from '@/data/categories';
import { LOCAL_COLLECTIONS } from '@/data/collections';
import type { Product, ProductCategory, ProductTag } from '@/types/product';

// -----------------------------------------------------------------------------
// Camada de acesso a dados dos produtos.
//
// V1.1: adiciona paginação a getProductsByCategory e getAllProductsAdmin, e
// corrige um bug latente da ETAPA 1 (o filtro por categoria era feito em
// JavaScript DEPOIS de já ter buscado os dados — hoje o filtro acontece de
// fato no banco, via inner join, o que é necessário para o `count` da
// paginação vir correto).
//
// getAllProducts() (sem paginação) foi mantida como está — é usada pelo
// sitemap, que precisa de fato de todos os produtos, não de uma página.
//
// MODO PREVIEW: sem NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY
// configuradas, todas as funções abaixo (leitura E escrita) operam sobre o
// catálogo local editável de src/lib/local-products-store.ts, replicando em
// memória o mesmo filtro/ordenação/paginação que o Supabase faria. O painel
// administrativo (login local — ver src/lib/auth.ts) cria/edita/exclui
// produtos de verdade nesse catálogo local.
// -----------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Formato retornado pelo Supabase (snake_case, com join de categoria/coleção)
interface ProductRow {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  features: string[] | null;
  price: number;
  old_price: number | null;
  images: string[] | null;
  mercado_livre_url: string;
  featured: boolean;
  is_new: boolean;
  is_promo: boolean;
  is_bestseller: boolean;
  active: boolean;
  stock: number | null;
  sku: string | null;
  display_order: number;
  created_at: string;
  categories: { id: string; slug: string; name: string } | null;
  collections: { id: string; slug: string; name: string } | null;
}

// `!inner` é necessário sempre que o filtro (.eq) recai sobre uma coluna da
// tabela relacionada (categories.slug) — sem isso o PostgREST ignora o filtro
// silenciosamente e devolve produtos de todas as categorias.
function buildProductSelect(innerJoinCategory: boolean) {
  return `
    id, slug, name, short_description, description, features, price, old_price,
    images, mercado_livre_url, featured, is_new, is_promo, is_bestseller, active,
    stock, sku, display_order, created_at,
    categories${innerJoinCategory ? '!inner' : ''} ( id, slug, name ),
    collections ( id, slug, name )
  `;
}

const PRODUCT_SELECT = buildProductSelect(false);

function mapRowToProduct(row: ProductRow): Product {
  const tags: ProductTag[] = [];
  if (row.is_new) tags.push('novo');
  if (row.is_promo) tags.push('promocao');
  if (row.is_bestseller) tags.push('mais-vendido');

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description || '',
    description: row.description || '',
    features: row.features || [],
    price: Number(row.price),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    category: row.categories?.slug || '',
    categoryName: row.categories?.name,
    tags,
    images: row.images || [],
    mercadoLivreUrl: row.mercado_livre_url,
    featured: row.featured,
    stock: row.stock ?? undefined,
    sku: row.sku ?? undefined,
    active: row.active,
    createdAt: row.created_at,
    collectionId: row.collections?.id,
    collectionSlug: row.collections?.slug,
    collectionName: row.collections?.name,
    displayOrder: row.display_order,
  };
}

function toPaginated<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResult<T> {
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ---- Helpers do catálogo local (MODO PREVIEW) -------------------------------

function sortLocalProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const orderDiff = (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function paginateLocal<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
  const from = (page - 1) * pageSize;
  const pageItems = items.slice(from, from + pageSize);
  return toPaginated(pageItems, items.length, page, pageSize);
}

// ---- Funções públicas (vitrine) ---------------------------------------------

export async function getAllProducts(): Promise<Product[]> {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return sortLocalProducts(getLocalProducts().filter((p) => p.active));
  }

  const { data, error } = await supabasePublic
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao buscar produtos: ${error.message}`);
  return (data as unknown as ProductRow[]).map(mapRowToProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return sortLocalProducts(getLocalProducts().filter((p) => p.active && p.featured));
  }

  const { data, error } = await supabasePublic
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .eq('featured', true)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Erro ao buscar produtos em destaque: ${error.message}`);
  return (data as unknown as ProductRow[]).map(mapRowToProduct);
}

// Listagem pública paginada (usada em /produtos). Substituiu a versão
// anterior, que devolvia todos os produtos de uma vez.
export async function getProductsByCategory(
  category: ProductCategory | 'todos',
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? 12;

  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    const filtered = getLocalProducts().filter(
      (p) => p.active && (category === 'todos' || p.category === category)
    );
    return paginateLocal(sortLocalProducts(filtered), page, pageSize);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const useInnerJoin = category !== 'todos';
  let query = supabasePublic
    .from('products')
    .select(buildProductSelect(useInnerJoin), { count: 'exact' })
    .eq('active', true);

  if (useInnerJoin) {
    query = query.eq('categories.slug', category);
  }

  const { data, error, count } = await query
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar produtos da categoria "${category}": ${error.message}`);

  const items = (data as unknown as ProductRow[]).map(mapRowToProduct);
  return toPaginated(items, count ?? 0, page, pageSize);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return getLocalProducts().find((p) => p.active && p.slug === slug);
  }

  const { data, error } = await supabasePublic
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('active', true)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar produto "${slug}": ${error.message}`);
  return data ? mapRowToProduct(data as unknown as ProductRow) : undefined;
}

export async function getAllSlugs(): Promise<string[]> {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    return getLocalProducts().filter((p) => p.active).map((p) => p.slug);
  }

  const { data, error } = await supabasePublic.from('products').select('slug').eq('active', true);

  if (error) throw new Error(`Erro ao buscar slugs: ${error.message}`);
  return (data || []).map((row) => row.slug as string);
}

// ---- Funções usadas pelo painel administrativo (CRUD) ----------------------
// Usam supabaseAdmin (service role) porque o admin precisa enxergar e alterar
// também produtos inativos — algo que a policy pública de RLS não permite.
//
// MODO PREVIEW: painel com login local (ver src/lib/auth.ts) — as funções de
// leitura E escrita abaixo operam sobre o catálogo local editável (ver
// src/lib/local-products-store.ts).

export async function getAllProductsAdmin(
  pagination: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const page = pagination.page ?? 1;
  const pageSize = pagination.pageSize ?? 10;

  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    const sorted = [...getLocalProducts()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return paginateLocal(sorted, page, pageSize);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(`Erro ao buscar produtos (admin): ${error.message}`);

  const items = (data as unknown as ProductRow[]).map(mapRowToProduct);
  return toPaginated(items, count ?? 0, page, pageSize);
}

// Resolve o slug de categoria/coleção enviado pelo formulário para o `id`
// correspondente na tabela — mantém a rota de API livre de saber que agora
// existe uma FK por trás do campo `category`.
export async function getProductByIdAdmin(id: string): Promise<Product | undefined> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return getLocalProducts().find((p) => p.id === id);
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar produto (admin): ${error.message}`);
  return data ? mapRowToProduct(data as unknown as ProductRow) : undefined;
}

export interface ProductStats {
  total: number;
  featured: number;
  promo: number;
}

// Usado pelo resumo do Dashboard (V1.2). Usa count com head:true — traz só a
// contagem, sem baixar as linhas, então continua barato mesmo com o catálogo
// crescendo.
export async function getProductStats(): Promise<ProductStats> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    return {
      total: getLocalProducts().length,
      featured: getLocalProducts().filter((p) => p.featured).length,
      promo: getLocalProducts().filter((p) => p.tags.includes('promocao')).length,
    };
  }

  const [totalRes, featuredRes, promoRes] = await Promise.all([
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('featured', true),
    supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_promo', true),
  ]);

  if (totalRes.error) throw new Error(`Erro ao buscar estatísticas: ${totalRes.error.message}`);

  return {
    total: totalRes.count ?? 0,
    featured: featuredRes.count ?? 0,
    promo: promoRes.count ?? 0,
  };
}

async function resolveCategoryId(categorySlug: string | undefined): Promise<string | null> {
  if (!categorySlug || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
  return data?.id ?? null;
}

async function resolveCollectionId(collectionSlug: string | undefined): Promise<string | null> {
  if (!collectionSlug || !supabaseAdmin) return null;
  const { data } = await supabaseAdmin
    .from('collections')
    .select('id')
    .eq('slug', collectionSlug)
    .maybeSingle();
  return data?.id ?? null;
}

export async function createProduct(product: Product): Promise<Product> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    const category = LOCAL_CATEGORIES.find((c) => c.slug === product.category);
    const collection = LOCAL_COLLECTIONS.find((c) => c.slug === product.collectionSlug);
    const withNames: Product = {
      ...product,
      categoryName: category?.name,
      collectionId: collection?.id,
      collectionName: collection?.name,
      displayOrder: product.displayOrder ?? 0,
    };
    saveLocalProducts([withNames, ...getLocalProducts()]);
    return withNames;
  }

  const categoryId = await resolveCategoryId(product.category);
  const collectionId = await resolveCollectionId(product.collectionSlug);

  const { data, error } = await supabaseAdmin
    .from('products')
    .insert({
      id: product.id,
      slug: product.slug,
      name: product.name,
      short_description: product.shortDescription,
      description: product.description,
      features: product.features,
      price: product.price,
      old_price: product.oldPrice ?? null,
      category_id: categoryId,
      collection_id: collectionId,
      images: product.images,
      mercado_livre_url: product.mercadoLivreUrl,
      featured: product.featured,
      is_new: product.tags.includes('novo'),
      is_promo: product.tags.includes('promocao'),
      is_bestseller: product.tags.includes('mais-vendido'),
      active: product.active,
    })
    .select(PRODUCT_SELECT)
    .single();

  if (error) throw new Error(`Erro ao criar produto: ${error.message}`);
  return mapRowToProduct(data as unknown as ProductRow);
}

export async function updateProduct(
  id: string,
  patch: Partial<Product>
): Promise<Product | null> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    const products = getLocalProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = products[index];
    const category = patch.category !== undefined ? LOCAL_CATEGORIES.find((c) => c.slug === patch.category) : undefined;
    const collection =
      patch.collectionSlug !== undefined ? LOCAL_COLLECTIONS.find((c) => c.slug === patch.collectionSlug) : undefined;

    const merged: Product = {
      ...current,
      ...patch,
      categoryName: patch.category !== undefined ? category?.name : current.categoryName,
      collectionId: patch.collectionSlug !== undefined ? collection?.id : current.collectionId,
      collectionName: patch.collectionSlug !== undefined ? collection?.name : current.collectionName,
    };

    const next = [...products];
    next[index] = merged;
    saveLocalProducts(next);
    return merged;
  }

  const update: Record<string, unknown> = {};

  if (patch.name !== undefined) update.name = patch.name;
  if (patch.slug !== undefined) update.slug = patch.slug;
  if (patch.shortDescription !== undefined) update.short_description = patch.shortDescription;
  if (patch.description !== undefined) update.description = patch.description;
  if (patch.features !== undefined) update.features = patch.features;
  if (patch.price !== undefined) update.price = patch.price;
  if (patch.oldPrice !== undefined) update.old_price = patch.oldPrice;
  if (patch.images !== undefined) update.images = patch.images;
  if (patch.mercadoLivreUrl !== undefined) update.mercado_livre_url = patch.mercadoLivreUrl;
  if (patch.featured !== undefined) update.featured = patch.featured;
  if (patch.active !== undefined) update.active = patch.active;
  if (patch.stock !== undefined) update.stock = patch.stock;
  if (patch.sku !== undefined) update.sku = patch.sku;
  if (patch.displayOrder !== undefined) update.display_order = patch.displayOrder;
  if (patch.category !== undefined) update.category_id = await resolveCategoryId(patch.category);
  if (patch.collectionSlug !== undefined) update.collection_id = await resolveCollectionId(patch.collectionSlug);
  if (patch.tags !== undefined) {
    update.is_new = patch.tags.includes('novo');
    update.is_promo = patch.tags.includes('promocao');
    update.is_bestseller = patch.tags.includes('mais-vendido');
  }

  const { data, error } = await supabaseAdmin
    .from('products')
    .update(update)
    .eq('id', id)
    .select(PRODUCT_SELECT)
    .maybeSingle();

  if (error) throw new Error(`Erro ao atualizar produto: ${error.message}`);
  return data ? mapRowToProduct(data as unknown as ProductRow) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    const products = getLocalProducts();
    const next = products.filter((p) => p.id !== id);
    const changed = next.length !== products.length;
    if (changed) saveLocalProducts(next);
    return changed;
  }

  const { error, count } = await supabaseAdmin.from('products').delete({ count: 'exact' }).eq('id', id);

  if (error) throw new Error(`Erro ao excluir produto: ${error.message}`);
  return (count ?? 0) > 0;
}
