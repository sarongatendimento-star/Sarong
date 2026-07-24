import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { updateCategory } from '@/lib/categories';
import { categoryUpdateSchema } from '@/lib/validation/categories';

// PATCH /api/categories/[id] — atualiza nome, ordem ou status
// (ativa/inativa) de uma categoria. Protegida por hasSession(), mesmo guard
// usado por /api/products, /api/settings e /api/collections. Slug nunca é
// editável por aqui (ver src/lib/categories.ts).
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const parsed = categoryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await updateCategory(id, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ category: result.category });
}
