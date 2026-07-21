import type { Collection } from '@/types/product';

// -----------------------------------------------------------------------------
// Dados locais de coleções — usados no modo PREVIEW (sem Supabase).
// Mesmo papel de src/data/categories.ts: espelha o formato da tabela
// `collections` para que src/lib/collections.ts alterne a fonte sem impacto
// nos componentes.
// -----------------------------------------------------------------------------

export const LOCAL_COLLECTIONS: Collection[] = [
  {
    id: 'col-verao',
    name: 'Coleção Verão',
    slug: 'colecao-verao',
    description: 'Peças selecionadas para os dias mais quentes do ano.',
    displayOrder: 1,
    active: true,
  },
];
