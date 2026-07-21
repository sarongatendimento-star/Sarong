'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Product } from '@/types/product';
import Badge from '@/components/ui/Badge';
import { ArrowUpRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';

// Card de produto: a foto é a protagonista, o texto é minimo.
// O clique no card leva a pagina de produto; o botao "Comprar" vai direto
// para o Mercado Livre em nova aba, sem passar pela pagina de produto.
export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.65, 0, 0.35, 1] }}
      className="group"
    >
      <Link href={`/produtos/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-sarong-beige/40">
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
          {product.tags.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {product.tags.map((tag) => (
                <Badge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <Link href={`/produtos/${product.slug}`}>
            <h3 className="text-sm text-sarong-black">{product.name}</h3>
          </Link>
          <div className="mt-1 flex items-center gap-2">
            {product.oldPrice && (
              <span className="text-xs text-sarong-black/40 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-sm text-sarong-black">{formatPrice(product.price)}</span>
          </div>
        </div>
      </div>

      <a
        href={product.mercadoLivreUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-between border-t border-sarong-black/10 pt-3 text-[11px] uppercase tracking-widest2 text-sarong-black transition-colors duration-300 hover:text-sarong-red"
      >
        Comprar no Mercado Livre
        <ArrowUpRight size={14} />
      </a>
    </motion.div>
  );
}
