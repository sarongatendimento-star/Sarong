-- =============================================================================
-- SARONG — Storage (V1.1)
-- Rode no SQL Editor do Supabase, depois de schema.sql e seed.sql.
-- =============================================================================

-- Bucket público: imagens de produto são conteúdo de vitrine, feito para
-- serem vistas por qualquer visitante (e por crawlers do Google/redes
-- sociais) — não há motivo para exigir autenticação para ler uma foto de
-- produto. Ver relatório técnico (V1.1, decisão de arquitetura) para o
-- comparativo com bucket privado + signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB por arquivo
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Leitura pública explícita (redundante com bucket público=true, mas deixa a
-- intenção documentada e serve de base caso o bucket precise virar privado
-- no futuro sem perder a policy de leitura).
drop policy if exists "Leitura pública de imagens de produto" on storage.objects;
create policy "Leitura pública de imagens de produto"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Escrita: nenhuma policy de INSERT/UPDATE/DELETE é necessária aqui porque o
-- upload é feito exclusivamente pela rota /api/upload usando a service_role
-- key (src/lib/supabase/admin.ts), que ignora RLS por definição.
