'use client'
import { useState, useTransition } from 'react'
import { deleteTransactionAction, bulkDeleteTransactionsAction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Trash2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { Transaction, Category, Account } from '@/types'

interface Props { transactions: Transaction[]; categories: Category[]; accounts: Account[]; currency: string }

export function TransactionList({ transactions, categories, accounts, currency }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const accMap = Object.fromEntries(accounts.map((a)  => [a.id, a]))

  function toggle(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const r = await deleteTransactionAction(id)
      if (r.error) toast.error(r.error); else toast.success('Deleted')
    })
  }

  function handleBulkDelete() {
    startTransition(async () => {
      const r = await bulkDeleteTransactionsAction(Array.from(selected))
      if (r.error) toast.error(r.error); else { toast.success(`${selected.size} deleted`); setSelected(new Set()) }
    })
  }

  if (transactions.length === 0) {
    return <p className="text-center text-text-muted py-12">No transactions found.</p>
  }

  return (
    <div className="space-y-2">
      {selected.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
          <span className="text-sm text-text-muted">{selected.size} selected</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete} disabled={isPending}>Delete selected</Button>
        </div>
      )}
      {transactions.map((tx) => {
        const cat = tx.category_id ? catMap[tx.category_id] : null
        const acc = accMap[tx.account_id]
        const isPos = tx.amount > 0
        return (
          <div key={tx.id} className={clsx(
            'flex items-center gap-4 p-4 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors',
            selected.has(tx.id) && 'border-accent/50'
          )}>
            <input type="checkbox" checked={selected.has(tx.id)} onChange={() => toggle(tx.id)} className="rounded" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{tx.note || cat?.name || 'Transaction'}</span>
                {cat && (
                  <Badge variant="secondary" className="text-xs shrink-0" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                    {cat.name}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted mt-0.5">{formatDate(tx.date)} · {acc?.name ?? 'Unknown'}</p>
            </div>
            <span className={clsx('font-mono font-medium tabular-nums shrink-0', isPos ? 'text-success' : 'text-danger')}>
              {isPos ? '+' : ''}{formatCurrency(Math.abs(tx.amount), currency)}
            </span>
            <Button variant="ghost" size="icon" className="text-text-muted hover:text-danger shrink-0"
              onClick={() => handleDelete(tx.id)} disabled={isPending}>
              <Trash2 size={16} />
            </Button>
          </div>
        )
      })}
    </div>
  )
}
