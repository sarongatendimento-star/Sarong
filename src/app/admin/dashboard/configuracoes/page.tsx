import { getSiteSettings } from '@/lib/site-settings';
import SettingsForm from '@/components/admin/SettingsForm';

// Sem cache: painel administrativo precisa refletir o banco em tempo real.
export const revalidate = 0;

export default async function ConfiguracoesPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="mb-8 text-2xl tracking-tight text-sarong-black">Configurações do site</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
