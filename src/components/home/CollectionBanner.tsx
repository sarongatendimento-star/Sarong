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
// link, ordem e "em breve" editáveis em /admin/dashboard/colecoes).
//
// Coleções marcadas como "em breve" continuam visíveis (para dar uma prévia
// do catálogo completo), mas com a foto desfocada, um aviso "Em breve" por
// cima, e sem link — clicar não leva a lugar nenhum enquanto a coleção não
// estiver pronta.
export default async function CollectionBanner() {
  const collections = await getAllCollections();

  if (collections.length === 0) return null;

  const desktopCols = DESKTOP_COLS[collections.length] ?? 'md:grid-cols-5';

  return (
    <section className={`grid grid-cols-2 ${desktopCols}`}>
      {collections.map((collection) => {
        const image = collection.imageUrl ? (
          <img
            src={collection.imageUrl}
            alt={collection.name}
            loading="lazy"
            className={
              collection.comingSoon
                ? 'h-full w-full scale-105 object-cover blur-sm'
                : 'h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105'
            }
          />
        ) : (
          <div className="h-full w-full bg-sarong-black/5" />
        );

        if (collection.comingSoon) {
          return (
            <div
              key={collection.id}
              aria-disabled="true"
              className="relative block aspect-[3/4] cursor-not-allowed select-none overflow-hidden bg-sarong-black/5"
            >
              {image}
              <div className="absolute inset-0 bg-sarong-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                <span className="text-xs uppercase tracking-widest2 text-sarong-off">{collection.name}</span>
                <span className="border border-sarong-off/70 px-3 py-1 text-[10px] uppercase tracking-widest2 text-sarong-off">
                  Em breve
                </span>
              </div>
            </div>
          );
        }

        return (
          <Link
            key={collection.id}
            href={collection.linkHref || '/produtos'}
            className="group relative block aspect-[3/4] overflow-hidden bg-sarong-black/5"
          >
            {image}
            <div className="absolute inset-0 bg-sarong-black/30 transition-colors duration-500 group-hover:bg-sarong-black/45" />
            <span className="absolute bottom-5 left-5 text-xs uppercase tracking-widest2 text-sarong-off">
              {collection.name}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
