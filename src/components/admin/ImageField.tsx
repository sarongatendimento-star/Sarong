'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

const inputClass =
  'w-full border border-sarong-black/20 px-3 py-2 text-sm outline-none focus:border-sarong-black';
const labelClass = 'mb-1 block text-xs uppercase tracking-widest2 text-sarong-black/60';

// Campo de imagem única (banners/seção "Sobre" nas configurações do site) —
// mesma rota /api/upload já usada pelos produtos (ver ImageGallery), só que
// aqui é uma imagem só em vez de uma lista. O campo de URL continua
// existindo, então colar um link de fora ainda funciona normalmente.
export default function ImageField({ label, value, onChange }: ImageFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const body = new FormData();
    body.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body });
    setUploading(false);
    e.target.value = ''; // permite selecionar o mesmo arquivo de novo, se precisar

    const data = await res.json();
    if (res.ok) {
      onChange(data.url);
    } else {
      setError(data.error || 'Não foi possível enviar a imagem.');
    }
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-start gap-3">
        {value && (
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 border border-sarong-black/10 object-cover"
          />
        )}
        <div className="flex-1 space-y-2">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cole uma URL ou envie um arquivo"
            className={inputClass}
          />
          <label className="inline-flex cursor-pointer items-center gap-2 border border-sarong-black/20 px-3 py-2 text-xs uppercase tracking-widest2 text-sarong-black/70 hover:border-sarong-black hover:text-sarong-black">
            <Upload size={14} />
            {uploading ? 'Enviando…' : 'Enviar imagem'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-sarong-red">{error}</p>}
    </div>
  );
}
