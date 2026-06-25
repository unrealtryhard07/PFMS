import { createServerClient } from '@/lib/supabase/server'
import { AccountForm } from '@/components/settings/AccountForm'
import { archiveAccountAction } from '@/lib/actions/accounts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'

export default async function AccountsSettingsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const [{ data: profile }, { data: accounts }] = await Promise.all([
    supabase.from('profiles').select('currency').eq('id', user!.id).single(),
    supabase.from('accounts').select('*').is('archived_at', null).order('created_at'),
  ])
  const currency = profile?.currency ?? 'USD'

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Accounts</h1>
      <Card className="bg-surface border-border">
        <CardHeader><CardTitle>New account</CardTitle></CardHeader>
        <CardContent><AccountForm /></CardContent>
      </Card>
      <div className="space-y-3">
        {(accounts ?? []).map((account) => (
          <Card key={account.id} className="bg-surface border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: account.color }} />
                <div>
                  <p className="font-medium">{account.name}</p>
                  <p className="text-xs text-text-muted capitalize">{account.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">{formatCurrency(Number(account.starting_balance), currency)}</span>
                <form action={archiveAccountAction.bind(null, account.id)}>
                  <Button variant="ghost" size="sm" className="text-danger hover:text-danger text-xs">Archive</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {(accounts ?? []).length === 0 && (
          <p className="text-text-muted text-sm text-center py-8">No accounts yet.</p>
        )}
      </div>
    </div>
  )
}
