'use client';

import { useState } from 'react';
import { Upload, X, Link as LinkIcon, GripVertical } from 'lucide-react';

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
//
// V1.4: reordenar arrastando as miniaturas (drag and drop nativo do
// navegador, sem biblioteca nova) em vez de precisar excluir e reenviar na
// ordem certa. A ORDEM da lista `images` é o que importa em todo o resto do
// site: a primeira imagem é sempre a capa (usada no card de produto, na
// galeria da página do produto e no preço/imagem que vai para o Google via
// JSON-LD) — por isso ela ganha o selo "Capa" aqui.
export default function ImageGallery({ images, onChange }: ImageGalleryProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault(); // necessário para o navegador permitir o drop aqui
    if (index !== overIndex) setOverIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...images];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

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

  // Remove por posição, não por URL — se a mesma imagem aparecer duas vezes
  // na galeria, filtrar por URL apagaria as duas de uma vez só.
  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-widest2 text-sarong-black/60">
        Imagens
      </label>
      <div className="flex flex-wrap gap-3">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`group relative h-24 w-24 cursor-grab transition-opacity active:cursor-grabbing ${
              dragIndex === index ? 'opacity-30' : ''
            } ${overIndex === index && dragIndex !== null && dragIndex !== index ? 'ring-2 ring-sarong-red' : ''}`}
          >
            <img src={img} alt="" className="h-24 w-24 object-cover" draggable={false} />

            {index === 0 && (
              <span className="absolute left-1 top-1 bg-sarong-black/80 px-1.5 py-0.5 text-[9px] uppercase tracking-widest2 text-sarong-off">
                Capa
              </span>
            )}

            <span className="absolute bottom-1 left-1 rounded-full bg-sarong-black/60 p-0.5 text-sarong-off opacity-0 transition-opacity group-hover:opacity-100">
              <GripVertical size={12} />
            </span>

            <button
              type="button"
              onClick={() => removeImage(index)}
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
        Arraste as miniaturas para reordenar — a primeira é sempre a capa do produto. Upload local: até 1MB
        por imagem. Para imagens maiores, use o campo de URL acima.
      </p>
    </div>
  );
}
