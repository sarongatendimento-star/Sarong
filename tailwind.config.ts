import type { Config } from 'tailwindcss';

// Paleta e tipografia da marca SARONG.
// Mantidas centralizadas aqui para que qualquer ajuste de identidade visual
// seja refletido automaticamente em todo o site.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sarong: {
          off: '#F8F5F1',   // Off white — fundo principal
          black: '#1C1C1C', // Preto suave — textos e contraste
          beige: '#DCCFC3', // Bege — blocos secundarios, hover
          red: '#A64B4B',   // Vermelho queimado — usar com moderacao, apenas detalhes
        },
      },
      fontFamily: {
        sans: ['var(--font-sarong)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
      },
      maxWidth: {
        content: '1440px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
