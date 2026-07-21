import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/products';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const productUrls = products.map((p) => ({
    url: `${SITE_URL}/produtos/${p.slug}`,
    lastModified: p.createdAt,
  }));

  return [
    { url: SITE_URL, lastModified: new Date() },
    { url: `${SITE_URL}/produtos`, lastModified: new Date() },
    { url: `${SITE_URL}/privacidade`, lastModified: new Date() },
    ...productUrls,
  ];
}
