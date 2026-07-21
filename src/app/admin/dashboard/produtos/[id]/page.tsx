import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { getProductByIdAdmin } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import { getAllCollections } from '@/lib/collections';

export default async function EditarProdutoPage({ params }: { params: { id: string } }) {
  const [product, categories, collections] = await Promise.all([
    getProductByIdAdmin(params.id),
    getAllCategories(),
    getAllCollections(),
  ]);

  if (!product) notFound();

  return <ProductForm mode="edit" product={product} categories={categories} collections={collections} />;
}
