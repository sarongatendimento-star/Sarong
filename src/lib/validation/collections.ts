import { z } from 'zod';

// Validação do PATCH de uma coleção (nome, imagem, link, ativa/inativa).
// URLs de imagem aceitam data URI base64 também (upload no modo Preview) —
// mesmo motivo de src/lib/validation/settings.ts.
export const collectionUpdateSchema = z
  .object({
    name: z.string().min(1, 'Informe um nome').max(80).optional(),
    imageUrl: z.string().min(1, 'Informe uma URL de imagem válida').optional(),
    linkHref: z.string().max(300).optional(),
    active: z.boolean().optional(),
  })
  .partial();

export type CollectionUpdateInput = z.infer<typeof collectionUpdateSchema>;
