import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { createProduct, getAllProductsAdmin } from '@/lib/products';
import { productCreateSchema, paginationQuerySchema } from '@/lib/validation/product';
import type { Product } from '@/types/product';

// GET /api/products?page=&pageSize= — lista paginada (uso interno do admin)
export async function GET(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const query = paginationQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  if (!query.success) {
    return NextResponse.json({ error: 'Parâmetros de paginação inválidos.' }, { status: 400 });
  }

  const result = await getAllProductsAdmin(query.data);
  return NextResponse.json(result);
}

// POST /api/products — cria um novo produto
export async function POST(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const product: Product = {
    ...parsed.data,
    id: parsed.data.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const created = await createProduct(product);
  return NextResponse.json(created, { status: 201 });
}
