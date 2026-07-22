'use client';

import { useState, FormEvent } from 'react';
import type { SiteSettings } from '@/types/settings';
import ImageField from './ImageField';

interface SettingsFormProps {
  settings: SiteSettings;
}

const inputClass =
  'w-full border border-sarong-black/20 px-3 py-2 text-sm outline-none focus:border-sarong-black';
const labelClass = 'mb-1 block text-xs uppercase tracking-widest2 text-sarong-black/60';
const sectionClass = 'border border-sarong-black/10 bg-white p-6';
const sectionTitleClass = 'mb-5 text-sm uppercase tracking-widest2 text-sarong-black';

// -----------------------------------------------------------------------------
// Formulário de configurações do site — V1.3 (modo Preview).
//
// Cada seção corresponde a um bloco de src/types/settings.ts. Salva tudo de
// uma vez via PATCH /api/settings. Campos de imagem são um input de URL
// (aceita tanto um link normal quanto uma data URI vinda do upload de um
// produto) em vez de upload próprio, para manter este formulário simples —
// ver ImageGallery para o fluxo de upload completo (usado nos produtos).
// -----------------------------------------------------------------------------
export default function SettingsForm({ settings }: SettingsFormProps) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  function update<K extends keyof SiteSettings>(section: K, patch: Partial<SiteSettings[K]>) {
    setForm((f) => {
      const next = { ...f };
      next[section] = { ...(next[section] as object), ...patch } as SiteSettings[K];
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);
    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: 'error', text: data.error || 'Não foi possível salvar.' });
      return;
    }

    if (data.settings) setForm(data.settings);

    if (data.ephemeral) {
      setMessage({
        type: 'warning',
        text:
          'Salvo. Aviso: neste ambiente (sem banco de dados) as alterações podem não persistir permanentemente — ver README.',
      });
    } else {
      setMessage({ type: 'success', text: 'Configurações salvas.' });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Logo</h2>
        <div>
          <label className={labelClass}>Texto do logo (cabeçalho)</label>
          <input
            value={form.logoText}
            onChange={(e) => setForm((f) => ({ ...f, logoText: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Banner principal (Home)</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Texto pequeno (eyebrow)</label>
            <input
              value={form.heroBanner.eyebrow}
              onChange={(e) => update('heroBanner', { eyebrow: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Botão — texto</label>
            <input
              value={form.heroBanner.ctaLabel}
              onChange={(e) => update('heroBanner', { ctaLabel: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Título</label>
            <textarea
              rows={2}
              value={form.heroBanner.title}
              onChange={(e) => update('heroBanner', { title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Botão — link</label>
            <input
              value={form.heroBanner.ctaHref}
              onChange={(e) => update('heroBanner', { ctaHref: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <ImageField
              label="Imagem de fundo"
              value={form.heroBanner.imageUrl}
              onChange={(url) => update('heroBanner', { imageUrl: url })}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Banner secundário (Home)</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Texto pequeno (eyebrow)</label>
            <input
              value={form.secondaryBanner.eyebrow}
              onChange={(e) => update('secondaryBanner', { eyebrow: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Botão — texto</label>
            <input
              value={form.secondaryBanner.ctaLabel}
              onChange={(e) => update('secondaryBanner', { ctaLabel: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Título</label>
            <input
              value={form.secondaryBanner.title}
              onChange={(e) => update('secondaryBanner', { title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Botão — link</label>
            <input
              value={form.secondaryBanner.ctaHref}
              onChange={(e) => update('secondaryBanner', { ctaHref: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Subtítulo</label>
            <input
              value={form.secondaryBanner.subtitle}
              onChange={(e) => update('secondaryBanner', { subtitle: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <ImageField
              label="Imagem de fundo"
              value={form.secondaryBanner.imageUrl}
              onChange={(url) => update('secondaryBanner', { imageUrl: url })}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Seção "Sobre" (Home)</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Texto pequeno (eyebrow)</label>
            <input
              value={form.about.eyebrow}
              onChange={(e) => update('about', { eyebrow: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <ImageField
              label="Imagem"
              value={form.about.imageUrl}
              onChange={(url) => update('about', { imageUrl: url })}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Título</label>
            <textarea
              rows={2}
              value={form.about.title}
              onChange={(e) => update('about', { title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Texto</label>
            <textarea
              rows={4}
              value={form.about.text}
              onChange={(e) => update('about', { text: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Contato e redes sociais</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>WhatsApp (link wa.me)</label>
            <input
              value={form.contact.whatsappUrl}
              onChange={(e) => update('contact', { whatsappUrl: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input
              value={form.contact.phone}
              onChange={(e) => update('contact', { phone: e.target.value })}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div>
            <label className={labelClass}>E-mail</label>
            <input
              type="email"
              value={form.contact.email}
              onChange={(e) => update('contact', { email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Instagram (URL)</label>
            <input
              value={form.contact.instagramUrl}
              onChange={(e) => update('contact', { instagramUrl: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Facebook (URL)</label>
            <input
              value={form.contact.facebookUrl}
              onChange={(e) => update('contact', { facebookUrl: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Pinterest (URL)</label>
            <input
              value={form.contact.pinterestUrl}
              onChange={(e) => update('contact', { pinterestUrl: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className={sectionTitleClass}>Rodapé</h2>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Descrição (abaixo do logo)</label>
            <textarea
              rows={2}
              value={form.footer.description}
              onChange={(e) => update('footer', { description: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Texto de copyright (linha final, sem o ano/©)</label>
            <input
              value={form.footer.copyrightText}
              onChange={(e) => update('footer', { copyrightText: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {message && (
        <p
          className={
            message.type === 'success'
              ? 'text-xs text-sarong-black'
              : message.type === 'warning'
              ? 'text-xs text-sarong-red'
              : 'text-xs text-sarong-red'
          }
        >
          {message.text}
        </p>
      )}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-sarong-black px-6 py-3 text-xs uppercase tracking-widest2 text-sarong-off hover:bg-sarong-red disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar configurações'}
        </button>
      </div>
    </form>
  );
}
