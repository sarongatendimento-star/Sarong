import type { ProductTag } from '@/types/product';

const LABELS: Record<ProductTag, string> = {
  novo: 'Novo',
  promocao: 'Promoção',
  'mais-vendido': 'Mais vendido',
  lancamento: 'Lançamento',
};

export default function Badge({ tag }: { tag: ProductTag }) {
  return (
    <span className="inline-block bg-sarong-off/95 px-3 py-1 text-[11px] uppercase tracking-widest2 text-sarong-black">
      {LABELS[tag]}
    </span>
  );
}
