import { createServerClient } from '@/lib/supabase/server'
import { CategoryForm } from '@/components/settings/CategoryForm'
import { archiveCategoryAction } from '@/lib/actions/categories'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function CategoriesSettingsPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: categories } = await supabase
    .from('categories').select('*')
    .or(`user_id.eq.${user!.id},user_id.is.null`)
    .is('archived_at', null).order('type').order('name')

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Categories</h1>
      <Card className="bg-surface border-border">
        <CardHeader><CardTitle>New category</CardTitle></CardHeader>
        <CardContent><CategoryForm /></CardContent>
      </Card>
      <div className="space-y-2">
        {(categories ?? []).map((cat) => (
          <Card key={cat.id} className="bg-surface border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium">{cat.name}</span>
                <Badge variant="secondary" className="text-xs capitalize">{cat.type}</Badge>
                {!cat.user_id && <Badge variant="outline" className="text-xs">System</Badge>}
              </div>
              {cat.user_id && (
                <form action={archiveCategoryAction.bind(null, cat.id)}>
                  <Button variant="ghost" size="sm" className="text-danger hover:text-danger text-xs">Archive</Button>
                </form>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
