import { createServerClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/settings/ProfileForm'

export default async function SettingsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name,currency')
    .eq('id', user!.id)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <section>
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <ProfileForm
          defaultName={profile?.full_name ?? ''}
          defaultCurrency={profile?.currency ?? 'USD'}
        />
      </section>
    </div>
  )
}
