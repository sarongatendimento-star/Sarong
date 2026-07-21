'use client';

import { motion } from 'framer-motion';

// -----------------------------------------------------------------------------
// Elemento de assinatura visual da SARONG.
//
// Uma linha fina que "se desenrola" da esquerda para a direita, como um tecido
// sendo desamarrado — referencia direta ao proprio nome da marca (sarong =
// tecido enrolado ao corpo). Usado sob titulos de secao e no hover do logo.
// -----------------------------------------------------------------------------
export default function FabricUnderline({
  className = '',
  color = 'currentColor',
  delay = 0,
}: {
  className?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.span
      aria-hidden
      className={`block h-px origin-left ${className}`}
      style={{ backgroundColor: color }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}
