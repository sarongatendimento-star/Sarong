// Conteúdo editável do site pelo painel administrativo (modo Preview local,
// ou futuramente uma tabela `settings` no Supabase — o formato já é o mesmo).
export interface SiteSettings {
  logoText: string;

  heroBanner: {
    eyebrow: string;
    title: string;
    ctaLabel: string;
    ctaHref: string;
    imageUrl: string;
  };

  secondaryBanner: {
    eyebrow: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
    imageUrl: string;
  };

  about: {
    eyebrow: string;
    title: string;
    text: string;
    imageUrl: string;
  };

  contact: {
    whatsappUrl: string;
    phone: string;
    email: string;
    instagramUrl: string;
    facebookUrl: string;
    pinterestUrl: string;
  };

  footer: {
    description: string;
    copyrightText: string;
  };

  instagramFeed: {
    imageUrl: string;
    linkHref: string;
  }[];
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
