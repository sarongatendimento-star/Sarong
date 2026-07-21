import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getAllProductsAdmin } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import Pagination from '@/components/ui/Pagination';
import DeleteProductButton from '@/components/admin/DeleteProductButton';

const PAGE_SIZE = 10;

// Lista de produtos do admin — Server Component simples (sem loading state
// no cliente). Toda edição acontece na tela de formulário única
// (ver src/components/admin/ProductForm.tsx); esta tabela só exibe e
// oferece Editar/Excluir, substituindo a edição solta em linha que existia
// antes (V1.1), apontada no relatório técnico como dois fluxos divergentes.
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const { items, total, totalPages } = await getAllProductsAdmin({ page, pageSize: PAGE_SIZE });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-sarong-black">Produtos ({total})</h1>
        <Link
          href="/admin/dashboard/produtos/novo"
          className="flex items-center gap-2 bg-sarong-black px-5 py-3 text-xs uppercase tracking-widest2 text-sarong-off hover:bg-sarong-red"
        >
          <Plus size={14} /> Novo produto
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-sarong-black/40">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-sarong-black/10 text-left text-xs uppercase tracking-widest2 text-sarong-black/50">
                <th className="py-3 pr-4">Produto</th>
                <th className="py-3 pr-4">Categoria</th>
                <th className="py-3 pr-4">Preço</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b border-sarong-black/5">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/dashboard/produtos/${p.id}`} className="flex items-center gap-3">
                      {p.images[0] && <img src={p.images[0]} alt="" className="h-12 w-12 object-cover" />}
                      <span className="text-sarong-black">{p.name}</span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{p.categoryName || p.category}</td>
                  <td className="py-3 pr-4">{formatPrice(p.price)}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={
                        p.active
                          ? 'text-xs uppercase tracking-widest2 text-sarong-black/60'
                          : 'text-xs uppercase tracking-widest2 text-sarong-red'
                      }
                    >
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/dashboard/produtos/${p.id}`}
                        className="text-xs uppercase tracking-widest2 text-sarong-black/60 hover:text-sarong-black"
                      >
                        Editar
                      </Link>
                      <DeleteProductButton productId={p.id} productName={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
