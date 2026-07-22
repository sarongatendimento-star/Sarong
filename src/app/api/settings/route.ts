import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { getSiteSettings, updateSiteSettings } from '@/lib/site-settings';
import { settingsUpdateSchema } from '@/lib/validation/settings';

// GET /api/settings — leitura pública (o painel usa para pré-carregar o
// formulário; a vitrine em si lê direto via getSiteSettings() no servidor).
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

// PATCH /api/settings — atualiza banners, logo, contato e rodapé.
// Protegida por hasSession() — mesmo guard usado por /api/products.
export async function PATCH(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Dados inválidos.', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const result = await updateSiteSettings(parsed.data);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error || 'Não foi possível salvar as configurações.', settings: result.settings },
      { status: 500 }
    );
  }

  return NextResponse.json({ settings: result.settings, ephemeral: result.ephemeral });
}
