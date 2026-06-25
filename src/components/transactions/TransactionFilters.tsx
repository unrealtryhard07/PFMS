'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Account, Category } from '@/types'

export function TransactionFilters({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  const router   = useRouter()
  const pathname = usePathname()
  const params   = useSearchParams()

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    router.push(`${pathname}?${next.toString()}`)
  }

  function selectUpdate(key: string, v: string | null) {
    update(key, v != null && v !== 'all' ? v : '')
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Input
        placeholder="Search notes…"
        defaultValue={params.get('q') ?? ''}
        onChange={(e) => update('q', e.target.value)}
        className="w-48"
      />
      <Select value={params.get('type') ?? 'all'} onValueChange={(v) => selectUpdate('type', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="All types" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="income">Income</SelectItem>
          <SelectItem value="expense">Expense</SelectItem>
          <SelectItem value="transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>
      <Select value={params.get('account') ?? 'all'} onValueChange={(v) => selectUpdate('account', v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="All accounts" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All accounts</SelectItem>
          {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={params.get('category') ?? 'all'} onValueChange={(v) => selectUpdate('category', v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="All categories" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>Clear</Button>
    </div>
  )
}
