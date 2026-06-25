'use client'
import { useTransition } from 'react'
import { createAccountAction } from '@/lib/actions/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4']

export function AccountForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createAccountAction(fd)
      if (result.error) { toast.error(result.error); return }
      toast.success('Account created')
      ;(e.target as HTMLFormElement).reset()
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account name</Label>
        <Input id="name" name="name" required placeholder="e.g. Main Wallet" />
      </div>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select name="type" defaultValue="bank">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['cash','bank','credit','savings','investment'].map((t) => (
              <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="starting_balance">Starting balance</Label>
        <Input id="starting_balance" name="starting_balance" type="number" step="0.01" defaultValue="0" />
      </div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={i === 0} className="sr-only" />
              <span className="block w-7 h-7 rounded-full border-2 border-transparent has-[:checked]:border-white transition-all" style={{ backgroundColor: c }} />
            </label>
          ))}
        </div>
      </div>
      <input type="hidden" name="icon" value="wallet" />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create account'}
      </Button>
    </form>
  )
}
