import { z } from 'zod';

// -----------------------------------------------------------------------------
// Validação das configurações do site (banners, logo, contato, rodapé).
// Todos os campos são opcionais porque o PATCH salva só o que o admin mudou
// naquela seção do formulário (ver src/components/admin/SettingsForm.tsx).
//
// URLs de imagem aceitam tanto links normais (https://...) quanto data URIs
// em base64 (data:image/...;base64,...), que é o formato devolvido pelo
// upload local no modo Preview (ver src/app/api/upload/route.ts) — por isso
// a validação é permissiva (string não vazia) em vez de usar z.string().url().
// -----------------------------------------------------------------------------

const imageUrlSchema = z.string().min(1, 'Informe uma URL de imagem válida');
const urlOrEmptySchema = z.string().url('URL inválida').or(z.literal(''));

export const settingsUpdateSchema = z.object({
  logoText: z.string().min(1).max(40).optional(),

  heroBanner: z
    .object({
      eyebrow: z.string().max(80).optional(),
      title: z.string().min(1).max(200).optional(),
      ctaLabel: z.string().max(60).optional(),
      ctaHref: z.string().min(1).max(300).optional(),
      imageUrl: imageUrlSchema.optional(),
    })
    .partial()
    .optional(),

  secondaryBanner: z
    .object({
      eyebrow: z.string().max(80).optional(),
      title: z.string().max(200).optional(),
      subtitle: z.string().max(300).optional(),
      ctaLabel: z.string().max(60).optional(),
      ctaHref: z.string().min(1).max(300).optional(),
      imageUrl: imageUrlSchema.optional(),
    })
    .partial()
    .optional(),

  about: z
    .object({
      eyebrow: z.string().max(80).optional(),
      title: z.string().max(300).optional(),
      text: z.string().max(1000).optional(),
      imageUrl: imageUrlSchema.optional(),
    })
    .partial()
    .optional(),

  contact: z
    .object({
      whatsappUrl: urlOrEmptySchema.optional(),
      phone: z.string().max(40).optional(),
      email: z.string().email('E-mail inválido').or(z.literal('')).optional(),
      instagramUrl: urlOrEmptySchema.optional(),
      facebookUrl: urlOrEmptySchema.optional(),
      pinterestUrl: urlOrEmptySchema.optional(),
    })
    .partial()
    .optional(),

  footer: z
    .object({
      description: z.string().max(400).optional(),
      copyrightText: z.string().max(200).optional(),
    })
    .partial()
    .optional(),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
