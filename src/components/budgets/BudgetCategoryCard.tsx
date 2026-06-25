'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateCategoryBudgetAction } from '@/lib/actions/categories'
import { formatCurrency } from '@/lib/utils/currency'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { clsx } from 'clsx'

interface Props {
  id: string
  name: string
  color: string
  spent: number
  budget: number | null
  currency: string
}

export function BudgetCategoryCard({ id, name, color, spent, budget, currency }: Props) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(budget?.toString() ?? '')

  const pct      = budget ? Math.min(100, (spent / budget) * 100) : 0
  const barColor = pct < 75 ? 'bg-success' : pct < 100 ? 'bg-warning' : 'bg-danger'
  const txtColor = pct < 75 ? 'text-success' : pct < 100 ? 'text-warning' : 'text-danger'

  function save() {
    const parsed = parseFloat(value)
    startTransition(async () => {
      const result = await updateCategoryBudgetAction(
        id,
        isNaN(parsed) || parsed <= 0 ? null : parsed,
      )
      if (result.error) toast.error(result.error)
      else { toast.success('Budget updated'); setEditing(false) }
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium">{name}</span>
        </div>
        <Link
          href={`/transactions?category=${id}`}
          className="text-xs text-accent hover:underline"
        >
          View transactions
        </Link>
      </div>

      {budget ? (
        <>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-text-muted">Spent</span>
            <span className={clsx('font-mono font-medium', txtColor)}>
              {formatCurrency(spent, currency)} / {formatCurrency(budget, currency)}
            </span>
          </div>
          <div className="h-3 rounded-full bg-border overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all', barColor)}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-1.5">{pct.toFixed(0)}% of budget used</p>
        </>
      ) : (
        <p className="text-xs text-text-muted mb-2">
          {formatCurrency(spent, currency)} spent · No budget set
        </p>
      )}

      {editing ? (
        <div className="flex gap-2 mt-3">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="Monthly budget"
            className="h-8 text-sm"
          />
          <Button size="sm" onClick={save} disabled={isPending}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-xs text-text-muted"
          onClick={() => setEditing(true)}
        >
          {budget ? 'Edit budget' : 'Set budget'}
        </Button>
      )}
    </div>
  )
}
