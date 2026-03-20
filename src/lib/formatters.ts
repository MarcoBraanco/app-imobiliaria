const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(centavos: number): string {
  return currencyFormatter.format(centavos / 100)
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(',', '.')
  return Math.round(parseFloat(cleaned) * 100) || 0
}

export function formatDate(timestamp: { seconds: number }): string {
  return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
