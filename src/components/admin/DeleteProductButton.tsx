'use client';

import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

// Botão de exclusão isolado num Client Component só para poder chamar
// confirm()/fetch() — o resto da tela de listagem (src/app/admin/dashboard/
// produtos/page.tsx) é um Server Component simples.
export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Excluir "${productName}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      aria-label={`Excluir ${productName}`}
      className="text-sarong-black/40 hover:text-sarong-red"
    >
      <Trash2 size={16} />
    </button>
  );
}
