'use client'
import { useTransition } from 'react'
import { createCategoryAction } from '@/lib/actions/categories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const ICONS = ['utensils','car','shopping-bag','zap','heart','film','book','plane','briefcase','laptop','circle','home','coffee','gift']
const COLORS = ['#10b981','#06b6d4','#f59e0b','#6366f1','#ec4899','#ef4444','#14b8a6','#8b5cf6','#3b82f6','#f97316','#64748b']

export function CategoryForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createCategoryAction(fd)
      if (result.error) { toast.error(result.error); return }
      toast.success('Category created')
      ;(e.target as HTMLFormElement).reset()
      onSuccess?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Name</Label>
        <Input id="cat-name" name="name" required placeholder="e.g. Gym" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select name="type" defaultValue="expense">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <Select name="icon" defaultValue="circle">
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ICONS.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
          </Select>
        </div>
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
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create category'}
      </Button>
    </form>
  )
}
