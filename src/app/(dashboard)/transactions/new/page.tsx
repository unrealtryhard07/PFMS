import { createServerClient } from '@/lib/supabase/server'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { Card, CardContent } from '@/components/ui/card'

export default async function NewTransactionPage({ searchParams }: { searchParams: Promise<{ goal_id?: string }> }) {
  const { goal_id } = await searchParams
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: accounts }, { data: categories }, { data: goals }] = await Promise.all([
    supabase.from('accounts').select('*').is('archived_at', null).order('name'),
    supabase.from('categories').select('*').or(`user_id.eq.${user!.id},user_id.is.null`).is('archived_at', null).order('name'),
    supabase.from('savings_goals').select('*').is('archived_at', null).order('name'),
  ])

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add transaction</h1>
      <Card className="bg-surface border-border">
        <CardContent className="pt-6">
          <TransactionForm
            accounts={accounts ?? []} categories={categories ?? []} goals={goals ?? []}
            defaultGoalId={goal_id}
          />
        </CardContent>
      </Card>
    </div>
  )
}
