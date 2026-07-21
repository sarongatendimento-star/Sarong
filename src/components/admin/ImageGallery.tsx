'use client';

import { useState } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
}

// Galeria de imagens do produto — usa a rota /api/upload (Supabase Storage na
// V2; base64 local no modo Preview — ver src/app/api/upload/route.ts).
//
// V1.3 (modo Preview): além do upload, agora também é possível colar a URL de
// uma imagem já hospedada externamente — útil porque o upload local tem um
// limite de tamanho menor (1MB) para caber com folga no limite de payload da
// Vercel. Os dois métodos alimentam a mesma lista `images`, sem distinção.
export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');

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

    if (res.ok) {
      const data = await res.json();
      onChange([...images, data.url]);
    } else {
      const data = await res.json();
      setError(data.error || 'Não foi possível enviar a imagem.');
    }
  }

  function handleAddUrl() {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlInput('');
    setError('');
  }

  function removeImage(url: string) {
    onChange(images.filter((img) => img !== url));
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-widest2 text-sarong-black/60">
        Imagens
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img} className="group relative h-24 w-24">
            <img src={img} alt="" className="h-24 w-24 object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img)}
              aria-label="Remover imagem"
              className="absolute -right-2 -top-2 rounded-full bg-sarong-black p-1 text-sarong-off opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        <label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-sarong-black/30 text-sarong-black/50 hover:border-sarong-black">
          {uploading ? '...' : <Upload size={18} />}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <LinkIcon size={14} className="shrink-0 text-sarong-black/40" />
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="Ou cole a URL de uma imagem já hospedada"
          className="w-full border border-sarong-black/20 px-3 py-2 text-xs outline-none focus:border-sarong-black"
        />
        <button
          type="button"
          onClick={handleAddUrl}
          className="shrink-0 border border-sarong-black/20 px-3 py-2 text-xs uppercase tracking-widest2 text-sarong-black/70 hover:border-sarong-black hover:text-sarong-black"
        >
          Adicionar
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-sarong-red">{error}</p>}
      <p className="mt-2 text-[11px] text-sarong-black/40">
        Upload local: até 1MB por imagem. Para imagens maiores, use o campo de URL acima.
      </p>
    </div>
  );
}
