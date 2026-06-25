import { formatCurrency } from '@/lib/utils/currency'
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'

interface Props { totalIncome: number; totalExpenses: number; netSavings: number; currency: string }

export function SummaryBar({ totalIncome, totalExpenses, netSavings, currency }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: 'Income',      value: totalIncome,   color: 'text-success', Icon: TrendingUp  },
        { label: 'Expenses',    value: totalExpenses, color: 'text-danger',  Icon: TrendingDown },
        { label: 'Net savings', value: netSavings,    color: netSavings >= 0 ? 'text-success' : 'text-danger', Icon: Wallet },
      ].map(({ label, value, color, Icon }) => (
        <div key={label} className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Icon size={18} className={color} />
            <span className="text-sm font-medium text-text-muted">{label}</span>
          </div>
          <p className={`text-2xl font-mono font-bold ${color}`}>{formatCurrency(value, currency)}</p>
        </div>
      ))}
    </div>
  )
}
