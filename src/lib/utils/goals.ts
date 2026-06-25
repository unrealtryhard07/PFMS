import { addMonths, format } from 'date-fns'

export function getMonthlyAverage(
  transactions: { amount: number; date: string }[],
): number {
  if (transactions.length === 0) return 0
  const total  = transactions.reduce((s, t) => s + Math.abs(t.amount), 0)
  const months = new Set(transactions.map((t) => t.date.slice(0, 7))).size
  return total / Math.max(1, months)
}

export function getProjectedCompletion(
  current: number,
  target: number,
  monthlyAvg: number,
): string | null {
  if (current >= target || monthlyAvg <= 0) return null
  const monthsNeeded = Math.ceil((target - current) / monthlyAvg)
  return format(addMonths(new Date(), monthsNeeded), 'yyyy-MM')
}
