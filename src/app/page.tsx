import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import SecondaryBanner from '@/components/home/SecondaryBanner';
import CollectionBanner from '@/components/home/CollectionBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import AboutSection from '@/components/home/AboutSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import InstagramFeed from '@/components/home/InstagramFeed';
import { getAllCategories } from '@/lib/categories';
import { getSiteSettings } from '@/lib/site-settings';

// Sem cache de página: produtos e configurações podem ser editados a
// qualquer momento pelo painel administrativo (modo Preview), então a Home
// sempre renderiza com os dados mais recentes.
export const revalidate = 0;

export default async function HomePage() {
  const categories = await getAllCategories();
  const settings = await getSiteSettings();

  return (
    <>
      <Header categories={categories} logoText={settings.logoText} />
      <main>
        <Hero
          eyebrow={settings.heroBanner.eyebrow}
          title={settings.heroBanner.title}
          ctaLabel={settings.heroBanner.ctaLabel}
          ctaHref={settings.heroBanner.ctaHref}
          imageUrl={settings.heroBanner.imageUrl}
        />
        <SecondaryBanner
          eyebrow={settings.secondaryBanner.eyebrow}
          title={settings.secondaryBanner.title}
          subtitle={settings.secondaryBanner.subtitle}
          ctaLabel={settings.secondaryBanner.ctaLabel}
          ctaHref={settings.secondaryBanner.ctaHref}
          imageUrl={settings.secondaryBanner.imageUrl}
        />
        <CollectionBanner />
        <FeaturedProducts />
        <AboutSection
          eyebrow={settings.about.eyebrow}
          title={settings.about.title}
          text={settings.about.text}
          imageUrl={settings.about.imageUrl}
        />
        <WhyChooseUs />
        <InstagramFeed instagramUrl={settings.contact.instagramUrl} posts={settings.instagramFeed} />
      </main>
      <Footer logoText={settings.logoText} contact={settings.contact} footer={settings.footer} />
    </>
  );
}
