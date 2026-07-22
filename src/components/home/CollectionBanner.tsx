import Link from 'next/link';
import { getAllCollections } from '@/lib/collections';

// Mapeamento de quantas colunas usar no desktop conforme o número de
// coleções ativas — classes literais (não geradas em runtime) para o Tailwind
// conseguir detectá-las na varredura do build.
const DESKTOP_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

// Grade de navegação por coleção — cada bloco é um convite visual, não uma
// lista de links comum. Antes (V1.3): 5 itens fixos no código, com imagens
// hotlinkadas do Unsplash. Agora: lê da tabela `collections` (nome, imagem,
// link e ordem editáveis em /admin/dashboard/colecoes).
export default async function CollectionBanner() {
  const collections = await getAllCollections();

  if (collections.length === 0) return null;

  const desktopCols = DESKTOP_COLS[collections.length] ?? 'md:grid-cols-5';

  return (
    <section className={`grid grid-cols-2 ${desktopCols}`}>
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={collection.linkHref || '/produtos'}
          className="group relative block aspect-[3/4] overflow-hidden bg-sarong-black/5"
        >
          {collection.imageUrl ? (
            <img
              src={collection.imageUrl}
              alt={collection.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-sarong-black/5" />
          )}
          <div className="absolute inset-0 bg-sarong-black/30 transition-colors duration-500 group-hover:bg-sarong-black/45" />
          <span className="absolute bottom-5 left-5 text-xs uppercase tracking-widest2 text-sarong-off">
            {collection.name}
          </span>
        </Link>
      ))}
    </section>
  );
}
