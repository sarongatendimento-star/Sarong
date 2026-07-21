'use client';

import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface HeroProps {
  eyebrow: string;
  title: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
}

// Hero em tela cheia com imagem editorial e um unico CTA — a primeira
// impressao precisa comunicar sofisticacao sem nenhum ruido visual.
//
// V1.3 (modo Preview): conteúdo vem de src/lib/site-settings.ts, editável em
// /admin/dashboard/configuracoes — o visual e as animações não mudaram.
export default function Hero({ eyebrow, title, ctaLabel, ctaHref, imageUrl }: HeroProps) {
  return (
    <section className="relative flex h-[100svh] w-full items-end overflow-hidden bg-sarong-black">
      <motion.img
        src={imageUrl}
        alt="Editorial SARONG — modelo vestindo peça da coleção verão à beira-mar"
        initial={{ scale: 1.08, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sarong-black/70 via-sarong-black/10 to-transparent" />

      <div className="relative z-10 w-full px-6 pb-16 md:px-10 md:pb-24 lg:px-16">
        {eyebrow && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mb-4 text-xs uppercase tracking-widest2 text-sarong-off/80"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.9 }}
          className="max-w-2xl font-sans text-4xl leading-[1.1] tracking-tight text-sarong-off md:text-6xl"
        >
          {title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8"
        >
          <Button href={ctaHref} variant="secondary">
            {ctaLabel}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
