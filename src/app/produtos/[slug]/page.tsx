import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import Badge from '@/components/ui/Badge';
import ProductGallery from '@/components/product/ProductGallery';
import { getAllSlugs, getProductBySlug } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import { getSiteSettings } from '@/lib/site-settings';
import { buildMetadata, buildProductJsonLd } from '@/lib/seo';
import { formatPrice } from '@/lib/format';
import { ArrowUpRight, Check } from 'lucide-react';

// Sem cache: produtos podem ser criados/editados a qualquer momento pelo
// painel administrativo (modo Preview), então cada acesso busca os dados
// mais recentes — inclusive produtos criados depois do último build, que
// generateStaticParams (rodado só em build time) não conheceria.
export const revalidate = 0;

// SSG: cada produto do catálogo original vira uma pagina estatica gerada em
// build time — otimo para performance e para SEO (URLs amigaveis e
// indexaveis desde o primeiro deploy). Produtos criados depois pelo painel
// continuam funcionando normalmente (renderizados sob demanda).
export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return buildMetadata({ title: 'Produto não encontrado' });

  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/produtos/${product.slug}`,
    image: product.images[0],
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const categories = await getAllCategories();
  const settings = getSiteSettings();
  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      {/* Rich snippet de produto (preco/disponibilidade) para o Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header categories={categories} logoText={settings.logoText} />
      <main className="pt-32 pb-24">
        <Container className="grid grid-cols-1 gap-14 md:grid-cols-2">
          <ProductGallery images={product.images} name={product.name} />

          <div>
            <div className="mb-3 flex gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} tag={tag} />
              ))}
            </div>
            <h1 className="font-sans text-3xl tracking-tight text-sarong-black md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-sm text-sarong-black/60">{product.shortDescription}</p>

            <div className="mt-6 flex items-center gap-3">
              {product.oldPrice && (
                <span className="text-base text-sarong-black/40 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="text-2xl text-sarong-black">{formatPrice(product.price)}</span>
            </div>

            <p className="mt-8 max-w-md text-sm leading-relaxed text-sarong-black/70">
              {product.description}
            </p>

            {product.features.length > 0 && (
              <ul className="mt-8 space-y-2">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-sarong-black/70">
                    <Check size={14} className="text-sarong-red" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            <a
              href={product.mercadoLivreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex w-full items-center justify-center gap-2 bg-sarong-black px-8 py-4 text-xs uppercase tracking-widest2 text-sarong-off transition-colors duration-300 hover:bg-sarong-red md:w-auto"
            >
              Comprar no Mercado Livre
              <ArrowUpRight size={16} />
            </a>
            <p className="mt-3 text-[11px] text-sarong-black/40">
              Você será redirecionado ao Mercado Livre para concluir a compra com segurança.
            </p>
          </div>
        </Container>
      </main>
      <Footer logoText={settings.logoText} contact={settings.contact} footer={settings.footer} />
    </>
  );
}
