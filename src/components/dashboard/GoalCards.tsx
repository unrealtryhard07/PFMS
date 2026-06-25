import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import type { GoalSummary } from '@/lib/queries/dashboard'

interface Props { goals: GoalSummary[]; currency: string }

export function GoalCards({ goals, currency }: Props) {
  if (goals.length === 0) return null
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-muted">Savings goals</h3>
        <Link href="/goals" className="text-xs text-accent hover:underline">View all</Link>
      </div>
      <div className="space-y-4">
        {goals.slice(0, 3).map((goal) => {
          const pct = Math.min(100, (goal.current / goal.target) * 100)
          return (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium">{goal.name}</span>
                <span className="text-xs font-mono text-text-muted">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: goal.color }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-text-muted">{formatCurrency(goal.current, currency)}</span>
                <span className="text-xs text-text-muted">{formatCurrency(goal.target, currency)}</span>
              </div>
              {goal.deadline && <p className="text-xs text-text-muted mt-0.5">Due {formatDate(goal.deadline)}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
