'use client';

import { useState } from 'react';
import type { Collection } from '@/types/product';
import ImageField from './ImageField';

interface CollectionsFormProps {
  collections: Collection[];
}

const inputClass =
  'w-full border border-sarong-black/20 px-3 py-2 text-sm outline-none focus:border-sarong-black';
const labelClass = 'mb-1 block text-xs uppercase tracking-widest2 text-sarong-black/60';

// Uma coleção por card, com salvamento individual (PATCH /api/collections/:id)
// — mais simples e mais seguro do que um único botão "salvar tudo", já que
// cada coleção é independente das outras.
export default function CollectionsForm({ collections }: CollectionsFormProps) {
  return (
    <div className="max-w-3xl space-y-6">
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}

function CollectionCard({ collection }: { collection: Collection }) {
  const [name, setName] = useState(collection.name);
  const [imageUrl, setImageUrl] = useState(collection.imageUrl ?? '');
  const [linkHref, setLinkHref] = useState(collection.linkHref ?? '');
  const [active, setActive] = useState(collection.active);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    const res = await fetch(`/api/collections/${collection.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, imageUrl, linkHref, active }),
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
        <h2 className="text-sm uppercase tracking-widest2 text-sarong-black">Coleção: {collection.slug}</h2>
        <label className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-sarong-black/60">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Ativa (aparece no site)
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>Nome exibido</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Link de destino (ao clicar no card)</label>
          <input
            value={linkHref}
            onChange={(e) => setLinkHref(e.target.value)}
            placeholder="/produtos?categoria=vestidos"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <ImageField label="Imagem" value={imageUrl} onChange={setImageUrl} />
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
