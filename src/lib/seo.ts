import type { Metadata } from 'next';
import type { Product } from '@/types/product';

// -----------------------------------------------------------------------------
// Helpers de SEO reutilizaveis: metatags padrao + Open Graph + JSON-LD.
// Centralizar aqui evita duplicar boilerplate de metadata em cada pagina.
// -----------------------------------------------------------------------------

const SITE_NAME = 'SARONG';
const SITE_URL = 'https://www.sarong.com.br';
const DEFAULT_DESCRIPTION =
  'SARONG — moda praia e vestidos autorais. Design premium, producao selecionada, entrega para todo o Brasil.';

export function buildMetadata(params: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}): Metadata {
  const { title, description = DEFAULT_DESCRIPTION, path = '', image } = params;
  const url = `${SITE_URL}${path}`;
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

// Gera o schema.org Product (rich snippet de preco/disponibilidade no Google)
export function buildProductJsonLd(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BRL',
      price: product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      url: product.mercadoLivreUrl,
    },
  };
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION };
