import { ReactNode } from 'react';
import clsx from 'clsx';

// Container central com largura maxima e respiro lateral consistente.
export default function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('mx-auto w-full max-w-content px-6 md:px-10 lg:px-16', className)}>
      {children}
    </div>
  );
}
