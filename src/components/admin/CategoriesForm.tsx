'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types/product';

const inputClass =
  'w-full border border-sarong-black/20 px-3 py-2 text-sm outline-none focus:border-sarong-black';
const labelClass = 'mb-1 block text-xs uppercase tracking-widest2 text-sarong-black/60';

interface CategoriesFormProps {
  categories: Category[];
}

export default function CategoriesForm({ categories }: CategoriesFormProps) {
  return (
    <div className="max-w-2xl space-y-6">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
      <NewCategoryCard />
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  const [name, setName] = useState(category.name);
  const [displayOrder, setDisplayOrder] = useState(category.displayOrder);
  const [active, setActive] = useState(category.active);
  const [comingSoon, setComingSoon] = useState(category.comingSoon);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, displayOrder, active, comingSoon }),
    });

    setSaving(false);
    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Não foi possível salvar.' });
      return;
    }

    setMessage({ type: 'success', text: 'Salvo.' });
  }

  return (
    <div className="border border-sarong-black/10 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-widest2 text-sarong-black">
          Categoria: <span className="text-sarong-black/50">{category.slug}</span>
        </h2>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-sarong-black/60">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Ativa (aparece no site)
        </label>
      </div>

      <label className="mb-4 flex items-center gap-2 text-xs uppercase tracking-widest2 text-sarong-black/60">
        <input type="checkbox" checked={comingSoon} onChange={(e) => setComingSoon(e.target.checked)} />
        Em breve (aparece no menu, mas sem clique, com aviso "em breve")
      </label>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_140px]">
        <div>
          <label className={labelClass}>Nome exibido</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Ordem</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(Number(e.target.value))}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-sarong-black px-6 py-3 text-xs uppercase tracking-widest2 text-sarong-off hover:bg-sarong-red disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
        {message && (
          <p className={message.type === 'success' ? 'text-xs text-sarong-black' : 'text-xs text-sarong-red'}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

function NewCategoryCard() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleCreate() {
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Informe um nome.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    setSaving(false);
    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Não foi possível criar.' });
      return;
    }

    setName('');
    router.refresh(); // recarrega a lista com a categoria nova incluída
  }

  return (
    <div className="border border-dashed border-sarong-black/30 bg-white p-6">
      <h2 className="mb-4 text-sm uppercase tracking-widest2 text-sarong-black">Nova categoria</h2>
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className={labelClass}>Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Acessórios"
            className={inputClass}
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="bg-sarong-black px-6 py-3 text-xs uppercase tracking-widest2 text-sarong-off hover:bg-sarong-red disabled:opacity-50"
        >
          {saving ? 'Criando…' : 'Criar'}
        </button>
      </div>
      {message && (
        <p className={message.type === 'success' ? 'mt-3 text-xs text-sarong-black' : 'mt-3 text-xs text-sarong-red'}>
          {message.text}
        </p>
      )}
    </div>
  );
}
