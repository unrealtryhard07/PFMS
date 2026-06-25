'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import type { MonthlyBar } from '@/lib/queries/dashboard'

interface Props { data: MonthlyBar[]; currency: string }

export function IncomeVsExpensesBar({ data, currency }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-sm font-medium text-text-muted mb-4">Income vs Expenses — last 6 months</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
            tickFormatter={(v) => formatCurrency(v as number, currency).replace(/\.00$/, '')} width={70} />
          <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
            formatter={(v) => formatCurrency(Number(v ?? 0), currency)} />
          <Legend formatter={(v) => <span className="text-xs text-text-muted capitalize">{v}</span>} />
          <Bar dataKey="income"   name="Income"   fill="var(--success)" radius={[4,4,0,0]} />
          <Bar dataKey="expenses" name="Expenses" fill="var(--danger)"  radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
