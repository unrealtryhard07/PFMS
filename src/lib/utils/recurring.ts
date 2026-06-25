import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export function getNextDueDate(current: string, frequency: string): string {
  const date = parseISO(current)
  const next =
    frequency === 'daily'   ? addDays(date, 1)   :
    frequency === 'weekly'  ? addWeeks(date, 1)  :
    frequency === 'monthly' ? addMonths(date, 1) :
    addYears(date, 1)
  return format(next, 'yyyy-MM-dd')
}

export async function processRecurringTransactions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: rules } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('next_due_date', today)

  if (!rules || rules.length === 0) return

  const { data: profile } = await supabase.from('profiles').select('currency').eq('id', userId).single()
  const currency = profile?.currency ?? 'USD'

  for (const rule of rules) {
    const amount = rule.type === 'expense' ? -Math.abs(rule.amount) : Math.abs(rule.amount)

    await supabase.from('transactions').insert({
      user_id: userId, account_id: rule.account_id,
      category_id: rule.category_id ?? null, type: rule.type,
      amount, currency, note: rule.description,
      date: rule.next_due_date, is_recurring: true, recurring_id: rule.id,
    })

    const nextDate = getNextDueDate(rule.next_due_date, rule.frequency)
    const shouldDeactivate = !!(rule.end_date && nextDate > rule.end_date)
    await supabase.from('recurring_rules')
      .update({ next_due_date: nextDate, active: !shouldDeactivate })
      .eq('id', rule.id)
  }
}
