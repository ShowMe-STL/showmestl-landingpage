import { createAdminClient } from '@/lib/supabase/admin'
import { LookupManager } from '@/components/lookup-manager'

export default async function DressCodesPage() {
  const supabase = createAdminClient()
  const { data: dressCodes } = await supabase
    .from('dress_codes')
    .select('id, name, sort_order')
    .order('sort_order')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dress codes</h1>
        <p className="text-muted-foreground">
          Canonical dress-code labels places and events can use.
        </p>
      </div>
      <LookupManager
        table="dress_codes"
        itemLabel="Dress code"
        initialRows={dressCodes ?? []}
      />
    </div>
  )
}
