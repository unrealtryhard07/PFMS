'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const AccountSchema = z.object({
  name:             z.string().min(1, 'Name required').max(50),
  type:             z.enum(['cash','bank','credit','savings','investment']),
  starting_balance: z.coerce.number(),
  color:            z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
  icon:             z.string().min(1),
})

export async function createAccountAction(formData: FormData): Promise<ActionResult> {
  const parsed = AccountSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase.from('accounts').insert({ ...parsed.data, user_id: user.id })
  if (error) return { data: null, error: error.message }

  revalidatePath('/settings/accounts')
  return { data: null, error: null }
}

export async function archiveAccountAction(id: string): Promise<ActionResult> {
  const supabase = createServerClient()
  const { error } = await supabase.from('accounts').update({ archived_at: new Date().toISOString() }).eq('id', id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/settings/accounts')
  return { data: null, error: null }
}
