import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import './globals.css';

// -----------------------------------------------------------------------------
// Fonte: em producao, troque por next/font/local apontando para os arquivos
// da familia tipografica licenciada (ex.: Neue Haas Grotesk / Helvetica Now).
// Aqui usamos uma stack de sistema equivalente para manter o projeto
// funcionando sem depender de arquivos de fonte pagos.
// -----------------------------------------------------------------------------

export const metadata: Metadata = {
  ...buildMetadata({ title: 'SARONG', path: '/' }),
  metadataBase: new URL('https://www.sarong.com.br'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ ['--font-sarong' as any]: "'Helvetica Neue', Arial, sans-serif" }}>
      <body>{children}</body>
    </html>
  );
}
