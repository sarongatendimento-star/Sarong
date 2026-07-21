import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Pagination from '@/components/ui/Pagination';
import ProductFilters from '@/components/product/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid';
import { getProductsByCategory } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import { getSiteSettings } from '@/lib/site-settings';
import { buildMetadata } from '@/lib/seo';

const PAGE_SIZE = 12;

export const revalidate = 0;

export const metadata: Metadata = buildMetadata({
  title: 'Produtos',
  description: 'Vestidos, cangas e moda praia SARONG. Peças selecionadas, compra segura via Mercado Livre.',
  path: '/produtos',
});

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: { categoria?: string; page?: string };
}) {
  // Categorias vêm do banco (V1.1) — Header e ProductFilters não têm mais
  // nenhuma lista fixa embutida no código.
  const categories = await getAllCategories();
  const settings = getSiteSettings();
  const validSlugs = categories.map((c) => c.slug);

  const categoria =
    searchParams.categoria && validSlugs.includes(searchParams.categoria)
      ? searchParams.categoria
      : 'todos';

  const page = Math.max(1, Number(searchParams.page) || 1);
  const { items: products, totalPages } = await getProductsByCategory(categoria, {
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      <Header categories={categories} logoText={settings.logoText} />
      <main className="pt-32 pb-24">
        <Container>
          <div className="mb-12">
            <p className="mb-2 text-xs uppercase tracking-widest2 text-sarong-red">Coleção</p>
            <h1 className="font-sans text-3xl tracking-tight text-sarong-black md:text-4xl">
              Todos os produtos
            </h1>
          </div>

          <Suspense fallback={null}>
            <ProductFilters active={categoria} categories={categories} />
          </Suspense>

          <div className="mt-12">
            <ProductGrid products={products} />
          </div>

          <Suspense fallback={null}>
            <Pagination currentPage={page} totalPages={totalPages} />
          </Suspense>
        </Container>
      </main>
      <Footer logoText={settings.logoText} contact={settings.contact} footer={settings.footer} />
    </>
  );
}
