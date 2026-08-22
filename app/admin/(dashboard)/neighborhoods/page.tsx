import { createAdminClient } from '@/lib/supabase/admin'
import { LookupManager } from '@/components/lookup-manager'

export default async function NeighborhoodsPage() {
  const supabase = createAdminClient()
  const { data: neighborhoods } = await supabase
    .from('neighborhoods')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Neighborhoods</h1>
        <p className="text-muted-foreground">
          The neighborhood list used on places, events, and profiles.
        </p>
      </div>
      <LookupManager
        table="neighborhoods"
        itemLabel="Neighborhood"
        hasSortOrder={false}
        initialRows={neighborhoods ?? []}
      />
    </div>
  )
}
