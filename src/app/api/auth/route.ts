import { NextRequest, NextResponse } from 'next/server';
import { signIn, signOut } from '@/lib/auth';
import { loginSchema } from '@/lib/validation/auth';

// POST /api/auth — login do administrador (Supabase Auth)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.' },
      { status: 400 }
    );
  }

  const { error } = await signIn(parsed.data.email, parsed.data.password);
  if (error) {
    // Mensagem genérica de propósito: nunca revelar se o e-mail existe ou não.
    return NextResponse.json({ error: 'E-mail ou senha inválidos.' }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/auth — logout
export async function DELETE() {
  await signOut();
  return NextResponse.json({ ok: true });
}
