import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { Instagram } from 'lucide-react';

// -----------------------------------------------------------------------------
// Feed do Instagram — antes (V1.3): 6 imagens fixas no código (MOCK_POSTS),
// todas linkando para o mesmo instagramUrl genérico (sem integração real com
// a API do Instagram — isso continua fora do escopo aqui, ver histórico do
// arquivo). Agora: as imagens e o link de cada uma vêm de
// settings.instagramFeed (editável em /admin/dashboard/configuracoes), então
// o lojista escolhe as fotos e para onde cada uma aponta, sem depender de
// aprovação de app pela Meta.
// -----------------------------------------------------------------------------

interface InstagramPost {
  imageUrl: string;
  linkHref: string;
}

interface InstagramFeedProps {
  instagramUrl?: string;
  posts: InstagramPost[];
}

export default function InstagramFeed({ instagramUrl = 'https://instagram.com', posts }: InstagramFeedProps) {
  const visiblePosts = posts.filter((post) => post.imageUrl);

  if (visiblePosts.length === 0) return null;

  return (
    <section className="bg-sarong-off py-24">
      <Container>
        <SectionHeading eyebrow="@sarong" title="Siga no Instagram" align="center" />
        <div className="mt-12 grid grid-cols-3 gap-2 md:grid-cols-6">
          {visiblePosts.map((post, i) => (
            <a
              key={i}
              href={post.linkHref || instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden"
            >
              <img
                src={post.imageUrl}
                alt="Post do Instagram da SARONG"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-sarong-black/0 transition-colors group-hover:bg-sarong-black/30">
                <Instagram
                  className="text-sarong-off opacity-0 transition-opacity group-hover:opacity-100"
                  size={20}
                />
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
