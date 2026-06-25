export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string; avatar_url: string | null; currency: string; created_at: string }
        Insert: { id: string; full_name?: string; avatar_url?: string | null; currency?: string; created_at?: string }
        Update: { id?: string; full_name?: string; avatar_url?: string | null; currency?: string; created_at?: string }
        Relationships: []
      }
      accounts: {
        Row: { id: string; user_id: string; name: string; type: 'cash'|'bank'|'credit'|'savings'|'investment'; starting_balance: number; color: string; icon: string; archived_at: string|null; created_at: string }
        Insert: { id?: string; user_id: string; name: string; type?: 'cash'|'bank'|'credit'|'savings'|'investment'; starting_balance?: number; color?: string; icon?: string; archived_at?: string|null; created_at?: string }
        Update: { id?: string; user_id?: string; name?: string; type?: 'cash'|'bank'|'credit'|'savings'|'investment'; starting_balance?: number; color?: string; icon?: string; archived_at?: string|null; created_at?: string }
        Relationships: []
      }
      categories: {
        Row: { id: string; user_id: string|null; name: string; icon: string; color: string; type: 'income'|'expense'; monthly_budget: number|null; archived_at: string|null; created_at: string }
        Insert: { id?: string; user_id?: string|null; name: string; icon?: string; color?: string; type: 'income'|'expense'; monthly_budget?: number|null; archived_at?: string|null; created_at?: string }
        Update: { id?: string; user_id?: string|null; name?: string; icon?: string; color?: string; type?: 'income'|'expense'; monthly_budget?: number|null; archived_at?: string|null; created_at?: string }
        Relationships: []
      }
      transactions: {
        Row: { id: string; user_id: string; account_id: string; category_id: string|null; goal_id: string|null; type: 'income'|'expense'|'transfer'; amount: number; currency: string; note: string; date: string; is_recurring: boolean; recurring_id: string|null; transfer_pair_id: string|null; import_id: string|null; created_at: string }
        Insert: { id?: string; user_id: string; account_id: string; category_id?: string|null; goal_id?: string|null; type: 'income'|'expense'|'transfer'; amount: number; currency?: string; note?: string; date?: string; is_recurring?: boolean; recurring_id?: string|null; transfer_pair_id?: string|null; import_id?: string|null; created_at?: string }
        Update: { id?: string; user_id?: string; account_id?: string; category_id?: string|null; goal_id?: string|null; type?: 'income'|'expense'|'transfer'; amount?: number; currency?: string; note?: string; date?: string; is_recurring?: boolean; recurring_id?: string|null; transfer_pair_id?: string|null; import_id?: string|null; created_at?: string }
        Relationships: []
      }
      recurring_rules: {
        Row: { id: string; user_id: string; account_id: string; category_id: string|null; type: 'income'|'expense'|'transfer'; amount: number; description: string; frequency: 'daily'|'weekly'|'monthly'|'yearly'; start_date: string; next_due_date: string; end_date: string|null; active: boolean; created_at: string }
        Insert: { id?: string; user_id: string; account_id: string; category_id?: string|null; type: 'income'|'expense'|'transfer'; amount: number; description?: string; frequency: 'daily'|'weekly'|'monthly'|'yearly'; start_date: string; next_due_date: string; end_date?: string|null; active?: boolean; created_at?: string }
        Update: { id?: string; user_id?: string; account_id?: string; category_id?: string|null; type?: 'income'|'expense'|'transfer'; amount?: number; description?: string; frequency?: 'daily'|'weekly'|'monthly'|'yearly'; start_date?: string; next_due_date?: string; end_date?: string|null; active?: boolean; created_at?: string }
        Relationships: []
      }
      savings_goals: {
        Row: { id: string; user_id: string; name: string; target_amount: number; currency: string; deadline: string|null; color: string; icon: string; archived_at: string|null; created_at: string }
        Insert: { id?: string; user_id: string; name: string; target_amount: number; currency?: string; deadline?: string|null; color?: string; icon?: string; archived_at?: string|null; created_at?: string }
        Update: { id?: string; user_id?: string; name?: string; target_amount?: number; currency?: string; deadline?: string|null; color?: string; icon?: string; archived_at?: string|null; created_at?: string }
        Relationships: []
      }
      import_sessions: {
        Row: { id: string; user_id: string; filename: string; row_count: number; imported_at: string }
        Insert: { id?: string; user_id: string; filename: string; row_count?: number; imported_at?: string }
        Update: { id?: string; user_id?: string; filename?: string; row_count?: number; imported_at?: string }
        Relationships: []
      }
    }
    Views: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
    Functions: {
      seed_default_categories: { Args: { p_user_id: string }; Returns: undefined }
    }
  }
}
