import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/categories';
import { hasSession } from '@/lib/auth';
import { categoryCreateSchema } from '@/lib/validation/categories';

// GET /api/categories — leitura pública (mesma policy de RLS da vitrine).
// Consumida pelo dashboard admin para popular o <select> de categoria do
// formulário de produto, em vez do array fixo que existia antes da V1.1.
export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}

// POST /api/categories — cria uma categoria nova. Protegida por hasSession(),
// mesmo guard usado por /api/products, /api/settings e /api/collections.
export async function POST(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = categoryCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await createCategory(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ category: result.category }, { status: 201 });
}
