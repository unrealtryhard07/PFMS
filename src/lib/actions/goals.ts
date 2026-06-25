'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const GoalSchema = z.object({
  name:          z.string().min(1, 'Name required').max(100),
  target_amount: z.coerce.number().positive('Target must be positive'),
  deadline:      z.string().optional().nullable(),
  color:         z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color'),
  icon:          z.string().min(1),
})

export async function createGoalAction(formData: FormData): Promise<ActionResult | void> {
  const raw = Object.fromEntries(formData)
  const parsed = GoalSchema.safeParse({ ...raw, deadline: raw['deadline'] || null })
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', user.id)
    .single()

  const { error } = await supabase.from('savings_goals').insert({
    ...parsed.data,
    user_id:  user.id,
    currency: profile?.currency ?? 'USD',
  })
  if (error) return { data: null, error: error.message }

  revalidatePath('/goals')
  revalidatePath('/')
  redirect('/goals')
}

export async function archiveGoalAction(id: string): Promise<ActionResult> {
  const supabase = createServerClient()
  const { error } = await supabase
    .from('savings_goals')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/goals')
  revalidatePath('/')
  return { data: null, error: null }
}
