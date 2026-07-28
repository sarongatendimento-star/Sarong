import { getAllCollectionsForAdmin } from '@/lib/collections';
import CollectionsForm from '@/components/admin/CollectionsForm';

// Sem cache: painel administrativo precisa refletir o banco em tempo real.
export const revalidate = 0;

export default async function ColecoesPage() {
  const collections = await getAllCollectionsForAdmin();

  return (
    <div>
      <h1 className="mb-2 text-2xl tracking-tight text-sarong-black">Coleções</h1>
      <p className="mb-8 text-sm text-sarong-black/60">
        Controla a grade de coleções exibida na home do site. Coleções desativadas somem do site, mas
        continuam guardadas aqui.
      </p>
      <CollectionsForm collections={collections} />
    </div>
  );
}
