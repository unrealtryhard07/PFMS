import { createServerClient } from '@/lib/supabase/server'
import { BudgetCategoryCard } from '@/components/budgets/BudgetCategoryCard'
import { getMonthRange } from '@/lib/utils/dates'

export default async function BudgetsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { from, to } = getMonthRange()

  const [{ data: profile }, { data: categories }, { data: transactions }] = await Promise.all([
    supabase.from('profiles').select('currency').eq('id', user!.id).single(),
    supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${user!.id},user_id.is.null`)
      .eq('type', 'expense')
      .is('archived_at', null)
      .order('name'),
    supabase
      .from('transactions')
      .select('category_id,amount')
      .eq('user_id', user!.id)
      .lt('amount', 0)
      .gte('date', from)
      .lte('date', to),
  ])

  const currency = profile?.currency ?? 'USD'

  const spentByCategory: Record<string, number> = {}
  for (const tx of (transactions ?? [])) {
    if (tx.category_id) {
      spentByCategory[tx.category_id] =
        (spentByCategory[tx.category_id] ?? 0) + Math.abs(Number(tx.amount))
    }
  }

  const currentMonth = new Date().toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Budgets</h1>
        <p className="text-text-muted text-sm mt-1">{currentMonth}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(categories ?? []).map((cat) => (
          <BudgetCategoryCard
            key={cat.id}
            id={cat.id}
            name={cat.name}
            color={cat.color}
            spent={spentByCategory[cat.id] ?? 0}
            budget={cat.monthly_budget ? Number(cat.monthly_budget) : null}
            currency={currency}
          />
        ))}
        {(categories ?? []).length === 0 && (
          <p className="text-text-muted text-sm col-span-2 text-center py-12">
            No expense categories yet. Add some in Settings → Categories.
          </p>
        )}
      </div>
    </div>
  )
}
