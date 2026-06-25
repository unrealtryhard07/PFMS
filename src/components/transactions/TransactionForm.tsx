'use client'
import { useState, useTransition } from 'react'
import { addTransactionAction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Account, Category, SavingsGoal, TransactionType } from '@/types'

interface Props {
  accounts: Account[]
  categories: Category[]
  goals: SavingsGoal[]
  defaultGoalId?: string
}

export function TransactionForm({ accounts, categories, goals, defaultGoalId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [type, setType] = useState<TransactionType>('expense')
  const [isRecurring, setIsRecurring] = useState(false)

  const filteredCategories = categories.filter((c) => type !== 'transfer' && c.type === type)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('type', type)
    startTransition(async () => {
      const result = await addTransactionAction(fd)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
        <TabsList className="w-full">
          <TabsTrigger value="expense"  className="flex-1">Expense</TabsTrigger>
          <TabsTrigger value="income"   className="flex-1">Income</TabsTrigger>
          <TabsTrigger value="transfer" className="flex-1">Transfer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required placeholder="0.00" />
      </div>

      <div className="space-y-2">
        <Label>Account</Label>
        <Select name="account_id" required>
          <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
          <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {type === 'transfer' && (
        <div className="space-y-2">
          <Label>To account</Label>
          <Select name="to_account_id" required>
            <SelectTrigger><SelectValue placeholder="Destination account" /></SelectTrigger>
            <SelectContent>{accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {type !== 'transfer' && filteredCategories.length > 0 && (
        <div className="space-y-2">
          <Label>Category</Label>
          <Select name="category_id">
            <SelectTrigger><SelectValue placeholder="Select category (optional)" /></SelectTrigger>
            <SelectContent>{filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {type === 'expense' && goals.length > 0 && (
        <div className="space-y-2">
          <Label>Savings goal (optional)</Label>
          <Select name="goal_id" defaultValue={defaultGoalId}>
            <SelectTrigger><SelectValue placeholder="Attach to goal" /></SelectTrigger>
            <SelectContent>{goals.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" name="date" type="date" required defaultValue={format(new Date(), 'yyyy-MM-dd')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Input id="note" name="note" placeholder="Optional description" maxLength={200} />
      </div>

      {type !== 'transfer' && (
        <div className="flex items-center gap-3">
          <input id="is_recurring" name="is_recurring" type="checkbox" className="rounded"
            checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
          <Label htmlFor="is_recurring">Recurring transaction</Label>
        </div>
      )}

      {isRecurring && (
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select name="frequency" defaultValue="monthly">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save transaction'}
      </Button>
    </form>
  )
}
