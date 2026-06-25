import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { clsx } from 'clsx'

interface RecentTx { id: string; note: string; amount: number; date: string; category_name: string | null; category_color: string | null; account_name: string }
interface Props { transactions: RecentTx[]; currency: string }

export function RecentTransactions({ transactions, currency }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-muted">Recent transactions</h3>
        <Link href="/transactions/new" className="text-xs text-accent hover:underline">+ Add</Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">No transactions yet.</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{tx.note || tx.category_name || 'Transaction'}</p>
                <p className="text-xs text-text-muted">{formatDate(tx.date)} · {tx.account_name}</p>
              </div>
              <span className={clsx('font-mono text-sm font-medium ml-4 shrink-0', tx.amount > 0 ? 'text-success' : 'text-danger')}>
                {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount), currency)}
              </span>
            </div>
          ))}
        </div>
      )}
      <Link href="/transactions" className="block mt-4 text-xs text-center text-accent hover:underline">View all</Link>
    </div>
  )
}
