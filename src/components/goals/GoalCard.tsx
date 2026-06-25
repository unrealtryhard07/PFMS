'use client'
import Link from 'next/link'
import { useTransition } from 'react'
import { archiveGoalAction } from '@/lib/actions/goals'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/dates'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'

interface Props {
  id: string
  name: string
  color: string
  current: number
  target: number
  deadline: string | null
  currency: string
  projectedCompletion: string | null
}

export function GoalCard({
  id, name, color, current, target, deadline, currency, projectedCompletion,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const pct       = Math.min(100, (current / target) * 100)
  const chartData = [{ value: pct, fill: color }]

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveGoalAction(id)
      if (result.error) toast.error(result.error)
      else toast.success('Goal archived')
    })
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          {deadline && (
            <p className="text-xs text-text-muted mt-0.5">Due {formatDate(deadline)}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-text-muted hover:text-danger"
          onClick={handleArchive}
          disabled={isPending}
        >
          Archive
        </Button>
      </div>

      <div className="flex items-center gap-6">
        <div className="w-24 h-24 relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="70%" outerRadius="100%"
              barSize={8}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                dataKey="value"
                background={{ fill: 'var(--border)' }}
                cornerRadius={4}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold font-mono">{pct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Saved</span>
              <span className="font-mono">{formatCurrency(current, currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Target</span>
              <span className="font-mono">{formatCurrency(target, currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Remaining</span>
              <span className="font-mono">{formatCurrency(Math.max(0, target - current), currency)}</span>
            </div>
            {projectedCompletion && (
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">On track for</span>
                <span className="font-mono text-accent">{projectedCompletion}</span>
              </div>
            )}
          </div>
          <Link href={`/transactions/new?goal_id=${id}`}>
            <Button size="sm" className="mt-3 w-full" style={{ backgroundColor: color }}>
              Contribute
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
