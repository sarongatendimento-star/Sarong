-- =============================================================================
-- SARONG — Schema Supabase (ETAPA 1)
-- =============================================================================
-- Como aplicar:
--   1. Abra o projeto no https://supabase.com/dashboard
--   2. Vá em SQL Editor -> New query
--   3. Cole todo este arquivo e clique em "Run"
--   4. Em seguida rode supabase/seed.sql (dados iniciais)
--
-- Este arquivo é idempotente: pode ser executado novamente sem duplicar nada
-- (usa "if not exists" / "or replace" em tudo que for possível).
-- =============================================================================

create extension if not exists "pgcrypto"; -- necessário para gen_random_uuid()

-- -----------------------------------------------------------------------------
-- Função utilitária: mantém "updated_at" sempre atualizado em qualquer UPDATE
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -----------------------------------------------------------------------------
-- CATEGORIAS
-- (Vestidos, Cangas, Moda Praia, Lançamentos, ...)
-- -----------------------------------------------------------------------------
create table if not exists categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  image_url    text,
  display_order int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- COLEÇÕES
-- (Verão, Inverno, Moda Praia, Vestidos, Cangas, Promoções, ...)
-- Diferente de categoria: uma coleção é uma "curadoria" temporária/temática,
-- uma categoria é a classificação estrutural do produto.
-- -----------------------------------------------------------------------------
create table if not exists collections (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  description  text,
  image_url    text,
  display_order int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_collections_updated_at on collections;
create trigger trg_collections_updated_at
  before update on collections
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- PRODUTOS
-- -----------------------------------------------------------------------------
create table if not exists products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_description  text,
  description        text,
  features           text[] not null default '{}',
  price              numeric(10,2) not null default 0,
  old_price          numeric(10,2),
  category_id        uuid references categories(id) on delete set null,
  collection_id      uuid references collections(id) on delete set null,
  images             text[] not null default '{}',
  mercado_livre_url  text not null,
  featured           boolean not null default false,
  is_new             boolean not null default false,
  is_promo           boolean not null default false,
  is_bestseller      boolean not null default false,
  active             boolean not null default true,
  display_order      int not null default 0,
  stock              int,
  sku                text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_products_category   on products(category_id);
create index if not exists idx_products_collection  on products(collection_id);
create index if not exists idx_products_active      on products(active);
create index if not exists idx_products_featured    on products(featured);
create index if not exists idx_products_slug        on products(slug);

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- BANNERS
-- (usados na Home — hero e banners secundários; a tela de edição vem na ETAPA 9,
-- mas a tabela já nasce pronta agora, conforme pedido)
-- -----------------------------------------------------------------------------
create table if not exists banners (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subtitle      text,
  image_url     text,
  button_label  text,
  button_link   text,
  display_order int not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_banners_updated_at on banners;
create trigger trg_banners_updated_at
  before update on banners
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- CONFIGURAÇÕES
-- Tabela de linha única (singleton) com os dados institucionais do site.
-- A UI de edição vem na ETAPA 10; a tabela já nasce agora.
-- -----------------------------------------------------------------------------
create table if not exists settings (
  id            int primary key default 1,
  whatsapp_url  text,
  instagram_url text,
  facebook_url  text,
  pinterest_url text,
  tiktok_url    text,
  contact_email text,
  logo_url      text,
  favicon_url   text,
  footer_text   text,
  seo_title       text,
  seo_description text,
  seo_keywords    text,
  og_image_url    text,
  updated_at    timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

drop trigger if exists trg_settings_updated_at on settings;
create trigger trg_settings_updated_at
  before update on settings
  for each row execute function set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
--
-- Estratégia para a ETAPA 1 (ainda sem Supabase Auth, que só entra na ETAPA 2):
--   - Leitura pública: qualquer visitante do site pode ler categorias,
--     coleções, produtos ativos, banners ativos e settings (necessário para
--     a vitrine funcionar sem login).
--   - Escrita: bloqueada para o público. Só a service_role key (usada
--     exclusivamente no servidor, dentro das rotas /api/* já protegidas por
--     hasSession()) pode escrever. A service_role ignora RLS por padrão no
--     Supabase, então nenhuma policy de escrita é necessária aqui.
-- Quando a ETAPA 2 trocar a autenticação para Supabase Auth, estas policies
-- serão revisadas para exigir auth.role() = 'authenticated' nas escritas
-- feitas diretamente do cliente (se algum dia isso passar a acontecer).
-- =============================================================================

alter table categories  enable row level security;
alter table collections enable row level security;
alter table products    enable row level security;
alter table banners     enable row level security;
alter table settings    enable row level security;

drop policy if exists "Categorias visíveis publicamente" on categories;
create policy "Categorias visíveis publicamente"
  on categories for select
  using (active = true);

drop policy if exists "Coleções visíveis publicamente" on collections;
create policy "Coleções visíveis publicamente"
  on collections for select
  using (active = true);

drop policy if exists "Produtos ativos visíveis publicamente" on products;
create policy "Produtos ativos visíveis publicamente"
  on products for select
  using (active = true);

drop policy if exists "Banners ativos visíveis publicamente" on banners;
create policy "Banners ativos visíveis publicamente"
  on banners for select
  using (active = true);

drop policy if exists "Settings visíveis publicamente" on settings;
create policy "Settings visíveis publicamente"
  on settings for select
  using (true);
