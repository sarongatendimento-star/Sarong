import 'server-only';
import { cache } from 'react';
import { supabasePublic } from '@/lib/supabase/public';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IS_SUPABASE_CONFIGURED, IS_SUPABASE_ADMIN_CONFIGURED } from '@/lib/supabase/config';
import { readStore, writeStore, type WriteResult } from '@/lib/content-store';
import type { DeepPartial, SiteSettings } from '@/types/settings';

// -----------------------------------------------------------------------------
// Configurações editáveis do site (banners, logo, contato, rodapé) — mesmo
// padrão de src/lib/products.ts e src/lib/categories.ts: quando o Supabase
// está configurado, lê/grava na tabela `settings` (linha única, id = 1,
// coluna `content` em jsonb com o objeto SiteSettings inteiro). Sem Supabase
// configurado (MODO PREVIEW), continua gravando localmente via
// src/lib/content-store.ts, exatamente como antes.
//
// Os valores padrão abaixo (DEFAULT_SETTINGS) continuam sendo a base do
// deepMerge em ambos os modos — servem tanto de fallback quanto de "primeira
// carga" antes de qualquer edição no painel.
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

  // Antes (V1.3): 6 imagens fixas no código (MOCK_POSTS em InstagramFeed.tsx),
  // todas linkando para o mesmo instagramUrl genérico. Agora: editável pelo
  // painel — cada post tem sua própria imagem e, opcionalmente, seu próprio
  // link (post individual do Instagram); link vazio cai no instagramUrl geral
  // (contact.instagramUrl), igual ao comportamento antigo.
  instagramFeed: [
    { imageUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=800&auto=format&fit=crop', linkHref: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1570976447640-ac859083963e?q=80&w=800&auto=format&fit=crop', linkHref: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop', linkHref: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', linkHref: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1533561797500-4fad4750814e?q=80&w=800&auto=format&fit=crop', linkHref: '' },
    { imageUrl: 'https://images.unsplash.com/photo-1521205624015-1c3ea6774dfd?q=80&w=800&auto=format&fit=crop', linkHref: '' },
  ],
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

// Formato da linha na tabela `settings`: id fixo (1) + o objeto inteiro numa
// coluna jsonb. As colunas antigas (whatsapp_url, logo_url etc., do schema
// original) ficam paradas na tabela sem uso — não fazem mal, só não são mais
// a fonte de dados.
interface SettingsRow {
  content: Partial<SiteSettings> | null;
}

// `cache()` do React: dentro do MESMO request, várias páginas/componentes
// podem chamar getSiteSettings() sem repetir a consulta ao banco (ou a
// leitura em disco, no modo Preview).
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!IS_SUPABASE_CONFIGURED || !supabasePublic) {
    const stored = readStore<Partial<SiteSettings>>(FILE_NAME, {});
    return deepMerge(DEFAULT_SETTINGS, stored);
  }

  const { data, error } = await supabasePublic
    .from('settings')
    .select('content')
    .eq('id', 1)
    .maybeSingle<SettingsRow>();

  if (error) throw new Error(`Erro ao buscar configurações: ${error.message}`);
  return deepMerge(DEFAULT_SETTINGS, data?.content ?? {});
});

export async function updateSiteSettings(
  patch: DeepPartial<SiteSettings>
): Promise<WriteResult & { settings: SiteSettings }> {
  if (!IS_SUPABASE_ADMIN_CONFIGURED || !supabaseAdmin) {
    const current = deepMerge(DEFAULT_SETTINGS, readStore<Partial<SiteSettings>>(FILE_NAME, {}));
    const merged = deepMerge(current, patch);
    const result = writeStore(FILE_NAME, merged);
    return { ...result, settings: merged };
  }

  const { data: currentRow, error: fetchError } = await supabaseAdmin
    .from('settings')
    .select('content')
    .eq('id', 1)
    .maybeSingle<SettingsRow>();

  if (fetchError) {
    return { ok: false, ephemeral: false, error: fetchError.message, settings: DEFAULT_SETTINGS };
  }

  const current = deepMerge(DEFAULT_SETTINGS, currentRow?.content ?? {});
  const merged = deepMerge(current, patch);

  const { error: upsertError } = await supabaseAdmin
    .from('settings')
    .upsert({ id: 1, content: merged }, { onConflict: 'id' });

  if (upsertError) {
    return { ok: false, ephemeral: false, error: upsertError.message, settings: merged };
  }

  return { ok: true, ephemeral: false, settings: merged };
}
