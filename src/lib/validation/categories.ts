import { z } from 'zod';

// Atualização de categoria existente — slug NUNCA faz parte daqui (ver
// comentário em src/lib/categories.ts sobre por que ele é fixo).
export const categoryUpdateSchema = z
  .object({
    name: z.string().min(1, 'Informe um nome').max(80).optional(),
    comingSoon: z.boolean().optional(),
    displayOrder: z.number().int().min(0).max(999).optional(),
    active: z.boolean().optional(),
  })
  .partial();

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

// Criação de categoria nova — só o nome é obrigatório; o slug é gerado
// automaticamente a partir dele em src/lib/categories.ts.
export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'Informe um nome').max(80),
  displayOrder: z.number().int().min(0).max(999).optional(),
});

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
