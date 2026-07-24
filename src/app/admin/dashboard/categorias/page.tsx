import { getAllCategoriesForAdmin } from '@/lib/categories';
import CategoriesForm from '@/components/admin/CategoriesForm';

export default async function CategoriasPage() {
  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <h1 className="mb-2 text-2xl tracking-tight text-sarong-black">Categorias</h1>
      <p className="mb-8 text-sm text-sarong-black/60">
        Controla o menu e os filtros de produto do site. Categorias desativadas somem do site, mas
        continuam guardadas aqui. O identificador de cada categoria (usado nos links) não pode ser
        alterado depois de criada.
      </p>
      <CategoriesForm categories={categories} />
    </div>
  );
}
