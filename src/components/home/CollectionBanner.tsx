import Link from 'next/link';

const ITEMS = [
  {
    label: 'Lançamentos',
    href: '/produtos?categoria=lancamentos',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Coleção Verão',
    href: '/produtos?categoria=moda-praia',
    image: 'https://images.unsplash.com/photo-1570976447640-ac859083963e?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Moda Praia',
    href: '/produtos?categoria=moda-praia',
    image: 'https://images.unsplash.com/photo-1521205624015-1c3ea6774dfd?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Vestidos',
    href: '/produtos?categoria=vestidos',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Cangas',
    href: '/produtos?categoria=cangas',
    image: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=1200&auto=format&fit=crop',
  },
];

// Grade de navegação por categoria — cada bloco é um convite visual, não uma
// lista de links comum.
export default function CollectionBanner() {
  return (
    <section className="grid grid-cols-2 md:grid-cols-5">
      {ITEMS.map((item) => (
        <Link key={item.label} href={item.href} className="group relative block aspect-[3/4] overflow-hidden">
          <img
            src={item.image}
            alt={item.label}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-editorial group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-sarong-black/30 transition-colors duration-500 group-hover:bg-sarong-black/45" />
          <span className="absolute bottom-5 left-5 text-xs uppercase tracking-widest2 text-sarong-off">
            {item.label}
          </span>
        </Link>
      ))}
    </section>
  );
}
