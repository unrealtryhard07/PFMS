'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { CategorySpending } from '@/lib/queries/dashboard'

interface Props { data: CategorySpending[]; currency: string }

export function SpendingDonut({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-muted mb-4">Spending by category</h3>
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">No expenses this month</div>
      </div>
    )
  }
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-muted mb-4">Spending by category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
          <Legend formatter={(value) => <span className="text-xs text-text-muted">{value}</span>} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
