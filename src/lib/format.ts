// Utilitários de formatação compartilhados entre componentes públicos e admin.
// Antes existiam duas implementações idênticas de formatPrice (ProductCard e
// a página de produto) — centralizado aqui para não repetir de novo agora que
// o dashboard também precisa formatar preço em vários lugares.

export function formatPrice(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
