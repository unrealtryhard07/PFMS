export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function parseCurrencyInput(value: string): number {
  if (!value) return 0
  return parseFloat(value.replace(/,/g, '')) || 0
}
