# SARONG — Vitrine Premium

Site institucional/vitrine da marca SARONG. Não é um e-commerce: cada produto
exibido aqui redireciona, ao clicar em "Comprar", para o anúncio
correspondente no Mercado Livre.

## Modo Preview (V1, sem Supabase)

O projeto **roda e compila sem nenhuma variável de ambiente configurada**.
Enquanto `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` não
estiverem definidas na Vercel:

- A vitrine (home, `/produtos`, página de produto) lê o catálogo de
  `src/data/products.ts`, `src/data/categories.ts` e `src/data/collections.ts`
  como **semente inicial** — assim que o painel administrativo cria/edita/
  exclui um produto, o site passa a exibir a versão editada (guardada
  separadamente, sem tocar nos arquivos de semente).
- O botão "Comprar" continua indo para `mercadoLivreUrl` de cada produto.
- **O painel administrativo (`/admin`) está ativo**, com login local (sem
  Supabase) e edição real de produtos e das configurações do site. Veja a
  seção seguinte.

**Nada da estrutura do Supabase foi removida.** Assim que
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`SUPABASE_SERVICE_ROLE_KEY` forem configuradas na Vercel (Project Settings →
Environment Variables) e o projeto for feito redeploy, o site volta
automaticamente a usar o Supabase para tudo — catálogo, login e painel —
sem precisar mudar nenhum código.

## Painel administrativo no modo Preview

Acesse `/admin` e entre com:

| Campo | Valor padrão |
|---|---|
| E-mail | `sarong.atendimento@gmail.com` |
| Senha | `Sarong@2026` |

Para usar credenciais diferentes, configure na Vercel (Project Settings →
Environment Variables) — não precisa mudar nenhum código:

```
ADMIN_EMAIL=seu-email@exemplo.com
ADMIN_PASSWORD=sua-senha
ADMIN_SESSION_SECRET=qualquer-string-longa-e-aleatoria
```

Dentro do painel (`/admin/dashboard`) dá para administrar:

- **Produtos** — criar, editar e excluir (`/admin/dashboard/produtos`).
  Upload de imagem local até 1MB por arquivo; para imagens maiores, cole a
  URL de uma imagem já hospedada externamente (mesmo campo aceita os dois).
- **Configurações do site** (`/admin/dashboard/configuracoes`) — banner
  principal, banner secundário, logo (texto), textos e imagem da seção
  "Sobre", WhatsApp, telefone, e-mail, Instagram, Facebook, Pinterest e
  rodapé.

### ⚠️ Sobre a persistência dos dados neste modo

Sem Supabase (ou qualquer banco de dados), as edições do painel são salvas em
arquivos JSON locais (`.sarong-data/`, fora do controle de versão — ver
`src/lib/content-store.ts`). Isso tem uma limitação importante **na Vercel**:

- Funções serverless da Vercel rodam num sistema de arquivos **somente
  leitura**, com exceção de `/tmp`, que é gravável mas **efêmero** — pode ser
  limpo a qualquer momento (novo deploy, nova instância, escala automática) e
  não é compartilhado entre instâncias simultâneas.
- Isso significa que, **na Vercel**, editar um produto ou uma configuração no
  painel funciona e aparece no site na hora — mas não há garantia de que essa
  edição sobreviva por muito tempo ou apareça igual para todo mundo.
- **Em desenvolvimento local** (`npm run dev`) ou em qualquer servidor com
  disco persistente (`npm run build && npm start` numa VPS, Railway, Render
  etc.), essa limitação não existe — os dados persistem normalmente.

**Para persistência garantida em produção na Vercel, reconecte o Supabase**
(seção seguinte) — nesse ponto, todo o painel passa a gravar direto no banco,
sem essa limitação, e sem precisar mudar nenhum código de tela.



## Stack

- Next.js 14 (App Router) + TypeScript
- TailwindCSS (paleta e tipografia da marca centralizadas em `tailwind.config.ts`)
- Framer Motion (transições e reveals)
- Lucide Icons
- Supabase (Postgres) como banco de dados

## Como rodar localmente

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor** do projeto, rode nesta ordem:
   - `supabase/schema.sql` (cria as tabelas: products, categories, collections, banners, settings)
   - `supabase/seed.sql` (popula categorias, coleções, settings e os produtos de exemplo)
   - `supabase/storage.sql` (cria o bucket público `product-images`)
3. Em **Authentication → Users**, clique em **Add user** e crie o e-mail/senha do administrador.
4. Em **Project Settings > API**, copie a `Project URL`, a `anon public key` e a `service_role key`.
5. Configure o projeto:

```bash
npm install
cp .env.example .env.local   # cole as chaves do Supabase
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura de pastas

```
src/
  app/                  Rotas (App Router)
    page.tsx            Home
    produtos/           Listagem (com filtro por categoria via querystring)
    produtos/[slug]/    Página de produto (SSG + revalidate 0)
    admin/              Login + dashboard do painel administrativo
      dashboard/configuracoes/  Formulário de configurações do site
    api/                Rotas de API (auth, products, upload, settings)
    privacidade/        Política de privacidade
    sitemap.ts          Sitemap dinâmico
    robots.ts           robots.txt dinâmico
  components/
    layout/             Header, Footer
    home/               Seções da home (Hero, Banner secundário, Destaques, Sobre, etc.)
    product/            Card, grid, galeria, filtros
    admin/               ProductForm, ImageGallery, SettingsForm, etc.
    ui/                 Button, Badge, Container, SectionHeading, FabricUnderline
  lib/
    products.ts         Camada de acesso a dados de produto (paginada)
    categories.ts       Camada de acesso a categorias (fonte única, V1.1)
    site-settings.ts    Configurações do site (banners, logo, contato, rodapé)
    content-store.ts    Persistência local em JSON (modo Preview — ver aviso no README)
    local-products-store.ts  Catálogo de produtos editável do modo Preview
    local-auth.ts       Login local (e-mail/senha + cookie assinado) do modo Preview
    supabase/
      public.ts          Cliente Supabase de leitura pública (anon key)
      admin.ts           Cliente Supabase administrativo (service role key)
      server.ts          Cliente Supabase vinculado à sessão do usuário (Auth)
    auth.ts             Autenticação do admin — Supabase Auth (V2) ou login local (Preview)
    seo.ts              Metadata, Open Graph e JSON-LD reutilizáveis
    validation/
      product.ts         Schemas Zod de produto (criação/atualização/paginação)
      auth.ts             Schema Zod de login
      settings.ts          Schema Zod das configurações do site
  types/
    product.ts           Tipagem central de produto, categoria e coleção
    settings.ts           Tipagem das configurações do site
supabase/
  schema.sql            DDL: tabelas, índices, triggers e policies de RLS
  seed.sql               Dados iniciais (categorias, coleções, settings, produtos)
  storage.sql            Bucket público de imagens de produto (V1.1)
```

## Painel administrativo com Supabase (V2)

Depois de reconectar o Supabase (variáveis de ambiente da seção acima),
acesse `/admin` e faça login com o e-mail/senha criados em **Supabase
Dashboard → Authentication → Users** (não existe cadastro público — só o
painel do Supabase cria contas). As credenciais locais (`ADMIN_EMAIL` /
`ADMIN_PASSWORD`) do modo Preview deixam de valer nesse momento. No
dashboard (`/admin/dashboard`) é possível:

- Criar, editar e excluir produtos (lista paginada, 10 por página)
- Alterar preço, descrição, categoria e tags (Novo, Promoção, Mais vendido,
  Lançamento) diretamente na tabela
- Enviar imagens (upload direto para o Supabase Storage, bucket público `product-images`)
- Alterar o link do Mercado Livre de cada produto
- Ativar/desativar um produto (produtos inativos somem do site público)

A rota `/admin/dashboard` é protegida por middleware (`src/middleware.ts`),
que verifica uma sessão real do Supabase Auth — e por checagem de sessão em
cada rota de API (`hasSession()` em `src/lib/auth.ts`).

A tela de **Configurações do site** (banners, logo, contato, rodapé) hoje
grava em arquivos JSON locais (`src/lib/site-settings.ts`) mesmo com o
Supabase configurado — migrar essa parte para uma tabela `settings` é o
próximo passo natural da V2 (o tipo `SiteSettings`, em
`src/types/settings.ts`, já está pronto para isso).

## Preparado para virar e-commerce próprio no futuro

O projeto foi estruturado para que, se um dia a SARONG quiser vender
diretamente (sem depender do Mercado Livre), a migração não exija reconstruir
o site:

- `src/lib/products.ts` isola toda leitura/escrita de dados: a troca do JSON
  original para o Supabase (ETAPA 1) exigiu reescrever só este arquivo — nenhum
  componente, página ou rota de API mudou.
- O tipo `Product` (`src/types/product.ts`) já contempla campos como `stock` e
  `sku`, usados por um e-commerce mas ainda opcionais na vitrine.
- Os componentes de produto (`ProductCard`, `ProductGrid`, página de produto)
  não conhecem o Mercado Livre diretamente — apenas leem `mercadoLivreUrl`.
  Bastaria trocar esse botão por um "Adicionar ao carrinho" no futuro.
- `src/lib/auth.ts` concentra toda a autenticação: pode ser substituído por
  NextAuth/Clerk quando houver múltiplos usuários.

## Integração futura com Instagram

`src/components/home/InstagramFeed.tsx` já está pronto para consumir posts
reais: basta criar uma rota `src/app/api/instagram/route.ts` que busque os
posts via Instagram Graph API (com token em variável de ambiente) e substituir
o array `MOCK_POSTS` por esses dados.

## SEO

- Metadata, Open Graph e Twitter Card por página (`src/lib/seo.ts`)
- JSON-LD de `Product` (schema.org) em cada página de produto
- `sitemap.xml` e `robots.txt` gerados dinamicamente
- URLs amigáveis (`/produtos/nome-do-produto`)
- Página de produto gerada estaticamente (`generateStaticParams`)

## Fontes

O layout usa uma stack de fontes de sistema equivalente a Helvetica Now/Neue
Haas para funcionar sem depender de arquivos de fonte licenciados. Para usar a
tipografia definitiva da marca, adicione os arquivos da fonte em
`src/app/fonts/` e configure via `next/font/local` em `src/app/layout.tsx`.
