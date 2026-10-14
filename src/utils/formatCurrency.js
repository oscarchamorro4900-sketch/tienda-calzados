/**
 * Formateador inteligente de precios para diversas monedas (COP, MXN, USD, EUR, etc.)
 */
export function formatPrice(amount, currency = "$") {
  const num = Number(amount) || 0;

  // En Pesos Colombianos (COP), Chilenos (CLP) o enteros grandes no se usan decimales
  if (currency.includes("COP") || currency.includes("CLP") || (Number.isInteger(num) && num >= 500)) {
    return `${currency}${Math.round(num).toLocaleString('es-CO')}`;
  }

  // Monedas con centavos como USD, EUR, MXN, Soles
  return `${currency}${num.toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
