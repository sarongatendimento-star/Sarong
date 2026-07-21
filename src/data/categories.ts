import type { Category } from '@/types/product';

// -----------------------------------------------------------------------------
// Dados locais de categorias — usados no modo PREVIEW (sem Supabase).
//
// Mesmo formato que a tabela `categories` do Supabase devolveria, então
// `src/lib/categories.ts` consegue alternar entre este arquivo e o banco sem
// que nenhum componente precise saber a diferença.
//
// Ao ligar o Supabase novamente (V2), este arquivo deixa de ser usado
// automaticamente — não precisa ser apagado.
// -----------------------------------------------------------------------------

export const LOCAL_CATEGORIES: Category[] = [
  {
    id: 'cat-vestidos',
    name: 'Vestidos',
    slug: 'vestidos',
    description: 'Vestidos leves e editoriais para o dia a dia e a praia.',
    displayOrder: 1,
    active: true,
  },
  {
    id: 'cat-cangas',
    name: 'Cangas',
    slug: 'cangas',
    description: 'Cangas estampadas em algodão e viscose.',
    displayOrder: 2,
    active: true,
  },
  {
    id: 'cat-moda-praia',
    name: 'Moda Praia',
    slug: 'moda-praia',
    description: 'Biquínis, maiôs e saídas de praia.',
    displayOrder: 3,
    active: true,
  },
  {
    id: 'cat-lancamentos',
    name: 'Lançamentos',
    slug: 'lancamentos',
    description: 'As peças mais recentes da coleção.',
    displayOrder: 4,
    active: true,
  },
];
