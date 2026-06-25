'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const RowSchema = z.object({
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  amount:      z.coerce.number().finite(),
  description: z.string().max(500),
  type:        z.enum(['income', 'expense']),
  account_id:  z.string().uuid('Invalid account'),
  category_id: z.string().uuid().optional().nullable(),
})

const ImportSchema = z.object({
  rows: z.string().transform((s, ctx) => {
    try { return JSON.parse(s) as unknown[] }
    catch { ctx.addIssue({ code: 'custom', message: 'Invalid JSON' }); return z.NEVER }
  }),
  filename: z.string().min(1),
})

export async function importTransactionsAction(
  formData: FormData,
): Promise<ActionResult<{ imported: number }>> {
  const raw = ImportSchema.safeParse(Object.fromEntries(formData))
  if (!raw.success) return { data: null, error: raw.error.issues[0]?.message ?? 'Invalid payload' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { filename, rows: rawRows } = raw.data

  const parsedRows = z.array(RowSchema).safeParse(rawRows)
  if (!parsedRows.success) {
    return { data: null, error: `Row validation failed: ${parsedRows.error.issues[0]?.message}` }
  }

  const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
  const currency = profile?.currency ?? 'USD'

  const { data: session, error: sessionError } = await supabase
    .from('import_sessions')
    .insert({ user_id: user.id, filename, row_count: parsedRows.data.length })
    .select('id')
    .single()
  if (sessionError) return { data: null, error: sessionError.message }

  const txRows = parsedRows.data.map((r) => ({
    user_id:      user.id,
    account_id:   r.account_id,
    category_id:  r.category_id ?? null,
    goal_id:      null,
    type:         r.type,
    amount:       r.type === 'expense' ? -Math.abs(r.amount) : Math.abs(r.amount),
    currency,
    note:         r.description,
    date:         r.date,
    is_recurring: false,
    import_id:    session.id,
  }))

  const { error: insertError } = await supabase.from('transactions').insert(txRows)
  if (insertError) {
    await supabase.from('import_sessions').delete().eq('id', session.id)
    return { data: null, error: insertError.message }
  }

  revalidatePath('/transactions')
  revalidatePath('/')
  return { data: { imported: txRows.length }, error: null }
}
