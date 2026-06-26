'use server'
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { ActionResult } from '@/types'

const LoginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const RegisterSchema = LoginSchema.extend({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  currency:  z.string().length(3, 'Currency must be a 3-letter code'),
})

function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? 'Invalid input'
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email:    formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { data: null, error: firstError(parsed.error) }

  const supabase = createServerClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { data: null, error: error.message }
  redirect('/')
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse({
    email:     formData.get('email'),
    password:  formData.get('password'),
    full_name: formData.get('full_name'),
    currency:  formData.get('currency'),
  })
  if (!parsed.success) return { data: null, error: firstError(parsed.error) }

  const supabase = createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options:  { data: { full_name: parsed.data.full_name, currency: parsed.data.currency } },
  })

  if (error) return { data: null, error: error.message }

  if (!data.user) {
    return { data: null, error: 'Sign-up failed. If you already registered, please check your email to confirm your account, then log in.' }
  }

  if (!data.session) {
    return { data: null, error: 'Account created — check your email and click the confirmation link, then log in here.' }
  }

  await (supabase.rpc as any)('seed_default_categories', { p_user_id: data.user.id })
  redirect('/')
}

export async function logoutAction(): Promise<void> {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}
