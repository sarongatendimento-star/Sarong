// Tipagem central de produto.
// Pensada para crescer: hoje descreve um item vitrine que redireciona para o
// Mercado Livre, mas ja contempla os campos (estoque, sku) que um e-commerce
// proprio precisaria futuramente, evitando refatoracao de tipos.
//
// ETAPA 1 (Supabase): categorias deixaram de ser um enum fixo no código e
// passaram a ser registros da tabela `categories`, editáveis por CRUD na
// ETAPA 7. Por isso `category` agora é `string` (o slug da categoria) em vez
// de união fixa — nenhum componente quebra, pois todos já tratam `category`
// como texto simples (comparações e links por slug).
export type ProductCategory = string;

export type ProductTag = 'novo' | 'promocao' | 'mais-vendido' | 'lancamento';

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  price: number;
  oldPrice?: number;
  category: ProductCategory;
  tags: ProductTag[];
  images: string[];
  mercadoLivreUrl: string;
  featured: boolean;
  // Preparado para o futuro: quando o site tiver carrinho proprio,
  // estes campos ja existem e nao exigem migracao de schema.
  stock?: number;
  sku?: string;
  active: boolean;
  createdAt: string;
  // --- Campos novos da ETAPA 1, aditivos: nada que já existia deixou de
  // existir ou mudou de tipo, então nenhum componente atual precisa mudar. ---
  categoryName?: string;      // nome de exibição da categoria (join com `categories`)
  collectionId?: string;      // FK opcional para `collections`
  collectionSlug?: string;
  collectionName?: string;
  displayOrder?: number;      // ordem manual de exibição (usada em telas futuras)
}

// Linha da tabela `categories` no Supabase — usada pelo CRUD da ETAPA 7 e,
// desde já, para popular os filtros de produto a partir do banco.
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
}

// Linha da tabela `collections` — usada pelo CRUD da ETAPA 8.
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
}
