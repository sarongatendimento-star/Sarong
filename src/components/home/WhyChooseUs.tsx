import Container from '@/components/ui/Container';
import SectionHeading from '@/components/ui/SectionHeading';
import { Gem, ShieldCheck, Truck, Sparkles } from 'lucide-react';

const REASONS = [
  {
    icon: Gem,
    title: 'Design Premium',
    text: 'Peças autorais, desenhadas com atenção ao detalhe e ao caimento.',
  },
  {
    icon: Sparkles,
    title: 'Produtos Selecionados',
    text: 'Produção em pequenos lotes. Nada de coleções massificadas.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    text: 'Toda a compra é processada com a segurança do Mercado Livre.',
  },
  {
    icon: Truck,
    title: 'Entrega Nacional',
    text: 'Enviamos para todo o Brasil, com rastreio de ponta a ponta.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-sarong-beige/30 py-24">
      <Container>
        <SectionHeading eyebrow="Confiança" title="Por que escolher a SARONG?" align="center" />
        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <Icon className="mx-auto mb-4 text-sarong-red" size={28} strokeWidth={1.25} />
              <h3 className="text-sm uppercase tracking-widest2 text-sarong-black">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-sarong-black/60">{text}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
