import { NextRequest, NextResponse } from 'next/server';
import { hasSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { IS_SUPABASE_ADMIN_CONFIGURED } from '@/lib/supabase/config';

// -----------------------------------------------------------------------------
// Upload de imagens (produtos e, agora, banners/configurações do site).
//
// V2 (Supabase configurado): envia para o bucket público "product-images" no
// Supabase Storage (ver supabase/storage.sql) e devolve a URL pública
// permanente — inalterado.
//
// MODO PREVIEW (sem Supabase): não há nenhum storage externo disponível, e
// gravar arquivos em disco não é confiável em ambiente serverless (Vercel) —
// ver o aviso em src/lib/content-store.ts. A solução que funciona em
// QUALQUER ambiente sem infraestrutura extra: converter a imagem para uma
// data URI em base64 e devolvê-la como se fosse a "url" — o navegador exibe
// normalmente, e o valor fica salvo dentro do próprio produto/configuração
// no content-store local. O limite de tamanho é bem menor que no modo
// Supabase (1MB) porque a Vercel limita o corpo de requisição/resposta de
// funções serverless a poucos megabytes, e essa mesma imagem viaja de novo
// dentro do payload ao salvar o produto/configuração.
//
// Alternativa sem esse limite: usar o campo "URL da imagem" (em vez de
// upload) para apontar direto para uma imagem já hospedada externamente.
//
// O contrato da rota não mudou: continua recebendo multipart/form-data com um
// campo "file" e devolvendo { url } — nenhuma mudança necessária em quem já
// consome esta rota (ImageGallery, SettingsForm).
// -----------------------------------------------------------------------------

const BUCKET = 'product-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES_SUPABASE = 5 * 1024 * 1024; // 5MB (vai para um storage de verdade)
const MAX_SIZE_BYTES_PREVIEW = 1 * 1024 * 1024; // 1MB (vira base64 dentro do JSON local)

export async function POST(request: NextRequest) {
  if (!(await hasSession())) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Formato inválido. Use JPG, PNG ou WEBP.' }, { status: 400 });
  }

  const usingSupabase = IS_SUPABASE_ADMIN_CONFIGURED && supabaseAdmin;
  const maxSize = usingSupabase ? MAX_SIZE_BYTES_SUPABASE : MAX_SIZE_BYTES_PREVIEW;

  if (file.size > maxSize) {
    const maxLabel = usingSupabase ? '5MB' : '1MB (versão Preview) — ou use o campo "URL da imagem"';
    return NextResponse.json({ error: `Arquivo muito grande. Máximo de ${maxLabel}.` }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (!usingSupabase) {
    const dataUri = `data:${file.type};base64,${bytes.toString('base64')}`;
    return NextResponse.json({ url: dataUri });
  }

  const extension = file.type.split('/')[1];
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  const { error } = await supabaseAdmin!.storage.from(BUCKET).upload(fileName, bytes, {
    contentType: file.type,
    cacheControl: '31536000', // 1 ano — imagens de produto não mudam de conteúdo, só de nome
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: `Erro ao enviar imagem: ${error.message}` }, { status: 500 });
  }

  const { data } = supabaseAdmin!.storage.from(BUCKET).getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
