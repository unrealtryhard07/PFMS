import { createServerClient } from '@/lib/supabase/server'
import { CsvImporter } from '@/components/import/CsvImporter'

export default async function ImportPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: accounts } = await supabase
    .from('accounts')
    .select('id,name')
    .eq('user_id', user!.id)
    .is('archived_at', null)
    .order('name')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Import transactions</h1>
        <p className="text-text-muted text-sm mt-1">
          Upload a CSV file, map columns, preview, then import.
        </p>
      </div>
      {(accounts ?? []).length === 0 ? (
        <p className="text-text-muted text-sm">
          Create at least one account in Settings → Accounts before importing.
        </p>
      ) : (
        <CsvImporter accounts={accounts ?? []} />
      )}
    </div>
  )
}
