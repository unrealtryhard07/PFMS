'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const CategorySchema = z.object({
  name:           z.string().min(1).max(50),
  type:           z.enum(['income','expense']),
  icon:           z.string().min(1),
  color:          z.string().regex(/^#[0-9a-fA-F]{6}$/),
  monthly_budget: z.coerce.number().optional().nullable(),
})

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  const parsed = CategorySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase.from('categories').insert({ ...parsed.data, user_id: user.id })
  if (error) return { data: null, error: error.message }

  revalidatePath('/settings/categories')
  return { data: null, error: null }
}

export async function updateCategoryBudgetAction(id: string, budget: number | null): Promise<ActionResult> {
  const supabase = createServerClient()
  const { error } = await supabase.from('categories').update({ monthly_budget: budget }).eq('id', id)
  if (error) return { data: null, error: error.message }
  revalidatePath('/settings/categories')
  revalidatePath('/budgets')
  return { data: null, error: null }
}

export async function archiveCategoryAction(id: string, _fd: FormData): Promise<void> {
  const supabase = createServerClient()
  await supabase.from('categories').update({ archived_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/settings/categories')
}
