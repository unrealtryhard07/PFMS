import { createServerClient } from '@/lib/supabase/server'
import { processRecurringTransactions } from '@/lib/utils/recurring'
import { getDashboardData } from '@/lib/queries/dashboard'
import { SummaryBar }          from '@/components/dashboard/SummaryBar'
import { BudgetProgress }      from '@/components/dashboard/BudgetProgress'
import { GoalCards }           from '@/components/dashboard/GoalCards'
import { RecentTransactions }  from '@/components/dashboard/RecentTransactions'
import { SpendingDonut }       from '@/components/charts/SpendingDonut'
import { IncomeVsExpensesBar } from '@/components/charts/IncomeVsExpensesBar'
import { NetWorthLine }        from '@/components/charts/NetWorthLine'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  await processRecurringTransactions(supabase, user.id)
  const data = await getDashboardData(supabase, user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      <SummaryBar totalIncome={data.totalIncome} totalExpenses={data.totalExpenses} netSavings={data.netSavings} currency={data.currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingDonut data={data.categorySpending} currency={data.currency} />
        <IncomeVsExpensesBar data={data.monthlyTrend} currency={data.currency} />
      </div>

      <NetWorthLine data={data.netWorthTrend} currency={data.currency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetProgress items={data.budgetProgress} currency={data.currency} />
        <GoalCards goals={data.goalSummaries} currency={data.currency} />
      </div>

      <RecentTransactions transactions={data.recentTransactions} currency={data.currency} />
    </div>
  )
}
