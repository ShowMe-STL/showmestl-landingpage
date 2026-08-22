import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// Service-role client. Bypasses RLS entirely — this is what lets the
// dashboard write to places/events/categories, which have no client-write
// policies by design (see supabase/migrations in showmestl-mobile).
// Import only from Server Components, Server Actions, or Route Handlers.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
