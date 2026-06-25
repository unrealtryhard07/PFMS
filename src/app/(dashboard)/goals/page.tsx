import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { GoalCard } from '@/components/goals/GoalCard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getMonthlyAverage, getProjectedCompletion } from '@/lib/utils/goals'

export default async function GoalsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: goals }, { data: goalTx }] = await Promise.all([
    supabase.from('profiles').select('currency').eq('id', user!.id).single(),
    supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', user!.id)
      .is('archived_at', null)
      .order('created_at'),
    supabase
      .from('transactions')
      .select('goal_id,amount,date')
      .eq('user_id', user!.id)
      .not('goal_id', 'is', null),
  ])

  const currency = profile?.currency ?? 'USD'

  const txByGoal: Record<string, { amount: number; date: string }[]> = {}
  for (const tx of (goalTx ?? [])) {
    if (!txByGoal[tx.goal_id!]) txByGoal[tx.goal_id!] = []
    txByGoal[tx.goal_id!]!.push({ amount: tx.amount, date: tx.date })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Savings Goals</h1>
        <Link href="/goals/new">
          <Button><Plus size={16} className="mr-2" />New goal</Button>
        </Link>
      </div>

      {(goals ?? []).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted mb-4">No goals yet. Start saving towards something.</p>
          <Link href="/goals/new"><Button>Create first goal</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(goals ?? []).map((goal) => {
            const txs        = txByGoal[goal.id] ?? []
            const current    = txs.reduce((s, t) => s + Math.abs(t.amount), 0)
            const monthlyAvg = getMonthlyAverage(txs)
            const projected  = getProjectedCompletion(current, Number(goal.target_amount), monthlyAvg)
            return (
              <GoalCard
                key={goal.id}
                id={goal.id}
                name={goal.name}
                color={goal.color}
                current={current}
                target={Number(goal.target_amount)}
                deadline={goal.deadline}
                currency={currency}
                projectedCompletion={projected}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
