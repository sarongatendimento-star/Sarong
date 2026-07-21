import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import ProductGrid from '@/components/product/ProductGrid';
import { getFeaturedProducts } from '@/lib/products';

// Server Component: le os destaques direto do JSON no servidor (sem loading
// state no cliente, melhor performance e SEO).
export default async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  return (
    <section className="bg-sarong-off py-24">
      <Container>
        <SectionHeading eyebrow="Seleção" title="Nossos Destaques" />
        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
        <div className="mt-14 flex justify-center">
          <Button href="/produtos" variant="ghost">
            Ver toda a coleção
          </Button>
        </div>
      </Container>
    </section>
  );
}
