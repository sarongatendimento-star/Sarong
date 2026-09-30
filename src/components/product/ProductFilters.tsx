'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import clsx from 'clsx';
import type { Category } from '@/types/product';

interface ProductFiltersProps {
  active: string;
  categories: Category[];
}

// Filtro de categoria via query string — permite compartilhar/linkar uma
// categoria especifica e mantem a pagina de produtos como Server Component.
//
// V1.1: a lista de categorias vem do banco (prop `categories`), em vez de um
// array fixo — uma categoria nova criada pelo admin (ETAPA 7, futura) já
// aparece aqui automaticamente, sem precisar editar este arquivo.
export default function ProductFilters({ active, categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const options = [
    { label: 'Todos', value: 'todos', comingSoon: false },
    ...categories.map((c) => ({ label: c.name, value: c.slug, comingSoon: c.comingSoon })),
  ];

  function handleSelect(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', value);
    }
    params.delete('page'); // trocar de categoria sempre volta para a página 1
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-sarong-black/10 pb-6">
      {options.map((cat) =>
        // Mesma regra do menu do Header: categoria "em breve" aparece
        // desabilitada aqui também, em vez de continuar clicável e levar
        // para uma aba sem nenhum produto disponível para compra.
        cat.comingSoon ? (
          <span
            key={cat.value}
            aria-disabled="true"
            className="cursor-not-allowed select-none text-xs uppercase tracking-widest2 text-sarong-black/30"
          >
            {cat.label} <span className="normal-case">(em breve)</span>
          </span>
        ) : (
          <button
            key={cat.value}
            onClick={() => handleSelect(cat.value)}
            className={clsx(
              'text-xs uppercase tracking-widest2 transition-colors duration-300',
              active === cat.value ? 'text-sarong-red' : 'text-sarong-black/50 hover:text-sarong-black'
            )}
          >
            {cat.label}
          </button>
        )
      )}
    </div>
  );
}
