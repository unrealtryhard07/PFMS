'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const SUPPORTED_CURRENCIES = [
  'USD','EUR','GBP','KWD','SAR','AED','QAR','BHD','OMR','EGP',
]

const ProfileSchema = z.object({
  full_name: z.string().min(1, 'Name required').max(100),
  currency:  z.string().refine(
    (c) => SUPPORTED_CURRENCIES.includes(c),
    'Unsupported currency',
  ),
})

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { data: null, error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update(parsed.data)
    .eq('id', user.id)
  if (error) return { data: null, error: error.message }

  revalidatePath('/settings')
  revalidatePath('/')
  return { data: null, error: null }
}
