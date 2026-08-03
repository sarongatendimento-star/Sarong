'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  // Só nas fotos de produto o enquadramento é livre (object-contain, sem
  // altura fixa) — aceita fotos horizontais e verticais sem cortar nada. O
  // resto do site (banners, coleções) continua com o recorte fixo de
  // sempre, de propósito.
  return (
    <div>
      <div className="flex w-full items-center justify-center overflow-hidden bg-sarong-beige/30">
        <img src={images[active]} alt={name} className="max-h-[80vh] w-full object-contain" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={clsx(
                'aspect-[3/4] overflow-hidden border bg-sarong-beige/30 transition-colors',
                active === i ? 'border-sarong-black' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img} alt={`${name} — foto ${i + 1}`} className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
