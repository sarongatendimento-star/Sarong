-- =============================================================================
-- SARONG — Seed inicial (ETAPA 1)
-- Rode DEPOIS de supabase/schema.sql, uma única vez.
-- Migra para o Supabase os mesmos dados que hoje vivem em
-- src/data/products.json, para que o site continue mostrando os mesmos
-- produtos assim que a troca de motor de dados entrar em produção.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Categorias (as mesmas 4 já usadas nos filtros e no menu do site)
-- -----------------------------------------------------------------------------
insert into categories (name, slug, display_order) values
  ('Vestidos',    'vestidos',    1),
  ('Cangas',      'cangas',      2),
  ('Moda Praia',  'moda-praia',  3),
  ('Lançamentos', 'lancamentos', 4)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Coleções (exemplo inicial — editáveis depois pela tela de Coleções, ETAPA 8)
-- -----------------------------------------------------------------------------
insert into collections (name, slug, display_order) values
  ('Verão',      'verao',       1),
  ('Inverno',    'inverno',     2),
  ('Moda Praia', 'moda-praia',  3),
  ('Vestidos',   'vestidos',    4),
  ('Cangas',     'cangas',      5),
  ('Promoções',  'promocoes',   6)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Settings (linha única, com os mesmos valores padrão que hoje estão no
-- .env.example / componentes Footer e InstagramFeed)
-- -----------------------------------------------------------------------------
insert into settings (id, whatsapp_url, instagram_url, contact_email, footer_text)
values (
  1,
  'https://wa.me/5511999999999',
  'https://instagram.com/sarong',
  'contato@sarong.com.br',
  '© SARONG. Vendas realizadas através do Mercado Livre.'
)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Produtos (os 6 produtos de exemplo que estavam em src/data/products.json)
-- -----------------------------------------------------------------------------
insert into products (
  slug, name, short_description, description, features, price, old_price,
  category_id, images, mercado_livre_url, featured, is_new, is_promo,
  is_bestseller, active, created_at
)
select
  v.slug, v.name, v.short_description, v.description, v.features, v.price, v.old_price,
  c.id, v.images, v.mercado_livre_url, v.featured, v.is_new, v.is_promo,
  v.is_bestseller, true, v.created_at
from (values
  (
    'canga-litoral-terracota',
    'Canga Litoral Terracota',
    'Algodão leve com estampa exclusiva em tons terrosos.',
    'Uma canga pensada para o verão brasileiro: tecido 100% algodão, caimento fluido e uma estampa exclusiva desenvolvida pelo ateliê SARONG. Peça versátil que acompanha da praia ao fim de tarde.',
    array['100% algodão','140cm x 110cm','Estampa exclusiva SARONG','Acabamento em barra dupla'],
    189.90, 229.90, 'cangas',
    array['https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=1600&auto=format&fit=crop','https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', true, false, true, true, timestamptz '2026-06-01'
  ),
  (
    'vestido-longo-areia',
    'Vestido Longo Areia',
    'Vestido fluido em viscose, alfaiataria leve para o verão.',
    'Vestido longo em viscose com caimento solto e fluido, pensado para dias quentes. Alças ajustáveis e fenda discreta lateral. Uma peça autoral, atemporal.',
    array['Viscose premium','Alças ajustáveis','Fenda lateral discreta','Modelagem solta'],
    349.90, null, 'vestidos',
    array['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1600&auto=format&fit=crop','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', true, true, false, false, timestamptz '2026-06-10'
  ),
  (
    'biquini-off-white-minimal',
    'Biquíni Off White Minimal',
    'Recorte minimalista, tecido de secagem rápida.',
    'Biquíni de recorte minimalista em tecido técnico de secagem rápida e alta durabilidade. Design atemporal que dialoga com o essencial da marca SARONG.',
    array['Tecido técnico UV50+','Secagem rápida','Forração dupla','Bojo removível'],
    219.90, null, 'moda-praia',
    array['https://images.unsplash.com/photo-1570976447640-ac859083963e?q=80&w=1600&auto=format&fit=crop','https://images.unsplash.com/photo-1544552866-d3ed42536cfd?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', true, true, false, false, timestamptz '2026-06-15'
  ),
  (
    'canga-horizonte-bege',
    'Canga Horizonte Bege',
    'Estampa listrada, tom bege sobre off white.',
    'Inspirada no horizonte do litoral, esta canga traz listras sutis em bege sobre uma base off white. Tecido leve, ideal para compor looks de praia e viagem.',
    array['100% algodão','150cm x 110cm','Fio penteado'],
    179.90, null, 'cangas',
    array['https://images.unsplash.com/photo-1533561797500-4fad4750814e?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', false, false, false, false, timestamptz '2026-06-20'
  ),
  (
    'vestido-curto-preto-essencial',
    'Vestido Curto Preto Essencial',
    'Peça coringa, alfaiataria minimal em preto.',
    'O vestido essencial da coleção: corte reto, tecido estruturado e caimento impecável. Uma peça coringa para qualquer ocasião.',
    array['Tecido estruturado','Forração completa','Zíper invisível'],
    299.90, null, 'vestidos',
    array['https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', false, false, false, true, timestamptz '2026-05-20'
  ),
  (
    'maio-costa-vermelho-queimado',
    'Maio Costas Abertas Vermelho Queimado',
    'Maio decote costas, detalhe em vermelho queimado.',
    'Maio de costas abertas com recorte que valoriza a silhueta. Detalhe exclusivo em vermelho queimado, cor de assinatura da coleção.',
    array['Tecido técnico','Costas abertas','Forração dupla'],
    259.90, 299.90, 'moda-praia',
    array['https://images.unsplash.com/photo-1521205624015-1c3ea6774dfd?q=80&w=1600&auto=format&fit=crop'],
    'https://www.mercadolivre.com.br/', false, false, true, false, timestamptz '2026-06-25'
  )
) as v(slug, name, short_description, description, features, price, old_price, category_slug, images, mercado_livre_url, featured, is_new, is_promo, is_bestseller, created_at)
join categories c on c.slug = v.category_slug
on conflict (slug) do nothing;
