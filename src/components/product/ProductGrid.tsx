import type { Product } from '@/types/product';
import ProductCard from './ProductCard';

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-24 text-center text-sm uppercase tracking-widest2 text-sarong-black/50">
        Nenhuma peça encontrada nesta categoria.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
