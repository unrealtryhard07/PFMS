'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const TransactionSchema = z.object({
  type:          z.enum(['income','expense','transfer']),
  amount:        z.coerce.number().positive('Amount must be positive'),
  account_id:    z.string().uuid('Select an account'),
  to_account_id: z.string().uuid().optional(),
  category_id:   z.string().uuid().optional().nullable(),
  goal_id:       z.string().uuid().optional().nullable(),
  note:          z.string().max(200).default(''),
  date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  is_recurring:  z.coerce.boolean().default(false),
  frequency:     z.enum(['daily','weekly','monthly','yearly']).optional(),
})

export async function addTransactionAction(formData: FormData): Promise<ActionResult> {
  const raw = Object.fromEntries(formData)
  const parsed = TransactionSchema.safeParse({
    ...raw,
    category_id:   raw['category_id']   || null,
    goal_id:       raw['goal_id']        || null,
    to_account_id: raw['to_account_id']  || undefined,
  })
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
  const currency = profile?.currency ?? 'USD'

  if (parsed.data.type === 'transfer') {
    if (!parsed.data.to_account_id) return { data: null, error: 'Destination account required for transfers' }
    const pairId = crypto.randomUUID()
    const { error } = await supabase.from('transactions').insert([
      { user_id: user.id, account_id: parsed.data.account_id,    type: 'transfer', amount: -Math.abs(parsed.data.amount), currency, note: parsed.data.note, date: parsed.data.date, transfer_pair_id: pairId },
      { user_id: user.id, account_id: parsed.data.to_account_id, type: 'transfer', amount:  Math.abs(parsed.data.amount), currency, note: parsed.data.note, date: parsed.data.date, transfer_pair_id: pairId },
    ])
    if (error) return { data: null, error: error.message }
  } else {
    const amount = parsed.data.type === 'expense' ? -Math.abs(parsed.data.amount) : Math.abs(parsed.data.amount)
    const { error } = await supabase.from('transactions').insert({
      user_id: user.id, account_id: parsed.data.account_id,
      category_id: parsed.data.category_id ?? null, goal_id: parsed.data.goal_id ?? null,
      type: parsed.data.type, amount, currency, note: parsed.data.note, date: parsed.data.date,
      is_recurring: parsed.data.is_recurring,
    })
    if (error) return { data: null, error: error.message }

    if (parsed.data.is_recurring && parsed.data.frequency) {
      await supabase.from('recurring_rules').insert({
        user_id: user.id, account_id: parsed.data.account_id,
        category_id: parsed.data.category_id ?? null, type: parsed.data.type,
        amount: Math.abs(parsed.data.amount), description: parsed.data.note,
        frequency: parsed.data.frequency, start_date: parsed.data.date, next_due_date: parsed.data.date,
      })
    }
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  redirect('/transactions')
}

export async function deleteTransactionAction(id: string): Promise<ActionResult> {
  const supabase = createServerClient()
  const { data: tx } = await supabase.from('transactions').select('transfer_pair_id').eq('id', id).single()
  if (tx?.transfer_pair_id) {
    const { error } = await supabase.from('transactions').delete().eq('transfer_pair_id', tx.transfer_pair_id)
    if (error) return { data: null, error: error.message }
  } else {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) return { data: null, error: error.message }
  }
  revalidatePath('/transactions')
  revalidatePath('/')
  return { data: null, error: null }
}

export async function bulkDeleteTransactionsAction(ids: string[]): Promise<ActionResult> {
  if (ids.length === 0) return { data: null, error: null }
  const supabase = createServerClient()
  const { error } = await supabase.from('transactions').delete().in('id', ids)
  if (error) return { data: null, error: error.message }
  revalidatePath('/transactions')
  revalidatePath('/')
  return { data: null, error: null }
}
