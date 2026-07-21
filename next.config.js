/** @type {import('next').NextConfig} */

// Deriva o hostname do Supabase Storage a partir da própria URL do projeto,
// para não duplicar essa informação em mais um lugar do código (V1.1).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      ...(supabaseHostname ? [{ protocol: 'https', hostname: supabaseHostname }] : []),
    ],
  },
};

module.exports = nextConfig;
