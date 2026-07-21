import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { deleteProduct, updateProduct } from '@/lib/products';
import { productUpdateSchema } from '@/lib/validation/product';

// PATCH /api/products/:id — edita preco, descricao, tags, link do ML, etc.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updated = await updateProduct(params.id, parsed.data);

  if (!updated) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/products/:id — remove o produto
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const ok = await deleteProduct(params.id);
  if (!ok) {
    return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
