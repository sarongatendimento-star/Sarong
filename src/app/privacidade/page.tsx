import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Container from '@/components/ui/Container';
import { buildMetadata } from '@/lib/seo';
import { getAllCategories } from '@/lib/categories';
import { getSiteSettings } from '@/lib/site-settings';

export const revalidate = 0;

export const metadata: Metadata = buildMetadata({
  title: 'Política de Privacidade',
  path: '/privacidade',
});

export default async function PrivacidadePage() {
  const categories = await getAllCategories();
  const settings = await getSiteSettings();

  return (
    <>
      <Header categories={categories} logoText={settings.logoText} />
      <main className="pt-32 pb-24">
        <Container className="max-w-3xl">
          <h1 className="font-sans text-3xl tracking-tight text-sarong-black">
            Política de Privacidade
          </h1>
          <div className="mt-8 space-y-6 text-sm leading-relaxed text-sarong-black/70">
            <p>
              A SARONG é um site institucional/vitrine. Não processamos pagamentos
              nem armazenamos dados de cartão: toda compra é concluída diretamente
              no Mercado Livre, sujeita à política de privacidade daquela plataforma.
            </p>
            <p>
              Coletamos apenas dados de navegação anônimos para fins de análise de
              audiência (ex.: páginas mais visitadas), sem finalidade de venda a
              terceiros.
            </p>
            <p>
              Em caso de dúvidas sobre este documento, entre em contato através dos
              canais listados no rodapé do site.
            </p>
          </div>
        </Container>
      </main>
      <Footer logoText={settings.logoText} contact={settings.contact} footer={settings.footer} />
    </>
  );
}
