'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import type { Product, ProductTag, Category, Collection } from '@/types/product';
import ImageGallery from './ImageGallery';

interface ProductFormProps {
  mode: 'create' | 'edit';
  product?: Product;
  categories: Category[];
  collections: Collection[];
}

const TAGS: { value: ProductTag; label: string }[] = [
  { value: 'novo', label: 'Novo' },
  { value: 'promocao', label: 'Promoção' },
  { value: 'mais-vendido', label: 'Mais vendido' },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// -----------------------------------------------------------------------------
// Formulário único de produto (V1.2) — substitui os dois fluxos que existiam
// antes (criação em formulário completo x edição em campos soltos na
// tabela). As rotas src/app/admin/dashboard/produtos/novo/page.tsx e
// .../[id]/page.tsx renderizam este MESMO componente, só trocando `mode` e
// `product`. A validação continua nas rotas de API (Zod, V1.1) — este
// componente só exibe a mensagem de erro que a API devolver.
// -----------------------------------------------------------------------------
export default function ProductForm({ mode, product, categories, collections }: ProductFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    shortDescription: product?.shortDescription ?? '',
    description: product?.description ?? '',
    price: product?.price ?? 0,
    oldPrice: product?.oldPrice,
    category: product?.category ?? categories[0]?.slug ?? '',
    collectionSlug: product?.collectionSlug ?? '',
    images: product?.images ?? ([] as string[]),
    mercadoLivreUrl: product?.mercadoLivreUrl ?? '',
    featured: product?.featured ?? false,
    tags: product?.tags ?? ([] as ProductTag[]),
    active: product?.active ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function toggleTag(tag: ProductTag) {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const url = mode === 'create' ? '/api/products' : `/api/products/${product!.id}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (res.ok) {
      router.push('/admin/dashboard/produtos');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Não foi possível salvar o produto.');
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`Excluir "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    router.push('/admin/dashboard/produtos');
    router.refresh();
  }

  const inputClass =
    'w-full border border-sarong-black/20 px-3 py-2 text-sm outline-none focus:border-sarong-black';
  const labelClass = 'mb-1 block text-xs uppercase tracking-widest2 text-sarong-black/60';

  return (
    <div className="max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl tracking-tight text-sarong-black">
          {mode === 'create' ? 'Novo produto' : 'Editar produto'}
        </h1>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-2 text-xs uppercase tracking-widest2 text-sarong-black/50 hover:text-sarong-red"
          >
            <Trash2 size={14} /> Excluir produto
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 border border-sarong-black/10 bg-white p-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ImageGallery images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
        </div>

        <div>
          <label className={labelClass}>Nome</label>
          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                name: e.target.value,
                slug: mode === 'create' ? slugify(e.target.value) : f.slug,
              }))
            }
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Slug (URL)</label>
          <input
            required
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Descrição curta</label>
          <input
            value={form.shortDescription}
            onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Descrição completa</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Preço (R$)</label>
          <input
            required
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Preço promocional (opcional)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.oldPrice ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, oldPrice: e.target.value ? parseFloat(e.target.value) : undefined }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <select
            required
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
          >
            {categories.length === 0 && <option value="">Nenhuma categoria cadastrada</option>}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Coleção (opcional)</label>
          <select
            value={form.collectionSlug}
            onChange={(e) => setForm((f) => ({ ...f, collectionSlug: e.target.value }))}
            className={inputClass}
          >
            <option value="">Nenhuma</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Link do Mercado Livre</label>
          <input
            required
            type="url"
            value={form.mercadoLivreUrl}
            onChange={(e) => setForm((f) => ({ ...f, mercadoLivreUrl: e.target.value }))}
            className={inputClass}
            placeholder="https://www.mercadolivre.com.br/..."
          />
        </div>

        <div className="md:col-span-2">
          <label className={`${labelClass} mb-2`}>Marcadores</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Destaque (aparece na Home)
            </label>
            {TAGS.map((tag) => (
              <label key={tag.value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.tags.includes(tag.value)}
                  onChange={() => toggleTag(tag.value)}
                />
                {tag.label}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Ativo (visível na vitrine)
            </label>
          </div>
        </div>

        {error && (
          <div className="md:col-span-2">
            <p className="text-xs text-sarong-red">{error}</p>
          </div>
        )}

        <div className="flex gap-4 md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-sarong-black px-6 py-3 text-xs uppercase tracking-widest2 text-sarong-off hover:bg-sarong-red disabled:opacity-50"
          >
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/dashboard/produtos')}
            className="border border-sarong-black/20 px-6 py-3 text-xs uppercase tracking-widest2 text-sarong-black/70 hover:border-sarong-black hover:text-sarong-black"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
