import ProductForm from '@/components/admin/ProductForm';
import { getAllCategories } from '@/lib/categories';
import { getAllCollections } from '@/lib/collections';

export default async function NovoProdutoPage() {
  const [categories, collections] = await Promise.all([
    getAllCategories(),
    getAllCollections(),
  ]);

  return <ProductForm mode="create" categories={categories} collections={collections} />;
}
