/**
 * Formateador unificado y compacto de precios en Pesos Colombianos (COP)
 * Utiliza siempre el formato limpio "$129.000" sin textos largos como "COP $"
 * para evitar colisiones y superposiciones en pantallas de celulares.
 */
export function formatPrice(amount) {
  const num = Number(amount) || 0;
  return `$${Math.round(num).toLocaleString('es-CO')}`;
}
