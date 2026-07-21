import { getSiteSettings } from '@/lib/site-settings';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function ConfiguracoesPage() {
  const settings = getSiteSettings();

  return (
    <div>
      <h1 className="mb-8 text-2xl tracking-tight text-sarong-black">Configurações do site</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
