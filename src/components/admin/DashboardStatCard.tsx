interface DashboardStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
}

// Card de métrica único, reutilizado em todos os números do resumo do
// Dashboard — evita repetir a mesma marcação 4-5 vezes na página.
export default function DashboardStatCard({ label, value, hint }: DashboardStatCardProps) {
  return (
    <div className="border border-sarong-black/10 p-6">
      <p className="text-xs uppercase tracking-widest2 text-sarong-black/50">{label}</p>
      <p className="mt-3 text-3xl text-sarong-black">{value}</p>
      {hint && <p className="mt-1 text-xs text-sarong-black/40">{hint}</p>}
    </div>
  );
}
