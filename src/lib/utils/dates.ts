import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return format(d, 'MMM d, yyyy')
}

export function getMonthRange(date: Date = new Date()): { from: string; to: string } {
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to:   format(endOfMonth(date),   'yyyy-MM-dd'),
  }
}

export function getLastNMonths(n: number): { month: string; label: string }[] {
  return Array.from({ length: n }, (_, i) => {
    const d = subMonths(new Date(), n - 1 - i)
    return { month: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') }
  })
}
