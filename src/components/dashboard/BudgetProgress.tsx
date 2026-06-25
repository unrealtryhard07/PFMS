import { formatCurrency } from '@/lib/utils/currency'
import { clsx } from 'clsx'
import type { BudgetItem } from '@/lib/queries/dashboard'

interface Props { items: BudgetItem[]; currency: string }

export function BudgetProgress({ items, currency }: Props) {
  if (items.length === 0) return null
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-muted mb-4">Budget progress</h3>
      <div className="space-y-4">
        {items.map((item) => {
          const pct      = Math.min(100, (item.spent / item.budget) * 100)
          const barColor = pct < 75 ? 'bg-success' : pct < 100 ? 'bg-warning' : 'bg-danger'
          const txtColor = pct < 75 ? 'text-success' : pct < 100 ? 'text-warning' : 'text-danger'
          return (
            <div key={item.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className={clsx('text-xs font-mono', txtColor)}>
                  {formatCurrency(item.spent, currency)} / {formatCurrency(item.budget, currency)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-border overflow-hidden">
                <div className={clsx('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
