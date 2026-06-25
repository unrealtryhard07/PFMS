import { getMonthRange, getLastNMonths } from '@/lib/utils/dates'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export interface CategorySpending { name: string; color: string; value: number }
export interface MonthlyBar       { month: string; label: string; income: number; expenses: number }
export interface BudgetItem       { id: string; name: string; color: string; spent: number; budget: number }
export interface GoalSummary      { id: string; name: string; color: string; icon: string; current: number; target: number; deadline: string | null }
export interface NetWorthPoint    { month: string; label: string; balance: number }

export interface DashboardData {
  currency: string
  totalIncome: number; totalExpenses: number; netSavings: number
  categorySpending: CategorySpending[]
  monthlyTrend: MonthlyBar[]
  budgetProgress: BudgetItem[]
  goalSummaries: GoalSummary[]
  recentTransactions: Array<{ id: string; note: string; amount: number; date: string; category_name: string | null; category_color: string | null; account_name: string }>
  netWorthTrend: NetWorthPoint[]
}

export async function getDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardData> {
  const { from, to } = getMonthRange()
  const months = getLastNMonths(6)

  const [
    { data: profile },
    { data: monthlyTx },
    { data: categories },
    { data: accounts },
    { data: goals },
    { data: recentTx },
    { data: allTx },
    { data: goalTx },
  ] = await Promise.all([
    supabase.from('profiles').select('currency').eq('id', userId).single(),
    supabase.from('transactions').select('*').gte('date', from).lte('date', to),
    supabase.from('categories').select('*').or(`user_id.eq.${userId},user_id.is.null`).is('archived_at', null),
    supabase.from('accounts').select('id,name,starting_balance').is('archived_at', null),
    supabase.from('savings_goals').select('*').is('archived_at', null),
    supabase.from('transactions').select('id,note,amount,date,category_id,account_id').order('date', { ascending: false }).limit(10),
    supabase.from('transactions').select('amount,date').order('date'),
    supabase.from('transactions').select('goal_id,amount').not('goal_id', 'is', null),
  ])

  const currency = profile?.currency ?? 'USD'
  const catMap   = Object.fromEntries((categories ?? []).map((c) => [c.id, c]))
  const accMap   = Object.fromEntries((accounts   ?? []).map((a) => [a.id, a]))

  const totalIncome   = (monthlyTx ?? []).filter((t) => t.amount > 0).reduce((s, t) => s + Number(t.amount), 0)
  const totalExpenses = (monthlyTx ?? []).filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
  const netSavings    = totalIncome - totalExpenses

  const catTotals: Record<string, number> = {}
  for (const tx of (monthlyTx ?? []).filter((t) => t.amount < 0 && t.category_id)) {
    catTotals[tx.category_id!] = (catTotals[tx.category_id!] ?? 0) + Math.abs(Number(tx.amount))
  }

  const categorySpending: CategorySpending[] = Object.entries(catTotals)
    .map(([id, value]) => ({ name: catMap[id]?.name ?? 'Other', color: catMap[id]?.color ?? '#64748b', value }))
    .sort((a, b) => b.value - a.value).slice(0, 8)

  const monthlyTrend: MonthlyBar[] = months.map(({ month, label }) => {
    const txs = (allTx ?? []).filter((t) => t.date.startsWith(month + '-'))
    return {
      month, label,
      income:   txs.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0),
      expenses: txs.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
    }
  })

  const budgetProgress: BudgetItem[] = (categories ?? [])
    .filter((c) => c.type === 'expense' && c.monthly_budget)
    .map((c) => ({ id: c.id, name: c.name, color: c.color, spent: catTotals[c.id] ?? 0, budget: Number(c.monthly_budget) }))

  const goalTotals: Record<string, number> = {}
  for (const tx of (goalTx ?? [])) {
    goalTotals[tx.goal_id!] = (goalTotals[tx.goal_id!] ?? 0) + Math.abs(Number(tx.amount))
  }

  const goalSummaries: GoalSummary[] = (goals ?? []).map((g) => ({
    id: g.id, name: g.name, color: g.color, icon: g.icon,
    current: goalTotals[g.id] ?? 0, target: Number(g.target_amount), deadline: g.deadline,
  }))

  const recentTransactions = (recentTx ?? []).map((tx) => ({
    id: tx.id, note: tx.note ?? '', amount: Number(tx.amount), date: tx.date,
    category_name:  tx.category_id ? (catMap[tx.category_id]?.name  ?? null) : null,
    category_color: tx.category_id ? (catMap[tx.category_id]?.color ?? null) : null,
    account_name: accMap[tx.account_id]?.name ?? 'Unknown',
  }))

  let running = (accounts ?? []).reduce((s, a) => s + Number(a.starting_balance), 0)
  const netWorthTrend: NetWorthPoint[] = months.map(({ month, label }) => {
    const delta = (allTx ?? []).filter((t) => t.date.startsWith(month + '-')).reduce((s, t) => s + Number(t.amount), 0)
    running += delta
    return { month, label, balance: running }
  })

  return { currency, totalIncome, totalExpenses, netSavings, categorySpending, monthlyTrend, budgetProgress, goalSummaries, recentTransactions, netWorthTrend }
}
