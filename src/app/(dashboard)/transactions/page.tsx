import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionFilters } from '@/components/transactions/TransactionFilters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

const PAGE_SIZE = 50

interface PageProps { searchParams: Promise<{ q?: string; type?: string; account?: string; category?: string; page?: string }> }

export default async function TransactionsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const page = Math.max(1, parseInt(sp.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const [{ data: profile }, { data: accounts }, { data: categories }] = await Promise.all([
    supabase.from('profiles').select('currency').eq('id', user!.id).single(),
    supabase.from('accounts').select('*').is('archived_at', null).order('name'),
    supabase.from('categories').select('*').or(`user_id.eq.${user!.id},user_id.is.null`).is('archived_at', null).order('name'),
  ])

  let query = supabase.from('transactions').select('*', { count: 'exact' }).order('date', { ascending: false }).range(from, to)
  if (sp.q)        query = query.ilike('note', `%${sp.q}%`)
  if (sp.type)     query = query.eq('type', sp.type)
  if (sp.account)  query = query.eq('account_id', sp.account)
  if (sp.category) query = query.eq('category_id', sp.category)

  const { data: transactions, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Link href="/transactions/new"><Button><Plus size={16} className="mr-2" />Add</Button></Link>
      </div>
      <Suspense>
        <TransactionFilters accounts={accounts ?? []} categories={categories ?? []} />
      </Suspense>
      <TransactionList transactions={transactions ?? []} categories={categories ?? []} accounts={accounts ?? []} currency={profile?.currency ?? 'USD'} />
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`/transactions?page=${p}`}>
              <Button variant={p === page ? 'default' : 'ghost'} size="sm">{p}</Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
