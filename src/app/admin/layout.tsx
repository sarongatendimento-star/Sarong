export const metadata = {
  robots: { index: false, follow: false }, // Painel nunca deve ser indexado pelo Google
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-sarong-off">{children}</div>;
}
