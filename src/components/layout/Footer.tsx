import Link from 'next/link';
import Container from '@/components/ui/Container';
import { Instagram, Facebook, Mail, MessageCircle, Phone } from 'lucide-react';
import type { SiteSettings } from '@/types/settings';

interface FooterProps {
  logoText?: string;
  contact: SiteSettings['contact'];
  footer: SiteSettings['footer'];
}

// Pinterest não tem ícone dedicado no pacote lucide-react instalado (mesma
// versão usada em todo o projeto) — reaproveita um traçado simples em SVG,
// no mesmo estilo (stroke, 1.5px) dos demais ícones desta lib, para não
// destoar visualmente.
function PinterestIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 20c1-3 2.2-7.6 2.2-7.6" />
      <path d="M10.6 14.5c.5 1 2 1.7 3.4 1.2 2-.7 3.4-2.8 3.4-5.4 0-3-2.4-5.3-5.7-5.3-4 0-6.3 2.9-6.3 5.9 0 1.5.6 3.1 1.8 3.6" />
    </svg>
  );
}

// Rodape institucional: contato, redes e link legal.
//
// V1.3 (modo Preview): todo o conteúdo (textos, links de contato e redes)
// vem de src/lib/site-settings.ts, editável em
// /admin/dashboard/configuracoes — substitui as variáveis de ambiente
// NEXT_PUBLIC_INSTAGRAM_URL / NEXT_PUBLIC_WHATSAPP_URL /
// NEXT_PUBLIC_CONTACT_EMAIL usadas antes (ainda servem de valor padrão, ver
// DEFAULT_SETTINGS).
export default function Footer({ logoText = 'SARONG', contact, footer }: FooterProps) {
  return (
    <footer className="bg-sarong-black text-sarong-off">
      <Container className="grid grid-cols-1 gap-12 py-16 md:grid-cols-3">
        <div>
          <p className="text-xl tracking-widest2">{logoText}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-sarong-off/70">{footer.description}</p>
        </div>

        <div className="flex flex-col gap-3 text-sm uppercase tracking-widest2">
          <p className="mb-1 text-sarong-off/50">Contato</p>
          {contact.instagramUrl && (
            <a
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-sarong-red"
            >
              <Instagram size={16} /> Instagram
            </a>
          )}
          {contact.facebookUrl && (
            <a
              href={contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-sarong-red"
            >
              <Facebook size={16} /> Facebook
            </a>
          )}
          {contact.pinterestUrl && (
            <a
              href={contact.pinterestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-sarong-red"
            >
              <PinterestIcon size={16} /> Pinterest
            </a>
          )}
          {contact.whatsappUrl && (
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-sarong-red"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          )}
          {contact.phone && (
            <a href={`tel:${contact.phone.replace(/\D/g, '')}`} className="flex items-center gap-2 hover:text-sarong-red">
              <Phone size={16} /> {contact.phone}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="flex items-center gap-2 hover:text-sarong-red">
              <Mail size={16} /> {contact.email}
            </a>
          )}
        </div>

        <div className="flex flex-col gap-3 text-sm uppercase tracking-widest2">
          <p className="mb-1 text-sarong-off/50">Institucional</p>
          <Link href="/produtos" className="hover:text-sarong-red">Produtos</Link>
          <Link href="/privacidade" className="hover:text-sarong-red">Política de Privacidade</Link>
        </div>
      </Container>

      <div className="border-t border-sarong-off/10 py-6">
        <Container>
          <p className="text-center text-[11px] tracking-widest2 text-sarong-off/40 uppercase">
            © {new Date().getFullYear()} {footer.copyrightText}
          </p>
        </Container>
      </div>
    </footer>
  );
}
