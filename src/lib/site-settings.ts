import 'server-only';
import { cache } from 'react';
import { readStore, writeStore, type WriteResult } from '@/lib/content-store';
import type { DeepPartial, SiteSettings } from '@/types/settings';

// -----------------------------------------------------------------------------
// Configurações editáveis do site (banners, logo, contato, rodapé) — modo
// PREVIEW: gravadas localmente via src/lib/content-store.ts (ver o aviso
// sobre persistência na Vercel naquele arquivo). Os valores padrão abaixo são
// EXATAMENTE o conteúdo que já estava fixo no código antes desta versão —
// então, sem nenhuma edição no painel, o site continua idêntico.
//
// Quando a V2 reconectar o Supabase, troque a implementação de
// getSiteSettings()/updateSiteSettings() para ler/escrever numa tabela
// `settings` (1 linha, mesmo padrão de supabase/schema.sql) — o tipo
// SiteSettings e todos os componentes que o consomem não precisam mudar.
// -----------------------------------------------------------------------------

const FILE_NAME = 'settings.json';

export const DEFAULT_SETTINGS: SiteSettings = {
  logoText: 'SARONG',

  heroBanner: {
    eyebrow: 'Coleção Verão',
    title: 'Vestir é uma forma de silêncio.',
    ctaLabel: 'Conheça a Coleção',
    ctaHref: '/produtos',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
  },

  secondaryBanner: {
    eyebrow: 'Edição limitada',
    title: 'Peças em pequenos lotes.',
    subtitle: 'Produção selecionada, pensada para durar — sem excesso, sem pressa.',
    ctaLabel: 'Ver produtos',
    ctaHref: '/produtos',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2000&auto=format&fit=crop',
  },

  about: {
    eyebrow: 'A marca',
    title: 'Sarong é o tecido que se enrola ao corpo.\nÉ também a nossa forma de vestir.',
    text:
      'Nascemos do gesto simples de envolver o corpo em um tecido. Produzimos peças em pequenos lotes, com atenção ao caimento, à matéria-prima e ao essencial. Sem ruído. Sem excesso.',
    imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1400&auto=format&fit=crop',
  },

  contact: {
    whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_URL || 'https://wa.me/5511999999999',
    phone: '',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contato@sarong.com.br',
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com/sarong',
    facebookUrl: '',
    pinterestUrl: '',
  },

  footer: {
    description:
      'Moda praia e vestidos autorais. Peças selecionadas, produção limitada, para quem veste com intenção.',
    copyrightText: 'SARONG. Vendas realizadas através do Mercado Livre.',
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepMerge<T>(base: T, patch: DeepPartial<T> | Partial<T> | undefined): T {
  if (!patch) return base;
  const result: any = Array.isArray(base) ? [...(base as any)] : { ...(base as any) };

  for (const key of Object.keys(patch)) {
    const patchValue = (patch as any)[key];
    const baseValue = (base as any)[key];
    if (isPlainObject(patchValue) && isPlainObject(baseValue)) {
      result[key] = deepMerge(baseValue, patchValue);
    } else if (patchValue !== undefined) {
      result[key] = patchValue;
    }
  }

  return result;
}

// `cache()` do React: dentro do mesmo request, várias páginas/componentes
// podem chamar getSiteSettings() sem repetir a leitura em disco.
export const getSiteSettings = cache((): SiteSettings => {
  const stored = readStore<Partial<SiteSettings>>(FILE_NAME, {});
  return deepMerge(DEFAULT_SETTINGS, stored);
});

export function updateSiteSettings(
  patch: DeepPartial<SiteSettings>
): WriteResult & { settings: SiteSettings } {
  const current = deepMerge(DEFAULT_SETTINGS, readStore<Partial<SiteSettings>>(FILE_NAME, {}));
  const merged = deepMerge(current, patch);
  const result = writeStore(FILE_NAME, merged);
  return { ...result, settings: merged };
}
