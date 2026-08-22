import { createAdminClient } from '@/lib/supabase/admin'
import { LookupManager } from '@/components/lookup-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function CategoriesPage() {
  const supabase = createAdminClient()
  const [placeCategories, eventCategories] = await Promise.all([
    supabase
      .from('place_categories')
      .select('id, name, sort_order')
      .order('sort_order'),
    supabase
      .from('event_categories')
      .select('id, name, sort_order')
      .order('sort_order'),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-muted-foreground">
          Places and events each have their own category list.
        </p>
      </div>
      <Tabs defaultValue="places">
        <TabsList>
          <TabsTrigger value="places">Place categories</TabsTrigger>
          <TabsTrigger value="events">Event categories</TabsTrigger>
        </TabsList>
        <TabsContent value="places" className="pt-4">
          <LookupManager
            table="place_categories"
            itemLabel="Category"
            initialRows={placeCategories.data ?? []}
          />
        </TabsContent>
        <TabsContent value="events" className="pt-4">
          <LookupManager
            table="event_categories"
            itemLabel="Category"
            initialRows={eventCategories.data ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
