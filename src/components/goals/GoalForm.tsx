'use client'
import { useTransition } from 'react'
import { createGoalAction } from '@/lib/actions/goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const ICONS = [
  'target', 'piggy-bank', 'home', 'car', 'plane',
  'graduation-cap', 'heart', 'star', 'gift', 'laptop',
]

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
]

export function GoalForm() {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createGoalAction(fd)
      if (result && result.error) toast.error(result.error)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Goal name</Label>
        <Input id="name" name="name" required placeholder="e.g. Emergency Fund" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target_amount">Target amount</Label>
        <Input
          id="target_amount"
          name="target_amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (optional)</Label>
        <Input id="deadline" name="deadline" type="date" />
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map((icon, i) => (
            <label key={icon} className="cursor-pointer">
              <input
                type="radio"
                name="icon"
                value={icon}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span className="block px-3 py-1.5 rounded-lg border border-border text-xs transition-colors [input:checked+&]:border-accent [input:checked+&]:text-accent">
                {icon}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input
                type="radio"
                name="color"
                value={c}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span
                className="block w-7 h-7 rounded-full border-2 border-transparent transition-all [input:checked+&]:border-white"
                style={{ backgroundColor: c }}
              />
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create goal'}
      </Button>
    </form>
  )
}
