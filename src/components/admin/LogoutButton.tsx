'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

// Extraído do antigo dashboard monolítico para ser usado no layout
// compartilhado de /admin/dashboard/** (V1.2).
export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-sarong-black/60 hover:text-sarong-red"
    >
      <LogOut size={14} /> Sair
    </button>
  );
}
