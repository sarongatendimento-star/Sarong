'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  /**
   * Modo controlado: quando informado, os botões chamam esta função em vez
   * de navegar por URL. Usado pelo dashboard (Client Component que já
   * mantém o número da página em estado local). Quando omitido, o
   * componente navega via querystring (?page=N) — usado em /produtos.
   */
  onPageChange?: (page: number) => void;
}

// Componente único de paginação, desenhado na mesma paleta/tipografia da
// marca (uppercase, tracking largo, vermelho queimado como cor ativa) para
// ser usado tanto na vitrine pública quanto no painel administrativo — evita
// duas implementações divergentes de "próxima/anterior".
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  }

  const baseClasses = 'text-xs uppercase tracking-widest2 transition-colors duration-300';

  function renderControl(direction: 'prev' | 'next') {
    const enabled = direction === 'prev' ? canGoPrev : canGoNext;
    const targetPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;
    const label = direction === 'prev' ? 'Anterior' : 'Próxima';

    const className = clsx(
      baseClasses,
      enabled ? 'text-sarong-black hover:text-sarong-red' : 'pointer-events-none text-sarong-black/30'
    );

    if (onPageChange) {
      return (
        <button
          type="button"
          disabled={!enabled}
          onClick={() => onPageChange(targetPage)}
          className={className}
        >
          {label}
        </button>
      );
    }

    return (
      <Link href={hrefForPage(targetPage)} aria-disabled={!enabled} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <nav aria-label="Paginação" className="mt-16 flex items-center justify-center gap-6">
      {renderControl('prev')}
      <span className="text-xs uppercase tracking-widest2 text-sarong-black/50">
        Página {currentPage} de {totalPages}
      </span>
      {renderControl('next')}
    </nav>
  );
}
