import Link from 'next/link';
import LogoutButton from '@/components/admin/LogoutButton';

// Shell compartilhado por todas as telas de /admin/dashboard/** (Dashboard,
// Produtos, Novo produto, Editar produto) — V1.2. A barra superior com
// navegação e logout existia duplicada dentro da página única antiga; agora
// vive uma vez só, aqui, e não afeta a tela de login (/admin), que usa o
// layout pai (src/app/admin/layout.tsx) sem esta barra.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="flex items-center justify-between border-b border-sarong-black/10 px-6 py-5 md:px-10">
        <div className="flex items-center gap-10">
          <p className="text-lg tracking-widest2 text-sarong-black">SARONG · Admin</p>
          <nav className="flex gap-6 text-xs uppercase tracking-widest2 text-sarong-black/60">
            <Link href="/admin/dashboard" className="hover:text-sarong-black">Dashboard</Link>
            <Link href="/admin/dashboard/produtos" className="hover:text-sarong-black">Produtos</Link>
            <Link href="/admin/dashboard/configuracoes" className="hover:text-sarong-black">Configurações</Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      <main className="px-6 py-10 md:px-10">{children}</main>
    </>
  );
}
