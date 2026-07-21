import Button from '@/components/ui/Button';

interface SecondaryBannerProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

// Segundo grande momento editorial da Home, logo abaixo do Hero — mesma
// linguagem visual (imagem de fundo em tela cheia + texto sobreposto), só
// que mais baixo, para dar ritmo à página sem repetir o Hero.
//
// V1.3 (modo Preview): conteúdo 100% editável em
// /admin/dashboard/configuracoes ("Banner secundário").
export default function SecondaryBanner({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imageUrl,
}: SecondaryBannerProps) {
  return (
    <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden bg-sarong-black">
      <img
        src={imageUrl}
        alt={title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-sarong-black/50" />

      <div className="relative z-10 max-w-xl px-6 text-center">
        {eyebrow && (
          <p className="mb-4 text-xs uppercase tracking-widest2 text-sarong-off/80">{eyebrow}</p>
        )}
        {title && (
          <h2 className="font-sans text-3xl leading-tight tracking-tight text-sarong-off md:text-5xl">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-sarong-off/80">
            {subtitle}
          </p>
        )}
        {ctaLabel && (
          <div className="mt-8 flex justify-center">
            <Button href={ctaHref} variant="secondary">
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
