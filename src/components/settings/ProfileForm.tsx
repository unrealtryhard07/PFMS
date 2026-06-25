'use client'
import { useState, useTransition } from 'react'
import { updateProfileAction } from '@/lib/actions/profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'QAR', label: 'QAR — Qatari Riyal' },
  { code: 'BHD', label: 'BHD — Bahraini Dinar' },
  { code: 'OMR', label: 'OMR — Omani Rial' },
  { code: 'EGP', label: 'EGP — Egyptian Pound' },
]

interface Props {
  defaultName: string
  defaultCurrency: string
}

export function ProfileForm({ defaultName, defaultCurrency }: Props) {
  const [isPending, startTransition] = useTransition()
  const [currency, setCurrency] = useState(defaultCurrency)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set('currency', currency)
    startTransition(async () => {
      const result = await updateProfileAction(fd)
      if (result.error) toast.error(result.error)
      else toast.success('Profile updated')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
      <div className="space-y-2">
        <Label htmlFor="full_name">Display name</Label>
        <Input
          id="full_name"
          name="full_name"
          defaultValue={defaultName}
          required
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Default currency</Label>
        <Select
          value={currency}
          onValueChange={(v) => { if (v != null) setCurrency(v) }}
        >
          <SelectTrigger id="currency">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Saving…' : 'Save profile'}
      </Button>
    </form>
  )
}
