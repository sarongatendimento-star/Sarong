import { ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import { ArrowUpRight } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
  showIcon?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-sarong-black text-sarong-off hover:bg-sarong-red',
  secondary: 'bg-sarong-off text-sarong-black hover:bg-sarong-beige',
  ghost: 'bg-transparent text-sarong-black border border-sarong-black hover:bg-sarong-black hover:text-sarong-off',
};

// Botao de acao unico e reutilizavel em todo o site.
// Quando `external` e verdadeiro, abre em nova aba — usado sempre que o
// destino for o Mercado Livre (a compra nunca acontece dentro do site).
export default function Button({
  children,
  href,
  variant = 'primary',
  className,
  external = false,
  showIcon = true,
}: BaseProps & { href: string }) {
  const classes = clsx(
    'inline-flex items-center gap-2 px-7 py-3.5 text-xs uppercase tracking-widest2 transition-colors duration-300 ease-editorial',
    variantStyles[variant],
    className
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
        {showIcon && <ArrowUpRight size={14} />}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {showIcon && <ArrowUpRight size={14} />}
    </Link>
  );
}
