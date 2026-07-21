import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { Instagram } from 'lucide-react';

// -----------------------------------------------------------------------------
// Feed do Instagram.
//
// Por padrao, o Instagram Graph API exige um app aprovado pela Meta e um
// token de acesso de longa duracao — nao e algo que deva ficar hardcoded no
// codigo. Este componente ja vem PRONTO para a integracao futura: basta criar
// uma rota `src/app/api/instagram/route.ts` que busque os posts com o token
// (guardado em variavel de ambiente) e trocar o array MOCK_POSTS abaixo por
// dados vindos dessa rota via fetch/revalidate.
// -----------------------------------------------------------------------------

const MOCK_POSTS = [
  'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570976447640-ac859083963e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533561797500-4fad4750814e?q=80&w=800&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521205624015-1c3ea6774dfd?q=80&w=800&auto=format&fit=crop',
];

interface InstagramFeedProps {
  instagramUrl?: string;
}

export default function InstagramFeed({ instagramUrl = 'https://instagram.com' }: InstagramFeedProps) {
  return (
    <section className="bg-sarong-off py-24">
      <Container>
        <SectionHeading eyebrow="@sarong" title="Siga no Instagram" align="center" />
        <div className="mt-12 grid grid-cols-3 gap-2 md:grid-cols-6">
          {MOCK_POSTS.map((src, i) => (
            <a
              key={i}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <img src={src} alt="Post do Instagram da SARONG" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 flex items-center justify-center bg-sarong-black/0 transition-colors group-hover:bg-sarong-black/30">
                <Instagram className="text-sarong-off opacity-0 transition-opacity group-hover:opacity-100" size={20} />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
