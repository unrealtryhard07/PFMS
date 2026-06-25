import type { Database } from '@/lib/supabase/types'

export type Profile       = Database['public']['Tables']['profiles']['Row']
export type Account       = Database['public']['Tables']['accounts']['Row']
export type Category      = Database['public']['Tables']['categories']['Row']
export type Transaction   = Database['public']['Tables']['transactions']['Row']
export type RecurringRule = Database['public']['Tables']['recurring_rules']['Row']
export type SavingsGoal   = Database['public']['Tables']['savings_goals']['Row']
export type ImportSession = Database['public']['Tables']['import_sessions']['Row']

export type AccountType         = 'cash' | 'bank' | 'credit' | 'savings' | 'investment'
export type CategoryType        = 'income' | 'expense'
export type TransactionType     = 'income' | 'expense' | 'transfer'
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type ActionResult<T = null> =
  | { data: T; error: null }
  | { data: null; error: string }
