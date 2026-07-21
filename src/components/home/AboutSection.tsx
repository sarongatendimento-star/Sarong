import Container from '@/components/ui/Container';
import FabricUnderline from '@/components/ui/FabricUnderline';

interface AboutSectionProps {
  eyebrow: string;
  title: string;
  text: string;
  imageUrl: string;
}

// Secao "Sobre a SARONG" — texto curto, editorial, sem excesso.
//
// V1.3 (modo Preview): conteúdo vem de src/lib/site-settings.ts, editável em
// /admin/dashboard/configuracoes — o visual não mudou.
export default function AboutSection({ eyebrow, title, text, imageUrl }: AboutSectionProps) {
  return (
    <section id="sobre" className="bg-sarong-off py-24 md:py-32">
      <Container className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div className="order-2 md:order-1">
          {eyebrow && <p className="mb-3 text-xs uppercase tracking-widest2 text-sarong-red">{eyebrow}</p>}
          <h2 className="whitespace-pre-line font-sans text-3xl leading-tight tracking-tight text-sarong-black md:text-4xl">
            {title}
          </h2>
          <FabricUnderline className="mt-6 w-16" color="#1C1C1C" />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-sarong-black/70">{text}</p>
        </div>
        <div className="order-1 aspect-[4/5] w-full overflow-hidden md:order-2">
          <img
            src={imageUrl}
            alt="Detalhe de tecido da coleção SARONG"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
