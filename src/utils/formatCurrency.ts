export function formatCurrency(amount?: number | null, fallback = '-'): string {
  if (amount == null) return fallback
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
