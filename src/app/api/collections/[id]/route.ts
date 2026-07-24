import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { updateCollection } from '@/lib/collections';
import { collectionUpdateSchema } from '@/lib/validation/collections';

// PATCH /api/collections/[id] — atualiza nome, imagem, link ou status
// (ativa/inativa) de uma coleção. Protegida por hasSession(), mesmo guard
// usado por /api/products e /api/settings.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const { id } = params;
  const body = await request.json().catch(() => null);
  const parsed = collectionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await updateCollection(id, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ collection: result.collection });
}
