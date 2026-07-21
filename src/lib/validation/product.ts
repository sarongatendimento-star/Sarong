import { z } from 'zod';

// -----------------------------------------------------------------------------
// Validação de produto (V1.1).
//
// Um único schema alimenta tanto a criação quanto a atualização, e foi escrito
// para ser reaproveitado futuramente no formulário do admin (ETAPA 5) sem
// duplicar regra nenhuma — basta importar o mesmo arquivo no cliente.
// -----------------------------------------------------------------------------

export const productTagSchema = z.enum(['novo', 'promocao', 'mais-vendido', 'lancamento']);

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const productBaseSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(120)
    .regex(slugPattern, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(2, 'Nome muito curto').max(120, 'Nome muito longo'),
  shortDescription: z.string().max(300).optional().default(''),
  description: z.string().max(3000).optional().default(''),
  features: z.array(z.string().max(200)).optional().default([]),
  price: z.number({ invalid_type_error: 'Preço deve ser um número' }).nonnegative('Preço não pode ser negativo'),
  oldPrice: z.number().nonnegative('Preço antigo não pode ser negativo').optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  collectionSlug: z.string().optional(),
  tags: z.array(productTagSchema).optional().default([]),
  images: z.array(z.string().url('URL de imagem inválida')).optional().default([]),
  mercadoLivreUrl: z.string().url('Link do Mercado Livre inválido'),
  featured: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  stock: z.number().int().nonnegative().optional(),
  sku: z.string().max(60).optional(),
  displayOrder: z.number().int().optional(),
});

// Criação: exige todos os campos obrigatórios de um produto novo, e valida
// que o preço promocional (se houver) faça sentido em relação ao preço atual.
export const productCreateSchema = productBaseSchema.refine(
  (data) => !data.oldPrice || data.oldPrice > data.price,
  { message: 'Preço antigo deve ser maior que o preço atual', path: ['oldPrice'] }
);

// Atualização (PATCH): todos os campos são opcionais, já que o admin edita
// um campo por vez direto na tabela do dashboard.
export const productUpdateSchema = productBaseSchema.partial();

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

// Query params de listagem paginada (?page=&pageSize=)
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(12),
});
