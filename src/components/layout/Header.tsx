'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import type { Category } from '@/types/product';

interface HeaderProps {
  categories: Category[];
  logoText?: string;
}

// Header fixo, transparente sobre o hero e solido ao rolar a pagina —
// comportamento comum em sites editoriais de moda (Zara, COS, Toteme).
//
// V1.1: os links de categoria não são mais um array fixo — vêm da tabela
// `categories` do Supabase (ver src/lib/categories.ts), passados pela página
// que renderiza este componente. "Sobre" continua fixo por ser um link
// institucional, não uma categoria de produto.
//
// V1.3 (modo Preview): `logoText` vem de src/lib/site-settings.ts, editável
// em /admin/dashboard/configuracoes.
export default function Header({ categories, logoText = 'SARONG' }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ...categories.map((cat) => ({
      href: `/produtos?categoria=${cat.slug}`,
      label: cat.name,
    })),
    { href: '/#sobre', label: 'Sobre' },
  ];

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500 ease-editorial',
        scrolled || open ? 'bg-sarong-off/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(0,0,0,0.06)]' : 'bg-transparent'
      )}
    >
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-5 md:px-10 lg:px-16">
        <Link
          href="/"
          className={clsx(
            'font-sans text-xl tracking-widest2 transition-colors duration-500',
            scrolled || open ? 'text-sarong-black' : 'text-sarong-off'
          )}
        >
          {logoText}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-xs uppercase tracking-widest2 transition-colors duration-500 hover:opacity-60',
                scrolled ? 'text-sarong-black' : 'text-sarong-off'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
          className={clsx('md:hidden', scrolled || open ? 'text-sarong-black' : 'text-sarong-off')}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-col gap-1 bg-sarong-off px-6 pb-6 md:hidden"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm uppercase tracking-widest2 text-sarong-black border-b border-sarong-black/10"
            >
              {link.label}
            </Link>
          ))}
        </motion.nav>
      )}
    </header>
  );
}
