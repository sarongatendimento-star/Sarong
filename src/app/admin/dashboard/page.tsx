import { redirect } from 'next/navigation';
import Link from 'next/link';
import { hasSession } from '@/lib/auth';
import { getProductStats, getAllProductsAdmin } from '@/lib/products';
import { getAllCategories } from '@/lib/categories';
import { getAllCollections } from '@/lib/collections';
import { formatPrice } from '@/lib/format';
import DashboardStatCard from '@/components/admin/DashboardStatCard';

// -----------------------------------------------------------------------------
// Visão geral do painel (V1.2) — Server Component: os números vêm direto do
// Supabase no servidor, sem loading state no cliente.
//
// "Coleção ativa" (pedida no briefing original) ainda NÃO aparece aqui: o
// mecanismo de ativação de coleção é o coração da V1.3 e ainda não existe no
// banco. Mostrar isso agora seria inventar um dado falso. Em vez disso, o
// card abaixo mostra quantas coleções já estão cadastradas — e ganha o
// indicador de "ativa" assim que a V1.3 entrar.
// -----------------------------------------------------------------------------

export default async function AdminDashboardPage() {
  if (!(await hasSession())) redirect('/admin');

  const [stats, categories, collections, recent] = await Promise.all([
    getProductStats(),
    getAllCategories(),
    getAllCollections(),
    getAllProductsAdmin({ page: 1, pageSize: 5 }),
  ]);

  return (
    <div>
      <h1 className="mb-8 text-2xl tracking-tight text-sarong-black">Visão geral</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <DashboardStatCard label="Produtos" value={stats.total} />
        <DashboardStatCard label="Em destaque" value={stats.featured} />
        <DashboardStatCard label="Em promoção" value={stats.promo} />
        <DashboardStatCard label="Categorias" value={categories.length} />
      </div>

      <p className="mt-4 text-xs text-sarong-black/40">
        {collections.length} {collections.length === 1 ? 'coleção cadastrada' : 'coleções cadastradas'} —
        a ativação de coleção (banner e destaques mudando automaticamente) chega na próxima versão.
      </p>

      <div className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest2 text-sarong-black/60">
            Últimos produtos adicionados
          </h2>
          <Link
            href="/admin/dashboard/produtos"
            className="text-xs uppercase tracking-widest2 text-sarong-black hover:text-sarong-red"
          >
            Ver todos →
          </Link>
        </div>

        <div className="divide-y divide-sarong-black/10 border-y border-sarong-black/10">
          {recent.items.map((p) => (
            <Link
              key={p.id}
              href={`/admin/dashboard/produtos/${p.id}`}
              className="flex items-center gap-4 py-3 hover:bg-sarong-beige/20"
            >
              {p.images[0] && (
                <img src={p.images[0]} alt="" className="h-12 w-12 object-cover" />
              )}
              <div className="flex-1">
                <p className="text-sm text-sarong-black">{p.name}</p>
                <p className="text-xs text-sarong-black/40">{p.categoryName || p.category}</p>
              </div>
              <span className="text-sm text-sarong-black">{formatPrice(p.price)}</span>
            </Link>
          ))}
          {recent.items.length === 0 && (
            <p className="py-6 text-sm text-sarong-black/40">Nenhum produto cadastrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
}
