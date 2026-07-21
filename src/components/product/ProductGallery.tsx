'use client';

import { useState } from 'react';
import clsx from 'clsx';

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="aspect-[3/4] w-full overflow-hidden bg-sarong-beige/30">
        <img src={images[active]} alt={name} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={clsx(
                'aspect-[3/4] overflow-hidden border transition-colors',
                active === i ? 'border-sarong-black' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <img src={img} alt={`${name} — foto ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
